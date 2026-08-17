import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../api/api';
import AuthBackground from '../components/AuthBackground';

export default function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prefilled = location.state?.username || '';

  const [username, setUsername] = useState(prefilled);
  const [otp, setOtp]           = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp({ username, otp });
      setSuccess('Identity verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!username) { setError('Enter your email first.'); return; }
    setResending(true);
    setError('');
    try {
      await sendOtp(username);
      setSuccess('Fresh OTP dispatched! Check your inbox.');
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Could not resend OTP. Please wait a moment.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthBackground />
      <div className="auth-card card-glass card-padded fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" className="logo" style={{ justifyContent: 'center', fontSize: '1.4rem' }}>
            Not<span className="text-gradient">ThatShort</span>
          </Link>
        </div>

        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: '#60a5fa' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <h1 className="text-h1">Verify Email</h1>
          <p className="text-body" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            We dispatched a 6-digit confirmation code to{' '}
            <strong style={{ color: '#fff' }}>{username || 'your inbox'}</strong>.
          </p>
        </div>

        {error   && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!prefilled && (
            <div className="form-group">
              <label className="form-label" htmlFor="verify-email">Email Address</label>
              <input
                id="verify-email"
                type="email"
                className="form-input"
                placeholder="you@domain.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="otp">6-Digit Code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              className="form-input otp-input"
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              autoComplete="one-time-code"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>Verify &amp; Activate Vault &rarr;</>
            )}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">&larr; Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
