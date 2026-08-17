import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import QrModal from '../components/QrModal';
import UtmBuilderModal from '../components/UtmBuilderModal';
import { QRCodeCanvas } from 'qrcode.react';
import { shortenUrl } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const SAMPLE_PRESETS = [
  { label: 'GitHub Repo', url: 'https://github.com/torvalds/linux/blob/master/README.md?utm_source=dev&utm_medium=social' },
  { label: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1' },
  { label: 'Notion Workspace', url: 'https://www.notion.so/product-design-roadmap-2026-q3-planning-98a7bc654e' },
  { label: 'Figma File', url: 'https://www.figma.com/design/48392019/NotThatShort-Design-System-v2?node-id=102' }
];

const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.notthatshort.com/v1/api/url/shorten \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"originalUrl": "https://example.com/very-long-url"}'`,
  javascript: `const res = await fetch("https://api.notthatshort.com/v1/api/url/shorten", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${token}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ originalUrl: "https://example.com/very-long-url" })
});
const { shortenCode } = await res.json();
console.log(\`https://notthatshort.com/r/\${shortenCode}\`);`,
  python: `import requests

res = requests.post(
    "https://api.notthatshort.com/v1/api/url/shorten",
    headers={"Authorization": f"Bearer {token}"},
    json={"originalUrl": "https://example.com/very-long-url"}
)
print(res.text) # returns short link`
};

const FAQS = [
  {
    q: 'How fast are redirects compared to other shorteners?',
    a: 'Redirects resolve in under 1 millisecond. We use Upstash Redis in-memory key-value caching at the edge, meaning zero disk bottlenecks, zero interstitial ad pages, and instant handoff.'
  },
  {
    q: 'Is QR code generation really free with vector export?',
    a: 'Yes. Every shortened URL comes with a built-in QR Code Studio. You can customize foreground colors and download pixel-perfect PNG or lossless SVG vector files for high-resolution print without paying a subscription.'
  },
  {
    q: 'Can I add UTM tags for Google Ads or newsletters?',
    a: 'Yes. The built-in UTM Builder lets you specify Campaign Source, Medium, and Name with one-click presets before shortening, keeping all analytics tags intact.'
  },
  {
    q: 'How does link expiration and TTL work?',
    a: 'Links are stored in our in-memory Redis cluster with a default 7-day extended retention window and can be deleted or refreshed at any time directly from your vault.'
  },
  {
    q: 'Do you inject intermediate ads or tracking cookies?',
    a: 'Never. NotThatShort performs direct, transparent HTTP 302 client redirects. Your visitors go straight to your destination with zero delays or spam.'
  }
];

