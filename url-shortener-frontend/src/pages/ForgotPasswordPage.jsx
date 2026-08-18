import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyResetOtp } from '../api/api';
import AuthBackground from '../components/AuthBackground';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(0); // 0: enter email, 1: enter OTP + new pass
  const [username, setUsername] = useState('');
  const [otp, setOtp]           = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(username);
      setSuccess('Reset code dispatched to your inbox!');
      setStep(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Could not send reset code. Verify your email.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8 || newPassword.length > 15) {
      setError('Password must be between 8 and 15 characters.');
      return;
    }
    setLoading(true);
    try {
      await verifyResetOtp({ username, otp, newPassword });
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Invalid OTP code or request expired.');
    } finally {
      setLoading(false);
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

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{
            flex: 1, height: '4px', borderRadius: '99px',
            background: 'var(--accent-blue)'
          }} />
          <div style={{
            flex: 1, height: '4px', borderRadius: '99px',
            background: step === 1 ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.1)',
            transition: 'background 0.3s'
          }} />
        </div>

        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', color: '#60a5fa' }}>
            {step === 0 ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7.5" cy="15.5" r="5.5"></circle>
                <path d="M21 2l-9.6 9.6"></path>
                <path d="M15.5 7.5l3 3L22 7l-3-3"></path>
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            )}
          </div>
          <h1 className="text-h1">
            {step === 0 ? 'Recover Access' : 'Set New Password'}
          </h1>
          <p className="text-body" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {step === 0 
              ? 'Enter your registered email to receive a recovery code' 
              : `Enter the code sent to ${username} and pick a new password`}
          </p>
        </div>

        {error   && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>{success}</div>}

        {step === 0 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-email">Email Address</label>
              <input
                id="fp-email"
                type="email"
                className="form-input"
                placeholder="you@domain.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : <>Send Reset Code &rarr;</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-otp">6-Digit Code</label>
              <input
                id="fp-otp"
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

            <div className="form-group">
              <label className="form-label" htmlFor="fp-newpass">New Password (8-15 chars)</label>
              <div className="password-input-wrap">
                <input
                  id="fp-newpass"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={15}
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

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : <>Update Password &rarr;</>}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={() => { setStep(0); setError(''); }}
            >
              &larr; Back
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
