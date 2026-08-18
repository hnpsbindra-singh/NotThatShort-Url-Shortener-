import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLink } from '../api/api';

export default function RedirectPage() {
  const { code } = useParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await getLink(code);
        let originalUrl = res.data;
        if (typeof originalUrl === 'string') {
          originalUrl = originalUrl.trim();
          if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = 'https://' + originalUrl;
          }
          // Redirect immediately to target URL
          window.location.replace(originalUrl);
        } else {
          throw new Error('Invalid URL received');
        }
      } catch (err) {
        if (isMounted) {
          const msg = err.response?.data?.message || err.response?.data || 'This link is invalid or has expired.';
          setError(typeof msg === 'string' ? msg : 'This link is invalid or has expired.');
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card card-glass card-padded fade-in" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: '#fb7185' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-h1" style={{ marginBottom: '.5rem' }}>Unable to Redirect</h1>
          <p className="text-body" style={{ marginBottom: '1.5rem', color: '#fb7185' }}>
            {error}
          </p>
          <Link to="/">
            <button className="btn btn-primary btn-full">Go to NotThatShort</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card card-glass card-padded fade-in" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <span className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
        </div>
        <h2 className="text-h2" style={{ marginBottom: '.5rem' }}>Redirecting...</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Transferring you to the destination URL</p>
      </div>
    </div>
  );
}
