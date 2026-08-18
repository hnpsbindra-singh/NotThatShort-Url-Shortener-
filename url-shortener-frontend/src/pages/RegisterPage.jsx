import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { register } from '../api/api';
import { useToast } from '../context/ToastContext';
import AuthBackground from '../components/AuthBackground';

export default function RegisterPage() {
  const navigate      = useNavigate();
  const location      = useLocation();
  const { addToast }  = useToast();
  const pendingUrl    = location.state?.pendingUrl || '';

  const [form, setForm]         = useState({ name: '', username: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      addToast('Account registered! Enter the OTP sent to your email.', 'success', 4000);
      navigate('/verify-email', { 
        state: { 
          username: form.username,
          pendingUrl: pendingUrl 
        } 
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-card card-padded fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="logo" style={{ justifyContent: 'center', fontSize: '1.4rem' }}>
            Not<span style={{ color: 'var(--primary-600)' }}>ThatShort</span>
          </Link>
          <p className="text-body" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Big Link Energy &bull; Zero Bloat
          </p>
        </div>

        <div className="auth-header">
          <h1 className="text-h1">Create an Account</h1>
          <p className="text-body" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            100 Free Link Trims loaded automatically
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="e.g. Alex Hunter"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="username"
              type="email"
              className="form-input"
              placeholder="you@domain.com"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="password-input-wrap">
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>Claim 100 Trims &rarr;</>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already got an account? <Link to="/login">Sign In Here</Link>
        </p>
      </div>
    </div>
  );
}
