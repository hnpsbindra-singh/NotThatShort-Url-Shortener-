import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getUserProfile } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { token, logout } = useAuth();
  const { addToast }     = useToast();
  const navigate         = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserProfile();
        setProfile(res.data);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleLogout() {
    logout();
    addToast('Signed out of vault. See you soon.', 'info', 2000);
    navigate('/');
  }

  function copyToken() {
    if (!token) return;
    navigator.clipboard.writeText(token);
    addToast('JWT Bearer token copied to clipboard!', 'success', 2500);
  }

  const used    = profile ? (profile.urlShortenAllowed - profile.urlShortenedLeft) : 0;
  const total   = profile?.urlShortenAllowed || 100;
  const percent = Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container section">
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="tag-badge">MEMBERSHIP &bull; STAMINA TIER 1</span>
              <h1 className="text-h1" style={{ marginTop: '0.4rem' }}>Fuel Tank &amp; Stamina Control</h1>
            </div>
            <Link to="/dashboard">
              <button className="btn btn-outline btn-sm">&larr; Back to Command Center</button>
            </Link>
          </div>

          {loading ? (
            <div className="card-glass" style={{ padding: '3rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '48px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
                <div style={{ height: '48px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : profile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Member Card */}
              <div className="card-glass card-padded fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: 'var(--navy-900)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 800
                  }}>
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="text-h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {profile.name}
                      {profile.verified ? (
                        <span style={{ fontSize: '0.75rem', background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success-border)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                          VERIFIED OWNER
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', background: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid var(--color-warning-border)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                          PENDING OTP
                        </span>
                      )}
                    </div>
                    <div className="text-mono" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {profile.username}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Account Tier</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '4px' }}>Big Link Pro</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Hold Duration (TTL)</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '4px' }}>7-Day Auto Stamina</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Cache Delivery</div>
                    <div style={{ fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>Upstash Redis In-Memory</div>
                  </div>
                </div>
              </div>

              {/* Quota Fuel Tank */}
              <div className="card-glass card-padded fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h2 className="text-h2">Shortening Fuel Tank</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Packs 100 high-octane link trims directly into your vault.
                    </div>
                  </div>
                  <span className="tag-badge">
                    {profile.urlShortenedLeft} SHOTS REMAINING
                  </span>
                </div>

                <div className="stats-strip" style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-box">
                    <div className="stat-number" style={{ color: 'var(--primary-600)' }}>{used}</div>
                    <div className="stat-desc">Trims Executed</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number">{profile.urlShortenedLeft}</div>
                    <div className="stat-desc">Shots in the Tank</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-number" style={{ color: 'var(--text-muted)' }}>{total}</div>
                    <div className="stat-desc">Tank Capacity</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fuel Used</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{percent}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                </div>
              </div>

              {/* Developer API Playground Snippet */}
              <div className="card-glass card-padded fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <h2 className="text-h2">Programmatic Deployment (API)</h2>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Direct cURL trigger with your JWT Bearer token.
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={copyToken}>
                    Copy Bearer JWT
                  </button>
                </div>

                <div style={{ background: 'var(--navy-950)', color: '#93c5fd', padding: '1rem 1.25rem', borderRadius: '8px', fontSize: '0.825rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', lineHeight: 1.6 }}>
                  <code>
                    curl -X POST http://localhost:8080/v1/api/url/shorten \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer {token ? `${token.slice(0, 18)}...` : 'YOUR_JWT_TOKEN'}&quot; \<br />
                    &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
                    &nbsp;&nbsp;-d &apos;&#123;&quot;originalUrl&quot;: &quot;https://your-website.com&quot;&#125;&apos;
                  </code>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card-glass card-padded fade-in" style={{ borderColor: 'var(--color-danger-border)' }}>
                <h2 className="text-h2" style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Session Control</h2>
                <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Pull out of this browser session. Your shortened powerhouses and quota remain safe in your vault.
                </p>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Pull Out &amp; Sign Out
                </button>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
