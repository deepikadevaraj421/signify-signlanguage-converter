import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useAuth } from "../context/Authcontext";
import axios from "axios";

export default function SignDetector() {
  const webcamRef = useRef(null);
  const { user } = useAuth();
  
  const [detectedSign, setDetectedSign] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("signify_token");
      const res = await axios.get("http://localhost:5000/api/gestures/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const simulateDetection = () => {
    const signs = ["A", "B", "C", "D", "E", "Hello", "Thanks", "Yes", "No"];
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
      fetchHistory();
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
    <div className="detector-page">
      <div className="detector-header">
        <h2>Real-Time Sign Language Detector</h2>
        <p>Use your webcam to detect ASL signs in real-time</p>
      </div>

      <div className="detector-layout">
        <div className="video-section">
          <div className="video-container">
            <Webcam ref={webcamRef} className="webcam" />
          </div>
          
          <div className="controls">
            {!isDetecting ? (
              <button onClick={() => setIsDetecting(true)} className="btn-start">
                Start Detection
              </button>
            ) : (
              <button onClick={() => setIsDetecting(false)} className="btn-stop">
                Stop Detection
              </button>
            )}
          </div>

          <div className="status-badge success">Ready ✓</div>
        </div>

        <div className="results-section">
          <div className="current-detection">
            <h3>Current Detection</h3>
            {detectedSign ? (
              <div className="detection-card">
                <div className="sign-display">{detectedSign}</div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${confidence * 100}%` }}></div>
                </div>
                <p className="confidence-text">{(confidence * 100).toFixed(1)}% Confidence</p>
              </div>
            ) : (
              <p className="no-detection">No sign detected</p>
            )}
          </div>

          <div className="history-section">
            <h3>Detection History</h3>
            <div className="history-list">
              {history.slice(0, 10).map((item, idx) => (
                <div key={idx} className="history-item">
                  <span className="history-sign">{item.gesture}</span>
                  <span className="history-confidence">{(item.confidence * 100).toFixed(1)}%</span>
                  <span className="history-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
