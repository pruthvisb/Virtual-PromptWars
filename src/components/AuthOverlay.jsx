import React, { useState } from 'react';
import { useAppState } from '../AppStateContext';

export default function AuthOverlay() {
  const { state, login } = useAppState();
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('jane.doe@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (state.isLoggedIn) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(loginEmail, loginPassword, false);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    login(registerEmail, registerPassword, false);
  };

  const handleGoogleSignIn = () => {
    login('google.citizen@example.com', '', true);
  };

  return (
    <div id="auth-overlay" className="auth-overlay active" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="auth-card-container">
        
        {isLoginView ? (
          /* Login Card */
          <div className="auth-card active" id="login-card">
            <div className="auth-brand">
              <div className="auth-logo">
                <svg viewBox="0 0 24 24">
                  <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/>
                </svg>
              </div>
              <h2 id="auth-title">Welcome to EcoSphere AI</h2>
            </div>
            <p className="auth-subtitle">AI-Powered Carbon Intelligence Platform</p>
            
            <form id="login-form" onSubmit={handleLoginSubmit}>
              <div className="input-wrapper">
                <label htmlFor="login-email">Email Address</label>
                <input 
                  type="email" 
                  id="login-email" 
                  required 
                  placeholder="you@example.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="login-password">Password</label>
                <input 
                  type="password" 
                  id="login-password" 
                  required 
                  placeholder="••••••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn">Sign In</button>
            </form>

            <div className="auth-divider"><span>or sign in with</span></div>

            <button 
              className="btn btn-secondary google-signin-btn" 
              id="google-signin-btn" 
              onClick={handleGoogleSignIn}
              type="button" 
              aria-label="Sign in with Google"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.6-6.887 4.6-4.33 0-7.866-3.57-7.866-7.97s3.536-7.97 7.866-7.97c2.465 0 4.12 1.025 5.065 1.93l3.24-3.125C18.425 2.045 15.62 1 12.24 1 6.033 1 1 5.925 1 12s5.033 11 11.24 11c6.478 0 10.793-4.545 10.793-10.985 0-.74-.08-1.305-.18-1.73H12.24z"/>
              </svg>
              Google Account
            </button>

            <p className="auth-footer-text">
              Don't have an account?{' '}
              <span id="to-register-btn" tabIndex="0" role="button" onClick={() => setIsLoginView(false)}>
                Create one
              </span>
            </p>
          </div>
        ) : (
          /* Register Card */
          <div className="auth-card active" id="register-card">
            <div className="auth-brand">
              <div className="auth-logo">
                <svg viewBox="0 0 24 24">
                  <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/>
                </svg>
              </div>
              <h2>Join EcoSphere AI</h2>
            </div>
            <p className="auth-subtitle">Begin your carbon-intelligent lifestyle today.</p>
            
            <form id="register-form" onSubmit={handleRegisterSubmit}>
              <div className="input-wrapper">
                <label htmlFor="register-name">Full Name</label>
                <input 
                  type="text" 
                  id="register-name" 
                  required 
                  placeholder="Jane Doe" 
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="register-email">Email Address</label>
                <input 
                  type="email" 
                  id="register-email" 
                  required 
                  placeholder="you@example.com" 
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="register-password">Password</label>
                <input 
                  type="password" 
                  id="register-password" 
                  required 
                  placeholder="••••••••" 
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn">Create Account</button>
            </form>

            <p className="auth-footer-text">
              Already have an account?{' '}
              <span id="to-login-btn" tabIndex="0" role="button" onClick={() => setIsLoginView(true)}>
                Sign in
              </span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
