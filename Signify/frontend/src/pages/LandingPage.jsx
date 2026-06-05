import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../landing.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <span>🤟</span>
          Signify
        </div>
        <div className="nav-menu">
          <a href="#features" className="nav-link">Features</a>
          <a href="#mission" className="nav-link">Mission</a>
          <a href="#about" className="nav-link">About</a>
          <button onClick={() => navigate("/")} className="btn-pill">Get Started</button>
        </div>
      </nav>

      <section className="hero-landing">
        <div className="hero-content">
          <h1>
            Breaking <span className="accent">Barriers</span>, One Sign at a Time
          </h1>
          <p className="hero-subtext">
            Experience real-time sign language detection powered by AI. 
            Connect, communicate, and understand like never before with Signify.
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate("/")} className="btn-cta">
              Start Detecting
            </button>
            <a href="#features" className="btn-ghost">Learn More →</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-emoji">🤟</div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="trust-text">
          <span>✓ Trusted by 10,000+ users</span>
          <span>•</span>
          <span>🔤 26 ASL Signs</span>
          <span>•</span>
          <span>⚡ Real-Time AI</span>
        </div>
      </section>

      <section className="features-section" id="features">
        <h2 className="features-heading">Why Choose Signify?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎥</div>
            <h3 className="feature-title">Real-Time Detection</h3>
            <p className="feature-text">
              Instant sign language recognition using your webcam. 
              Our AI analyzes gestures in milliseconds for seamless communication.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3 className="feature-title">AI-Powered Accuracy</h3>
            <p className="feature-text">
              Advanced machine learning models trained on thousands of signs 
              deliver 98% accuracy for reliable translations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3 className="feature-title">Accessible Everywhere</h3>
            <p className="feature-text">
              Works on any device with a camera. No downloads, no setup. 
              Just open and start signing from anywhere in the world.
            </p>
          </div>
        </div>
      </section>

      <section className="mission-section" id="mission">
        <blockquote className="mission-quote">
          "Communication is a fundamental human right. We're building a world 
          where sign language is understood by everyone, everywhere."
        </blockquote>
      </section>

      <section className="cta-section">
        <h2 className="cta-heading">Ready to Break Barriers?</h2>
        <button onClick={() => navigate("/")} className="btn-cta">
          Get Started for Free
        </button>
      </section>

      <footer className="landing-footer">
        <p className="footer-text">© 2024 Signify. Empowering communication for all.</p>
        <div className="social-icons">
          <span className="social-icon">📱</span>
          <span className="social-icon">💬</span>
          <span className="social-icon">🌐</span>
        </div>
      </footer>
    </div>
  );
}
