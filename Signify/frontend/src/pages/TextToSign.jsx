import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TextToSign.css";

function normalizeSentence(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function TextToSign() {
  const [data, setData] = useState([]);

  const [typedText, setTypedText] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [listening, setListening] = useState(false);

  // Queue: [{ word, variants: [{sign_type,file_path}, ...] }, ...]
  const [queueWords, setQueueWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);

  const [showVariants, setShowVariants] = useState(false);

  const videoRef = useRef(null);

  // Load CSV from public/isl_mapping.csv
  useEffect(() => {
    fetch("/isl_mapping.csv")
      .then((res) => res.text())
      .then((csv) => {
        const rows = csv.split("\n").slice(1);
        const parsed = rows
          .map((r) => r.trim())
          .filter(Boolean)
          .map((r) => {
            const [word, sign_type, file_path] = r.split(",");
            return {
              word: (word || "").trim().toLowerCase(),
              sign_type: (sign_type || "").trim(),
              file_path: (file_path || "").trim(),
            };
          })
          .filter((x) => x.word && x.sign_type && x.file_path);

        setData(parsed);
      })
      .catch(() => setData([]));
  }, []);

  // Build map: word -> list of variants
  const mapByWord = useMemo(() => {
    const m = new Map();
    for (const item of data) {
      if (!m.has(item.word)) m.set(item.word, []);
      m.get(item.word).push({
        sign_type: item.sign_type,
        file_path: item.file_path,
      });
    }
    return m;
  }, [data]);

  const buildQueue = (sentence) => {
    const cleaned = normalizeSentence(sentence);

    if (!cleaned) {
      setQueueWords([]);
      setWordIndex(0);
      setVariantIndex(0);
      setShowVariants(false);
      return;
    }

    const words = cleaned.split(" ");
    const result = [];

    for (const w of words) {
      const variants = mapByWord.get(w);
      if (!variants || variants.length === 0) continue;
      result.push({ word: w, variants });
    }

    setQueueWords(result);
    setWordIndex(0);
    setShowVariants(false);

    if (result.length > 0) {
      const vars = result[0].variants;
      setVariantIndex(vars.length > 1 ? Math.floor(Math.random() * vars.length) : 0);
    } else {
      setVariantIndex(0);
    }
  };

  // ✅ ONE common Convert button:
  // - If voice text exists -> convert voice
  // - else convert typed text
  const handleConvert = () => {
    const voice = recognizedText.trim();
    const typed = typedText.trim();

    if (voice.length > 0) {
      buildQueue(voice);
      return;
    }

    if (typed.length > 0) {
      buildQueue(typed);
      return;
    }

    alert("Please type or speak something before converting.");
  };

  // Clear everything (text + voice + output)
  const clearAll = () => {
    setTypedText("");
    setRecognizedText("");
    setQueueWords([]);
    setWordIndex(0);
    setVariantIndex(0);
    setShowVariants(false);
  };

  // Current display
  const currentWordObj = queueWords[wordIndex];
  const currentVariants = currentWordObj?.variants || [];
  const currentVariant = currentVariants[variantIndex];
  const currentWordUpper = currentWordObj?.word ? currentWordObj.word.toUpperCase() : "";

  const replay = () => {
    if (!currentVariant) return;
    if (currentVariant.sign_type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Prev/Next cycles variants for SAME WORD
  const prev = () => {
    if (queueWords.length === 0) return;
    if (currentVariants.length > 1) {
      setVariantIndex((v) => (v - 1 + currentVariants.length) % currentVariants.length);
    }
  };

  const next = () => {
    if (queueWords.length === 0) return;
    if (currentVariants.length > 1) {
      setVariantIndex((v) => (v + 1) % currentVariants.length);
    }
  };

  // Auto-next word when video ends (only if multiple words)
  const handleEnded = () => {
    if (queueWords.length <= 1) return;
    if (wordIndex < queueWords.length - 1) {
      const newWordIndex = wordIndex + 1;
      setWordIndex(newWordIndex);
      const vars = queueWords[newWordIndex].variants;
      setVariantIndex(vars.length > 1 ? Math.floor(Math.random() * vars.length) : 0);
      setShowVariants(false);
    }
  };

  // Speech recognition
  const startSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome browser.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;

    setListening(true);

    rec.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setRecognizedText(transcript.trim());
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
  };

  const pickVariant = (i) => setVariantIndex(i);

  return (
    <>
      <div className="pageHeader">
        <div className="pageHeaderBrand">signify</div>
      </div>
      <div className="grid">
      {/* INPUT */}
      <section className="card">
        <div className="cardTitle">Input</div>

        <label className="label">Type a sentence</label>
        <textarea
          className="textarea"
          rows={3}
          value={typedText}
          onChange={(e) => setTypedText(e.target.value)}
          placeholder='Example: "i need a doctor"'
        />

        {/* ✅ Common buttons for BOTH text + voice */}
        <div className="row">
          <button className="btnPrimary" onClick={handleConvert}>
            Convert
          </button>

          <button className="btnSecondary" onClick={clearAll}>
            Clear
          </button>

          <button className="btnOutline" onClick={startSpeech}>
            {listening ? "Listening..." : "Start voice"}
          </button>
        </div>

        <div className="smallText" style={{ marginTop: "6px" }}>
          Type or speak. Press Convert to process.
        </div>

        <div className="divider" />

        <div className="speechBox">
          <div className="smallLabel">Recognized text</div>
          <div className="speechText">{recognizedText || "—"}</div>
        </div>
      </section>

      {/* OUTPUT */}
      <section className="card">
        <div className="outputHeader">
          <div>
            <div className="cardTitle">Output</div>

            {queueWords.length > 0 && currentWordObj ? (
              <>
                <div className="currentWord">{currentWordUpper}</div>
                <div className="smallText">
                  Word {wordIndex + 1} of {queueWords.length} • Variant {variantIndex + 1} /{" "}
                  {currentVariants.length}
                </div>
              </>
            ) : (
              <div className="smallText">Waiting for input</div>
            )}
          </div>

          <button
            className="btnVariant"
            onClick={() => setShowVariants((v) => !v)}
            disabled={!currentWordObj || currentVariants.length <= 1}
            title={currentVariants.length <= 1 ? "No variants" : "Show variants"}
          >
            Variant
          </button>
        </div>

        {showVariants && currentVariants.length > 1 && (
          <div className="variantPanel">
            <div className="smallLabel">All variants for {currentWordUpper}</div>
            <div className="variantGrid">
              {currentVariants.map((_, i) => (
                <button
                  key={i}
                  className={`variantBtn ${i === variantIndex ? "activeVariant" : ""}`}
                  onClick={() => pickVariant(i)}
                >
                  Variant {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="viewer">
          {currentVariant ? (
            currentVariant.sign_type === "image" ? (
              <img className="media" src={(import.meta.env.VITE_DATASET_URL || "") + currentVariant.file_path} alt="sign" />
            ) : (
              <video
                ref={videoRef}
                className="media"
                src={(import.meta.env.VITE_DATASET_URL || "") + currentVariant.file_path}
                autoPlay
                controls
                playsInline
                onEnded={handleEnded}
              />
            )
          ) : (
            <div className="empty">No sign to display</div>
          )}
        </div>

        <div className="controls">
          <button
            className="btnSecondary"
            onClick={prev}
            disabled={queueWords.length === 0 || currentVariants.length <= 1}
          >
            Prev
          </button>

          <button className="btnPrimary" onClick={replay} disabled={!currentVariant}>
            Replay
          </button>

          <button
            className="btnPrimaryBlue"
            onClick={next}
            disabled={queueWords.length === 0 || currentVariants.length <= 1}
          >
            Next
          </button>
        </div>

        <div className="smallText">
          Next/Prev changes variants of the current word. If the sentence has multiple words, video end moves to the next word automatically.
        </div>
      </section>
    </div>
    </>
  );
}
