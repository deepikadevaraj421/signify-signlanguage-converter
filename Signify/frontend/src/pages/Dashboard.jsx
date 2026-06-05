import { useAuth } from "../context/Authcontext";
import { useState, useEffect } from "react";
import logo from "../assets/logo.jpeg";
import "../slideshow.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("home");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activePage === "home") {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activePage]);

  const renderContent = () => {
    switch(activePage) {
      case "home":
        return (
          <div className="home-page">
            <div className="slideshow-container">
              <div className={`slide ${currentSlide === 0 ? 'active' : ''}`}>
                <div className="slide-content">
                  <h2>Welcome to Sign Language Converter</h2>
                  <p>Breaking communication barriers with AI-powered technology</p>
                </div>
              </div>
              <div className={`slide ${currentSlide === 1 ? 'active' : ''}`}>
                <div className="slide-content">
                  <h2>Real-Time Detection</h2>
                  <p>Convert sign language gestures to text instantly using your webcam</p>
                </div>
              </div>
              <div className={`slide ${currentSlide === 2 ? 'active' : ''}`}>
                <div className="slide-content">
                  <h2>Learn & Practice</h2>
                  <p>Transform text into sign language animations and improve your skills</p>
                </div>
              </div>
              <div className={`slide ${currentSlide === 3 ? 'active' : ''}`}>
                <div className="slide-content">
                  <h2>Video Analysis</h2>
                  <p>Upload videos and get accurate sign language translations</p>
                </div>
              </div>
            </div>
            
            <div className="features-grid">
              <div className="feature-card" onClick={() => setActivePage("signtospeech")}>
                <div className="feature-icon">🎥</div>
                <h3>Sign to Speech</h3>
                <p>Convert sign language gestures to spoken words in real-time</p>
              </div>
              
              <div className="feature-card" onClick={() => setActivePage("texttosign")}>
                <div className="feature-icon">✍️</div>
                <h3>Text to Sign</h3>
                <p>Transform text into sign language animations instantly</p>
              </div>
              
              <div className="feature-card" onClick={() => setActivePage("videototext")}>
                <div className="feature-icon">📹</div>
                <h3>Video to Text</h3>
                <p>Analyze sign language videos and convert to readable text</p>
              </div>
            </div>
            
            <div className="learning-section">
              <h2>Learn Sign Language Basics</h2>
              <p>Start your journey by learning the fundamental signs and alphabet</p>
              <div className="learning-images-grid">
                <div className="learning-image-container">
                  <img src="https://cdn11.bigcommerce.com/s-dc9f5/images/stencil/1280x1280/products/2095/8082/ASL_Trans_ABCs__08283.1443708103.jpg?c=2" 
                       alt="Sign Language Alphabet" 
                       className="learning-image" />
                </div>
                <div className="learning-image-container">
                  <img src="https://i.etsystatic.com/25029575/r/il/f6e219/3243942718/il_fullxfull.3243942718_l42q.jpg" 
                       alt="Sign Language Guide" 
                       className="learning-image" />
                </div>
                <div className="learning-image-container">
                  <img src="https://d2drp7fo8uq4gv.cloudfront.net/65726b4631c648e650e6ee6c.jpg" 
                       alt="Sign Language Chart" 
                       className="learning-image" />
                </div>
              </div>
            </div>
            
            <div className="stats-section">
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Accuracy</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Sign Languages</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Available</div>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div>
            <h2>About This Application</h2>
            <p>Our Sign Language Converter is an AI-powered platform designed to bridge communication gaps between sign language users and non-signers.</p>
            
            <h3>How It Works</h3>
            
            <div className="demo-section">
              <h4>1. Sign to Speech</h4>
              <p>Use your webcam to perform sign language gestures. Our AI model recognizes the signs in real-time and converts them into spoken words or text.</p>
              <p><em>Demo: Simply enable your camera, start signing, and watch as your gestures are translated instantly.</em></p>
            </div>
            
            <div className="demo-section">
              <h4>2. Text to Sign</h4>
              <p>Type any text, and our system will display the corresponding sign language animations or images, helping you learn how to sign specific words or phrases.</p>
              <p><em>Demo: Enter a word like "Hello" and see the sign language representation.</em></p>
            </div>
            
            <div className="demo-section">
              <h4>3. Video to Text</h4>
              <p>Upload a video of someone signing, and our AI will analyze the gestures and convert them into readable text, making sign language content accessible to everyone.</p>
              <p><em>Demo: Upload a sign language video and get instant text translation.</em></p>
            </div>
            
            <h3>Technology Behind</h3>
            <p>We use advanced machine learning models trained on thousands of sign language gestures to provide accurate real-time translation. Our system continuously learns and improves to deliver better results.</p>
            
            <h3>Our Mission</h3>
            <p>To make communication accessible for everyone by breaking down barriers between sign language users and the hearing community through innovative technology.</p>
          </div>
        );
      case "signtospeech":
        return (
          <div className="redirect-page">
            <h2>Sign to Speech</h2>
            <p>Real-time sign language detection and speech conversion</p>
            <button onClick={() => window.location.href = '/dashboard/signtotext'} className="btn-primary">Launch Detector</button>
          </div>
        );
      case "texttosign":
        window.location.href = '/dashboard/texttosign';
        return null;
      case "videototext":
        window.location.href = '/dashboard/filetosign';
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="app-name">Signify</span>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>
      <div className="dashboard-layout">
        <nav className="sidebar">
          <button className={activePage === "home" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("home")}>Home</button>
          <button className={activePage === "signtospeech" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("signtospeech")}>Sign to Speech</button>
          <button className={activePage === "texttosign" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("texttosign")}>Text to Sign</button>
          <button className={activePage === "videototext" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("videototext")}>Video to Text</button>
          <button className={activePage === "about" ? "nav-item active" : "nav-item"} onClick={() => setActivePage("about")}>About</button>
        </nav>
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
