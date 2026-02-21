import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const CREDENTIALS = [
  { username: 'citizen1', password: 'pass123', role: 'user', label: 'Citizen 1' },
  { username: 'citizen2', password: 'pass456', role: 'user', label: 'Citizen 2' },
  { username: 'registrar', password: 'admin789', role: 'registrar', label: 'Registrar' },
];

export default function SignInPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password.');
      return;
    }

    setLoading(true);
    // Simulate a brief auth delay
    setTimeout(() => {
      const match = CREDENTIALS.find(
        (c) => c.username === username.trim() && c.password === password.trim()
      );

      if (!match) {
        toast.error('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('userRole', match.role);
      localStorage.setItem('userName', match.label);
      toast.success(`Welcome, ${match.label}!`);

      if (match.role === 'registrar') {
        navigate('/registrar-dashboard');
      } else {
        navigate('/user-dashboard');
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (cred) => {
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        {/* Logo */}
        <div className="signin-logo">
          <div className="signin-logo-icon">
            <span>🏛️</span>
          </div>
          <h1 className="signin-title">LandChain</h1>
          <p className="signin-subtitle">Blockchain Land Registry Portal</p>
        </div>

        {/* Login Form */}
        <form className="signin-form" onSubmit={handleLogin}>
          <div className="signin-input-group">
            <User size={16} className="signin-input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="signin-input-group">
            <Lock size={16} className="signin-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="signin-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <button type="submit" className="btn-primary btn-large signin-submit" disabled={loading}>
            {loading ? (
              <span className="signin-loading">Signing in…</span>
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="signin-divider">
          <span>Quick Access</span>
        </div>

        {/* Quick Login Cards */}
        <div className="signin-quick-cards">
          {CREDENTIALS.map((cred) => (
            <button
              key={cred.username}
              className="signin-quick-card"
              onClick={() => quickLogin(cred)}
              disabled={loading}
            >
              <div className={`signin-quick-icon ${cred.role === 'registrar' ? 'registrar' : 'citizen'}`}>
                {cred.role === 'registrar' ? <Shield size={16} /> : <User size={16} />}
              </div>
              <div className="signin-quick-info">
                <span className="signin-quick-name">{cred.label}</span>
                <span className="signin-quick-creds">
                  {cred.username} / {cred.password}
                </span>
              </div>
              <span className={`signin-quick-role ${cred.role}`}>
                {cred.role === 'registrar' ? 'Registrar' : 'Citizen'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="signin-footer">
          <button onClick={() => navigate('/')} className="signin-back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
