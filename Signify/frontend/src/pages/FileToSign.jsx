import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TextToSign.css";

function normalizeSentence(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FileToSign() {
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [transcript, setTranscript] = useState("");

  const [queueWords, setQueueWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const [showVariants, setShowVariants] = useState(false);

  const signVideoRef = useRef(null);

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

  const mapByWord = useMemo(() => {
    const m = new Map();
    for (const item of data) {
      if (!m.has(item.word)) m.set(item.word, []);
      m.get(item.word).push({ sign_type: item.sign_type, file_path: item.file_path });
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

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (fileUrl) URL.revokeObjectURL(fileUrl);

    const url = URL.createObjectURL(f);
    setFile(f);
    setFileUrl(url);

    if (f.type.startsWith("audio/")) setFileType("audio");
    else if (f.type.startsWith("video/")) setFileType("video");
    else setFileType("");

    setQueueWords([]);
    setWordIndex(0);
    setVariantIndex(0);
    setShowVariants(false);
  };

  const clearAll = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl("");
    setFileType("");
    setTranscript("");
    setQueueWords([]);
    setWordIndex(0);
    setVariantIndex(0);
    setShowVariants(false);
  };

  const currentWordObj = queueWords[wordIndex];
  const currentVariants = currentWordObj?.variants || [];
  const currentVariant = currentVariants[variantIndex];
  const currentWordUpper = currentWordObj?.word ? currentWordObj.word.toUpperCase() : "";

  const replay = () => {
    if (!currentVariant) return;
    if (currentVariant.sign_type === "video" && signVideoRef.current) {
      signVideoRef.current.currentTime = 0;
      signVideoRef.current.play().catch(() => {});
    }
  };

  const prevVariant = () => {
    if (queueWords.length === 0) return;
    if (currentVariants.length > 1) {
      setVariantIndex((v) => (v - 1 + currentVariants.length) % currentVariants.length);
    }
  };

  const nextVariant = () => {
    if (queueWords.length === 0) return;
    if (currentVariants.length > 1) {
      setVariantIndex((v) => (v + 1) % currentVariants.length);
    }
  };

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

  return (
    <>
      <div className="pageHeader">
        <div className="pageHeaderBrand">signify</div>
      </div>
      <div className="grid">
      <section className="card">
        <div className="cardTitle">File Input</div>

        <label className="label">Upload audio or video</label>
        <input type="file" accept="audio/*,video/*" onChange={onPickFile} />

        <div className="smallText" style={{ marginTop: 8 }}>
          {file ? (
            <>
              Selected: <b>{file.name}</b> ({fileType || "unknown"})
            </>
          ) : (
            "No file selected"
          )}
        </div>

        {fileUrl && fileType === "audio" && (
          <div style={{ marginTop: 12 }}>
            <audio controls src={fileUrl} style={{ width: "100%" }} />
          </div>
        )}

        {fileUrl && fileType === "video" && (
          <div style={{ marginTop: 12 }}>
            <video controls src={fileUrl} style={{ width: "100%", borderRadius: 12 }} />
          </div>
        )}

        <div className="divider" />

        <label className="label">Transcript / Description</label>
        <textarea
          className="textarea"
          rows={3}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder='Type the transcript (example: "i need a doctor")'
        />

        <div className="row">
          <button className="btnPrimary" onClick={() => buildQueue(transcript)}>
            Convert
          </button>
          <button className="btnSecondary" onClick={clearAll}>
            Clear
          </button>
        </div>

        <div className="smallText" style={{ marginTop: 6 }}>
          Prototype note: for files, auto-transcription needs backend (AWS Transcribe / Whisper). Here we use transcript input.
        </div>
      </section>

      <section className="card">
        <div className="outputHeader">
          <div>
            <div className="cardTitle">Sign Output</div>

            {queueWords.length > 0 && currentWordObj ? (
              <>
                <div className="currentWord">{currentWordUpper}</div>
                <div className="smallText">
                  Word {wordIndex + 1} of {queueWords.length} • Variant {variantIndex + 1} /{" "}
                  {currentVariants.length}
                </div>
              </>
            ) : (
              <div className="smallText">Waiting for transcript</div>
            )}
          </div>

          <button
            className="btnVariant"
            onClick={() => setShowVariants((v) => !v)}
            disabled={!currentWordObj || currentVariants.length <= 1}
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
                  onClick={() => setVariantIndex(i)}
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
              <img className="media" src={currentVariant.file_path} alt="sign" />
            ) : (
              <video
                ref={signVideoRef}
                className="media"
                src={currentVariant.file_path}
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
          <button className="btnSecondary" onClick={prevVariant} disabled={queueWords.length === 0 || currentVariants.length <= 1}>
            Prev
          </button>
          <button className="btnPrimary" onClick={replay} disabled={!currentVariant}>
            Replay
          </button>
          <button className="btnPrimaryBlue" onClick={nextVariant} disabled={queueWords.length === 0 || currentVariants.length <= 1}>
            Next
          </button>
        </div>

        <div className="smallText">
          Next/Prev changes variant. Video end moves to next word if multiple words exist.
        </div>
      </section>
    </div>
    </>
  );
}
