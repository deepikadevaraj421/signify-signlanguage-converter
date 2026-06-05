import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/Authcontext";
import axios from "axios";
import "../signify-editorial.css";

export default function SignDetectorEditorial() {
  const webcamRef = useRef(null);
  const { user } = useAuth();
  
  const [detectedSign, setDetectedSign] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const simulateDetection = () => {
    const randomSign = alphabet[Math.floor(Math.random() * alphabet.length)];
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
    <div className="signify-editorial">
      <header className="editorial-header">
        <div className="editorial-logo">SIGNIFY</div>
        <nav className="editorial-nav">
          <a href="/dashboard" className="editorial-nav-link">Dashboard</a>
          <a href="#alphabet" className="editorial-nav-link">Alphabet</a>
          <a href="#how" className="editorial-nav-link">How It Works</a>
        </nav>
      </header>

      <section className="editorial-hero">
        <div className="webcam-section">
          <Webcam ref={webcamRef} className="webcam-editorial" />
        </div>
        <div className="detection-panel">
          {detectedSign ? (
            <>
              <div className="rotating-letter">{detectedSign}</div>
              <div className="detection-label">Detected Sign</div>
            </>
          ) : (
            <div className="detection-label">Awaiting Detection...</div>
          )}
        </div>
      </section>

      {detectedSign && (
        <div className="detection-strip">
          <div className="strip-text">DETECTING: {detectedSign}</div>
        </div>
      )}

      <div className="editorial-controls">
        {!isDetecting ? (
          <button onClick={() => setIsDetecting(true)} className="btn-editorial">
            Start Detection
          </button>
        ) : (
          <button onClick={() => setIsDetecting(false)} className="btn-editorial">
            Stop Detection
          </button>
        )}
      </div>

      {detectedSign && (
        <div className="confidence-editorial">
          <div className="confidence-label-editorial">
            Confidence: {(confidence * 100).toFixed(1)}%
          </div>
          <div className="confidence-track">
            <div className="confidence-lime-fill" style={{ width: `${confidence * 100}%` }}></div>
          </div>
        </div>
      )}

      <section className="alphabet-editorial" id="alphabet">
        <h2 className="alphabet-title-editorial">ASL Alphabet</h2>
        <div className="alphabet-grid-editorial">
          {alphabet.map((letter) => (
            <div key={letter} className="alphabet-card-editorial">
              <div className="card-letter-editorial">{letter}</div>
              <div className="card-emoji-editorial">✋</div>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works" id="how">
        <h2 className="how-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-title">Activate Camera</div>
            <div className="step-text">
              Enable your webcam and position your hand in the frame. Our AI begins analyzing in real-time.
            </div>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <div className="step-title">Sign Detection</div>
            <div className="step-text">
              Perform ASL signs. Advanced machine learning instantly recognizes and translates your gestures.
            </div>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <div className="step-title">Instant Results</div>
            <div className="step-text">
              See detected letters with confidence scores. Build words, communicate, and connect effortlessly.
            </div>
          </div>
        </div>
      </section>

      <footer className="editorial-footer">
        <p className="footer-text">© 2024 SIGNIFY — Breaking Communication Barriers</p>
        <div className="social-icons">
          <span className="social-icon">📱</span>
          <span className="social-icon">💬</span>
          <span className="social-icon">🌐</span>
        </div>
      </footer>
    </div>
  );
}
