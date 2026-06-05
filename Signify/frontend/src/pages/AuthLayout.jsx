import logo from "../assets/logo.jpeg";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="logo-glow"></div>
        <div className="brand-content">
          <img src={logo} alt="Signify" className="logo-img" />
          <p className="tagline">Bridging Communication Through Technology</p>
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-dot"></span>
              Real-time sign detection
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              AI-powered accuracy
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              Easy to use interface
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="form-title">{title}</h1>
            <p className="form-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="footer-note">© 2024 Signify. All rights reserved.</p>
      </div>
    </div>
  );
}
