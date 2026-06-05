import React, { useRef, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import "./SignToText.css";

function SignToText() {
  const videoRef = useRef(null);

  const [detectedText, setDetectedText] = useState("Waiting for ASL sign...");
  const [cameraOn, setCameraOn] = useState(false);
  const [gestureHistory, setGestureHistory] = useState([]);

  const validGestures = [
    "YES",
    "NO",
    "STOP",
    "GOOD",
    "OK",
    "HELP",
    "WATER",
    "FRIEND",
    "PLEASE",
    "THANK YOU",
  ];

  // 🔹 Add to History (Avoid duplicates)
  const addToHistory = (word) => {
    if (!validGestures.includes(word)) return;

    setGestureHistory((prev) => {
      if (prev[prev.length - 1] === word) return prev;
      return [...prev, word];
    });
  };

  // 🔹 MediaPipe Logic
  useEffect(() => {
    if (!cameraOn) return;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      if (!results.multiHandLandmarks?.length) {
        setDetectedText("No Hand");
        return;
      }

      const lm = results.multiHandLandmarks[0];

      const thumbUp = lm[4].y < lm[3].y;
      const indexUp = lm[8].y < lm[6].y;
      const middleUp = lm[12].y < lm[10].y;
      const ringUp = lm[16].y < lm[14].y;
      const pinkyUp = lm[20].y < lm[18].y;

      const fist =
        !thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp;

      const openPalm =
        thumbUp && indexUp && middleUp && ringUp && pinkyUp;

      const nearFace = lm[0].y < 0.6;

      const detect = (word) => {
        setDetectedText(word);
        addToHistory(word);
      };

      if (openPalm && nearFace) return detect("THANK YOU");
      if (openPalm) return detect("STOP");
      if (fist) return detect("YES");
      if (indexUp && middleUp && !ringUp && !pinkyUp)
        return detect("NO");
      if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp)
        return detect("GOOD");
      if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp)
        return detect("OK");
      if (indexUp && middleUp && ringUp && !pinkyUp)
        return detect("WATER");
      if (indexUp && !middleUp && !ringUp && !pinkyUp)
        return detect("FRIEND");
      if (indexUp && middleUp && !ringUp && pinkyUp)
        return detect("PLEASE");
      if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp)
        return detect("HELP");

      setDetectedText("Hand Detected");
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [cameraOn]);

  // 🔊 Speak Full Sentence (History)
  const speakText = async () => {
    try {
      if (gestureHistory.length === 0) {
        alert("No signs detected yet.");
        return;
      }

      const fullSentence = gestureHistory.join(" ");

      const response = await fetch(
        "https://v0gnzlbhhi.execute-api.us-east-1.amazonaws.com/speak",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: fullSentence }),
        }
      );

      if (!response.ok) throw new Error("Server error");

      const audioData = await response.arrayBuffer();
      const audioBlob = new Blob([audioData], {
        type: "audio/mpeg",
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      await audio.play();

    } catch (error) {
      console.error("Audio error:", error);
      alert("Audio generation failed.");
    }
  };

  // 🧹 Clear History
  const clearHistory = () => {
    setGestureHistory([]);
    setDetectedText("Waiting for ASL sign...");
  };

  return (
    <>
      <div className="pageHeader">
        <div className="pageHeaderBrand">signify</div>
      </div>
      <div className="sign-container">
      <h2>
        American Sign Language ➜ Text / Audio
        {cameraOn && <span className="live-indicator"></span>}
      </h2>

      <div className="main-layout">
        {/* LEFT SIDE - Camera */}
        <div className="left-panel">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera"
          />

          <div className="detected-box">
            {detectedText}
          </div>

          <div className="button-group">
            {!cameraOn ? (
              <button onClick={() => setCameraOn(true)}>
                Start Camera
              </button>
            ) : (
              <button onClick={() => setCameraOn(false)}>
                Stop Camera
              </button>
            )}

            <button onClick={speakText}>
              Convert to Audio
            </button>

            <button
              onClick={clearHistory}
              className="clear-btn"
            >
              Clear
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - History */}
        <div className="right-panel">
          <h3>Sign History</h3>
          <div className="history-content">
            {gestureHistory.length === 0
              ? "No signs yet..."
              : gestureHistory.join(" ")}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default SignToText;