export default function LandingPage() {
  const { isAuthenticated }     = useAuth();
  const { addToast }            = useToast();
  const navigate                = useNavigate();
  const inputRef                = useRef(null);

  const [url, setUrl]           = useState('');
  const [result, setResult]     = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [originalLen, setOriginalLen] = useState(0);

  // Modals
  const [qrUrl, setQrUrl]       = useState(null);
  const [showUtmModal, setShowUtmModal] = useState(false);
  const [openFaq, setOpenFaq]   = useState(null);

  // Interactive Live Demo States
  const [activeCodeTab, setActiveCodeTab] = useState('curl');
  const [interactiveQrColor, setInteractiveQrColor] = useState('#0b1528');

  // Keyboard shortcut "/" to focus hero input
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && document.activeElement !== inputRef.current && !qrUrl && !showUtmModal) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qrUrl, showUtmModal]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        addToast('Pasted from clipboard', 'info', 1500);
      }
    } catch {
      // Fallback
    }
  }

  function handleUsePreset(presetUrl) {
    setUrl(presetUrl);
    inputRef.current?.focus();
    addToast('Sample URL loaded into shortener', 'info', 1500);
  }

  async function handleShorten(e) {
    e.preventDefault();
    let sanitized = url.trim();
    if (!sanitized) return;

    if (!/^https?:\/\//i.test(sanitized)) {
      sanitized = 'https://' + sanitized;
    }

    if (!isAuthenticated) {
      navigate('/register', { state: { pendingUrl: sanitized } });
      return;
    }

    setError('');
    setResult('');
    setLoading(true);
    setOriginalLen(sanitized.length);

    try {
      const res = await shortenUrl({ originalUrl: sanitized });
      const raw = typeof res.data === 'string' ? res.data.trim() : String(res.data);
      const code = raw.split('/').filter(Boolean).pop();
      setResult(`${window.location.origin}/r/${code}`);
      setUrl('');
      addToast('Link trimmed successfully!', 'success', 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to shorten URL. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    addToast('Link copied to clipboard!', 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  }

  const reduction = originalLen > 0 && result 
    ? Math.max(0, Math.round(((originalLen - result.length) / originalLen) * 100))
    : 0;

  return (
    <div className="page-wrapper">
      <Navbar />

      {/* ── Left-Right Split Hero Section ── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', paddingTop: '4rem', paddingBottom: '4.5rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            
            {/* ── Left Column: Headline, Value Proposition & CTA ── */}
            <div style={{ textAlign: 'left' }}>
              
              {/* Edge status badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '99px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', marginBottom: '1.25rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  In-Memory Redis Edge &bull; 0.34ms Latency
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-display" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)', lineHeight: 1.12, letterSpacing: '-0.04em', marginBottom: '1.25rem' }}>
                Never apologize for your length.<br />
                <span style={{ color: 'var(--primary-600)' }}>It&apos;s Not That Short.</span>
              </h1>

              {/* Subhead */}
              <p className="text-body" style={{ fontSize: '1.075rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '520px' }}>
                Stop overcompensating with clumsy 300-character URLs. Trim tracking bloat down to an 8-character powerhouse with sub-millisecond in-memory caching and instant QR studio exports.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link to="/register">
                  <button className="btn btn-primary btn-lg">
                    Claim 100 Free Trims &rarr;
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn btn-outline btn-lg">
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Benchmark Feature Strip */}
              <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--navy-900)' }}>0.34 ms</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>P99 Edge Latency</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-success)' }}>100% Direct</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zero Ad Gates</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-600)' }}>Vector SVG</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Free QR Studio</div>
                </div>
              </div>

            </div>

            {/* ── Right Column: Interactive Shortener Console ── */}
            <div>
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid var(--border-medium)', boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12)', padding: '1.5rem', textAlign: 'left' }}>
                
                {/* Console Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>Live Link Console</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowUtmModal(true)}
                      style={{ fontSize: '0.775rem', padding: '3px 8px', color: 'var(--primary-600)' }}
                    >
                      + UTM Parameters
                    </button>
                    <span className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
                      Press &ldquo;/&rdquo; to focus
                    </span>
                  </div>
                </div>

                {/* Input Row */}
                <form onSubmit={handleShorten}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="input-with-icon" style={{ flex: 1, minWidth: '240px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      <input
                        ref={inputRef}
                        id="hero-url-input"
                        type="text"
                        className="hero-input"
                        style={{ width: '100%' }}
                        placeholder="Paste a long URL (e.g. https://github.com/...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                      {!url && (
                        <button type="button" className="paste-btn-inline" onClick={handlePaste}>
                          Paste
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                      style={{ minWidth: '130px' }}
                    >
                      {loading ? <span className="spinner spinner-sm" /> : <>Trim &rarr;</>}
                    </button>
                  </div>
                </form>

                {/* Quick Sample Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try with sample:</span>
                  {SAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleUsePreset(p.url)}
                      style={{
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        color: 'var(--navy-900)',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginTop: '1rem' }}>
                    {error}
                  </div>
                )}

                {/* Live Result Box */}
                {result && (
                  <div className="result-card fade-in" style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="result-url">{result}</span>
                      {reduction > 0 && (
                        <span className="trim-badge">{reduction}% Trimmed</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => setQrUrl(result)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        QR Studio
                      </button>

                      <button className="btn btn-outline btn-sm" onClick={handleCopy}>
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this link: ' + result)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Share via WhatsApp"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        WA
                      </a>

                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Shortened via NotThatShort: ' + result)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Share on X"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        X
                      </a>

                      <a href={result} target="_blank" rel="noreferrer">
                        <button className="btn btn-primary btn-sm">Open &nearr;</button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Feature Deep Dives: Interactive Software Grid ── */}
      <section className="section" style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="tag-badge">PRECISION SOFTWARE</span>
            <h2 className="text-h1" style={{ marginTop: '0.75rem' }}>
              Engineered for speed, control, and zero bloat
            </h2>
            <p className="text-body" style={{ marginTop: '0.5rem' }}>
              Everything you need to publish, distribute, and manage your links across every channel.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Feature 1: Dynamic QR Studio */}
            <div className="card-glass card-padded" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <h3 className="text-h2" style={{ marginBottom: '0.5rem' }}>Dynamic QR Code Studio</h3>
                <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Generate high-contrast QR matrices with custom colorways and export directly to raster PNG or lossless vector SVG for posters and menus.
                </p>
              </div>

              {/* Interactive QR widget demonstration */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--border-light)', marginBottom: '0.75rem' }}>
                  <QRCodeCanvas
                    value="https://notthatshort.com/r/demo"
                    size={110}
                    bgColor="#ffffff"
                    fgColor={interactiveQrColor}
                    level="H"
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {['#0b1528', '#2563eb', '#059669', '#dc2626'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setInteractiveQrColor(hex)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: hex,
                        border: interactiveQrColor === hex ? '2px solid #3b82f6' : '1px solid #ffffff',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Click color to preview live QR palette</div>
              </div>
            </div>

            {/* Feature 2: Redis In-Memory Engine */}
            <div className="card-glass card-padded" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h3 className="text-h2" style={{ marginBottom: '0.5rem' }}>Upstash Redis Cache Engine</h3>
                <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Stateless Spring Boot routing backed by in-memory Redis cluster. Delivers sub-millisecond redirects with 7-day automatic TTL retention.
                </p>
              </div>

              {/* Benchmarks strip */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Redirect Latency</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>0.34 ms (P99)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cache Hit Ratio</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>100% In-Memory</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Intermediate Ad Gates</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>Zero Delay</span>
                </div>
              </div>
            </div>

            {/* Feature 3: UTM Campaign Studio */}
            <div className="card-glass card-padded" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="22" y1="12" x2="18" y2="12"></line>
                    <line x1="6" y1="12" x2="2" y2="12"></line>
                    <line x1="12" y1="6" x2="12" y2="2"></line>
                    <line x1="12" y1="22" x2="12" y2="18"></line>
                  </svg>
                </div>
                <h3 className="text-h2" style={{ marginBottom: '0.5rem' }}>Built-in UTM Campaign Tagger</h3>
                <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Tag campaign source, medium, and term parameters before shortening. Capture full marketing attribution without messy long links.
                </p>
              </div>

              {/* UTM tag preview */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', background: '#ffffff', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>utm_source=google</span>
                  <span style={{ fontSize: '0.7rem', background: '#ffffff', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>utm_medium=cpc</span>
                  <span style={{ fontSize: '0.7rem', background: '#ffffff', border: '1px solid var(--border-medium)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>utm_campaign=launch</span>
                </div>
                <div className="text-mono" style={{ fontSize: '0.775rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                  &rarr; notthatshort.com/r/q8x91p
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Developer REST API Playground ── */}
      <section className="section" style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="tag-badge">DEVELOPER PLATFORM</span>
            <h2 className="text-h1" style={{ marginTop: '0.75rem' }}>
              Programmatic Link Creation
            </h2>
            <p className="text-body">
              Integrate link shortening into your CI/CD pipelines, Discord bots, or SaaS backends.
            </p>
          </div>

          <div style={{ background: 'var(--navy-950)', borderRadius: '14px', border: '1px solid #1e293b', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            
            {/* Terminal Header Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #1e293b', background: '#070d1e' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('curl')}
                  style={{
                    background: activeCodeTab === 'curl' ? '#1e293b' : 'transparent',
                    color: activeCodeTab === 'curl' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('javascript')}
                  style={{
                    background: activeCodeTab === 'javascript' ? '#1e293b' : 'transparent',
                    color: activeCodeTab === 'javascript' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  JavaScript
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('python')}
                  style={{
                    background: activeCodeTab === 'python' ? '#1e293b' : 'transparent',
                    color: activeCodeTab === 'python' ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  Python
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>POST /v1/api/url/shorten</span>
            </div>

            {/* Code Block */}
            <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6, color: '#93c5fd' }}>
                <code>{CODE_EXAMPLES[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="section" style={{ background: 'var(--bg-page)' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="tag-badge">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="text-h1" style={{ marginTop: '0.75rem' }}>
              Answers to common questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="card-glass"
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.95rem' }}>
                  <span>{faq.q}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: openFaq === index ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {openFaq === index && (
                  <p className="text-body fade-in" style={{ fontSize: '0.9rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#070d1e', padding: '3.5rem 0 2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', color: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div className="logo" style={{ color: '#ffffff', fontSize: '1.3rem' }}>
                Not<span style={{ color: '#60a5fa' }}>ThatShort</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                Big Link Energy &bull; In-Memory Redis Edge Caching
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
              <Link to="/register" style={{ color: '#ffffff' }}>Get Started</Link>
              <Link to="/login">Sign In</Link>
              <a href="#hero-url-input" onClick={() => inputRef.current?.focus()}>Shorten URL</a>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <span>&copy; {new Date().getFullYear()} NotThatShort. Built for developers &amp; creators.</span>
            <span>Zero ad gateways &bull; Stateless JWT Authentication</span>
          </div>
        </div>
      </footer>

      {/* QR Modal */}
      {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}

      {/* UTM Builder Modal */}
      {showUtmModal && (
        <UtmBuilderModal
          initialUrl={url}
          onApply={(taggedUrl) => setUrl(taggedUrl)}
          onClose={() => setShowUtmModal(false)}
        />
      )}
    </div>
  );
}
