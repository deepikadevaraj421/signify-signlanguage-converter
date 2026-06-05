import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/Authcontext";
import axios from "axios";
import "../signify-warm.css";

export default function SignDetectorWarm() {
  const webcamRef = useRef(null);
  const { user } = useAuth();
  
  const [detectedSign, setDetectedSign] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  const alphabet = [
    { letter: "A", emoji: "👆" }, { letter: "B", emoji: "✋" }, { letter: "C", emoji: "🤏" },
    { letter: "D", emoji: "☝️" }, { letter: "E", emoji: "✊" }, { letter: "F", emoji: "👌" },
    { letter: "G", emoji: "👈" }, { letter: "H", emoji: "🤞" }, { letter: "I", emoji: "🤙" },
    { letter: "J", emoji: "🤙" }, { letter: "K", emoji: "✌️" }, { letter: "L", emoji: "👍" },
    { letter: "M", emoji: "✊" }, { letter: "N", emoji: "✊" }, { letter: "O", emoji: "👌" },
    { letter: "P", emoji: "👇" }, { letter: "Q", emoji: "👇" }, { letter: "R", emoji: "🤞" },
    { letter: "S", emoji: "✊" }, { letter: "T", emoji: "👊" }, { letter: "U", emoji: "✌️" },
    { letter: "V", emoji: "✌️" }, { letter: "W", emoji: "🤟" }, { letter: "X", emoji: "☝️" },
    { letter: "Y", emoji: "🤙" }, { letter: "Z", emoji: "👈" }
  ];

  const simulateDetection = () => {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    const randomSign = alphabet[randomIndex].letter;
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
    <div className="signify-warm">
      <nav className="warm-nav">
        <div className="warm-logo">
          <span className="wave-icon">👋</span>
          Signify
        </div>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="#alphabet" className="nav-link">Learn ASL</a>
          <a href="#mission" className="nav-link">Our Mission</a>
        </div>
      </nav>

      <section className="hero-warm">
        <div className="hero-content">
          <h1>Breaking Barriers, One Sign at a Time</h1>
          <p>Experience real-time sign language detection powered by AI. Connect, communicate, and understand like never before.</p>
          <div className="warm-controls">
            {!isDetecting ? (
              <button onClick={() => setIsDetecting(true)} className="btn-warm">
                Start Detection
              </button>
            ) : (
              <button onClick={() => setIsDetecting(false)} className="btn-warm">
                Stop Detection
              </button>
            )}
          </div>
        </div>
        <div className="webcam-card">
          <Webcam ref={webcamRef} className="webcam-warm" />
        </div>
      </section>

      {detectedSign && (
        <section className="detection-warm">
          <div className="detected-badge">{detectedSign}</div>
          <div className="confidence-warm">
            <div className="confidence-text">
              Confidence: {(confidence * 100).toFixed(1)}%
            </div>
            <div className="progress-bar-warm">
              <div className="progress-fill-warm" style={{ width: `${confidence * 100}%` }}></div>
            </div>
          </div>
        </section>
      )}

      <section className="alphabet-warm" id="alphabet">
        <h2 className="alphabet-heading">ASL Alphabet Reference</h2>
        <div className="alphabet-grid-warm">
          {alphabet.map((item) => (
            <div key={item.letter} className="alphabet-card-warm">
              <div className="card-emoji">{item.emoji}</div>
              <div className="card-letter">{item.letter}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mission-strip" id="mission">
        <p className="mission-text">
          <strong>Our Mission:</strong> We believe communication is a fundamental human right. 
          Signify empowers the deaf and hard-of-hearing community by making sign language 
          accessible to everyone through innovative AI technology. Together, we're building 
          a more inclusive world where every voice is heard.
        </p>
      </section>

      <footer className="warm-footer">
        <p>© 2024 Signify. Empowering communication for all.</p>
      </footer>
    </div>
  );
}
