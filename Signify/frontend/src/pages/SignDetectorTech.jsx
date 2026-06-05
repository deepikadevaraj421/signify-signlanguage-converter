import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/Authcontext";
import axios from "axios";
import "../signify-tech.css";

export default function SignDetectorTech() {
  const webcamRef = useRef(null);
  const { user } = useAuth();
  
  const [detectedSign, setDetectedSign] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const simulateDetection = () => {
    const signs = alphabet;
    const randomSign = signs[Math.floor(Math.random() * signs.length)];
    const randomConfidence = 0.85 + Math.random() * 0.15;
    
    setDetectedSign(randomSign);
    setConfidence(randomConfidence);
    saveGesture(randomSign, randomConfidence);
  };

  const saveGesture = async (sign, conf) => {
    try {
      const token = localStorage.getItem("signify_token");
      await axios.post("http://localhost:5000/api/gestures/save", 
        { gesture: sign, confidence: conf },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save gesture:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (isDetecting) {
      interval = setInterval(simulateDetection, 2000);
    }
    return () => clearInterval(interval);
  }, [isDetecting]);

  return (
    <div className="signify-app">
      <header className="signify-header">
        <div className="signify-logo">SIGNIFY</div>
        <div className="signify-tagline">Detect. Understand. Connect.</div>
      </header>

      <section className="hero-section">
        <div className="webcam-container">
          <Webcam ref={webcamRef} className="webcam-feed" />
        </div>

        <div className="controls">
          {!isDetecting ? (
            <button onClick={() => setIsDetecting(true)} className="btn-tech">
              START DETECTION
            </button>
          ) : (
            <button onClick={() => setIsDetecting(false)} className="btn-tech">
              STOP DETECTION
            </button>
          )}
        </div>

        {detectedSign && (
          <div className="detection-display">
            <div className="detected-letter">{detectedSign}</div>
            <div className="confidence-container">
              <div className="confidence-label">
                CONFIDENCE: {(confidence * 100).toFixed(1)}%
              </div>
              <div className="confidence-bar">
                <div className="confidence-fill" style={{ width: `${confidence * 100}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="alphabet-section">
        <h2 className="alphabet-title">ASL ALPHABET REFERENCE</h2>
        <div className="alphabet-grid">
          {alphabet.map((letter) => (
            <div key={letter} className="alphabet-card">
              {letter}
            </div>
          ))}
        </div>
      </section>

      <footer className="signify-footer">
        <p className="footer-mission">
          <strong>Our Mission:</strong> Empowering communication through cutting-edge AI technology. 
          Signify bridges the gap between sign language users and the hearing community, 
          making conversations accessible for everyone, everywhere.
        </p>
      </footer>
    </div>
  );
}
