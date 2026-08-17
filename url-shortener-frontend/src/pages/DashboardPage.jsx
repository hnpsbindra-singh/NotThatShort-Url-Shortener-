import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import UrlCard from '../components/UrlCard';
import QrModal from '../components/QrModal';
import DeleteModal from '../components/DeleteModal';
import UtmBuilderModal from '../components/UtmBuilderModal';
import BulkShortenModal from '../components/BulkShortenModal';
import LinkAnalyticsModal from '../components/LinkAnalyticsModal';
import { getAllLinks, shortenUrl, getUserProfile, deleteLink } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function DashboardPage() {
  const { addToast }                    = useToast();
  const inputRef                        = useRef(null);
  const [urls, setUrls]                 = useState([]);
  const [profile, setProfile]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('newest'); // newest, oldest, az
  const [viewMode, setViewMode]         = useState('table'); // table or grid

  // Shorten form state
  const [newUrl, setNewUrl]             = useState('');
  const [result, setResult]             = useState('');
  const [shortError, setShortError]     = useState('');
  const [shortLoading, setShortLoading] = useState(false);
  const [copied, setCopied]             = useState(false);
  
  // Modals state
  const [qrUrl, setQrUrl]               = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [showUtmModal, setShowUtmModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [analyticsUrl, setAnalyticsUrl] = useState(null);

  async function loadData() {
    try {
      const [linksRes, profileRes] = await Promise.all([
        getAllLinks(),
        getUserProfile()
      ]);
      setUrls(linksRes.data || []);
      setProfile(profileRes.data || null);
    } catch {
      setError('Failed to load your vault. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut: Press "/" to focus input
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === '/' && document.activeElement !== inputRef.current && !qrUrl && !deletingCode && !showUtmModal && !showBulkModal && !analyticsUrl) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [qrUrl, deletingCode, showUtmModal, showBulkModal, analyticsUrl]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setNewUrl(text);
        addToast('Pasted from clipboard', 'info', 1500);
      }
    } catch {
      // Fallback
    }
  }

  async function handleShorten(e) {
    e.preventDefault();
    let sanitized = newUrl.trim();
    if (!sanitized) return;

    if (!/^https?:\/\//i.test(sanitized)) {
      sanitized = 'https://' + sanitized;
    }

    setShortError('');
    setResult('');
    setShortLoading(true);

    try {
      const res = await shortenUrl({ originalUrl: sanitized });
      const raw = typeof res.data === 'string' ? res.data.trim() : String(res.data);
      const code = raw.split('/').filter(Boolean).pop();
      const shortLink = `${window.location.origin}/r/${code}`;
      setResult(shortLink);
      setNewUrl('');
      addToast('Trimmed and locked! Big Link Energy active.', 'success', 3000);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setShortError(typeof msg === 'string' ? msg : 'Could not shorten URL. Check fuel quota.');
    } finally {
      setShortLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    addToast('Link copied to clipboard!', 'success', 2000);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConfirmDelete() {
    if (!deletingCode) return;
    setIsDeleting(true);
    try {
      await deleteLink(deletingCode);
      setUrls((prev) => prev.filter((u) => u.shortenCode !== deletingCode));
      addToast('Short link pulled out of vault', 'info', 2500);
      setDeletingCode(null);
    } catch {
      addToast('Failed to delete link. Please try again.', 'error', 3000);
    } finally {
      setIsDeleting(false);
    }
  }

  // Export CSV
  function exportCsv() {
    if (urls.length === 0) return;
    const headers = 'Original Destination,Short Code,Full Short Link,Created Date\n';
    const rows = urls.map((u) => {
      const shortLink = `${window.location.origin}/r/${u.shortenCode}`;
      const date = new Date(u.createdAt).toISOString();
      return `"${u.originalUrl}","${u.shortenCode}","${shortLink}","${date}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NotThatShort-Vault-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Vault exported to CSV!', 'success', 2500);
  }

  // Filtered & sorted links
  const filteredAndSortedUrls = useMemo(() => {
    let list = [...urls];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.originalUrl?.toLowerCase().includes(q) ||
          u.shortenCode?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'az') {
      list.sort((a, b) => (a.originalUrl || '').localeCompare(b.originalUrl || ''));
    }

    return list;
  }, [urls, searchQuery, sortBy]);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container section">
        {/* Header with Culture Swagger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="tag-badge" style={{ marginBottom: '0.4rem' }}>
              POWER VAULT &bull; {urls.length} ACTIVE POWERHOUSES
            </div>
            <h1 className="text-h1">Command Center</h1>
            <p className="text-body">Manage your compact powerhouses. Perfectly proportioned to fit into any bio, story, or DM.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowBulkModal(true)} title="Shorten up to 10 URLs in one batch">
              Batch Mode
            </button>
            {urls.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={exportCsv} title="Export all vault links to CSV">
                Export Vault
              </button>
            )}
            <Link to="/profile">
              <button className="btn btn-outline btn-sm">
                Fuel Tank &amp; Account &rarr;
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="stats-strip">
          <div className="stat-box">
            <div className="stat-number" style={{ color: 'var(--primary-600)' }}>
              {loading ? '...' : urls.length}
            </div>
            <div className="stat-desc">Active Powerhouses</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">
              {loading ? '...' : (profile?.urlShortenedLeft ?? 100)}
            </div>
            <div className="stat-desc">Shots Left in Tank</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ color: 'var(--color-success)' }}>7 Days</div>
            <div className="stat-desc">Rock Solid Stamina (TTL)</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" style={{ color: 'var(--navy-900)' }}>&lt; 1ms</div>
            <div className="stat-desc">Turbo Redis Speed</div>
          </div>
        </div>

        {/* Shorten Box */}
        <div className="card-glass card-padded" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 className="text-h2">Trim The Overcompensation</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Packs serious girth in an 8-character frame.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowUtmModal(true)}
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                + Add UTM Campaign Tags
              </button>
              <span className="text-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                Press &ldquo;/&rdquo; to focus
              </span>
            </div>
          </div>

          <form onSubmit={handleShorten}>
            <div className="hero-input-row">
              <div className="input-with-icon" style={{ flex: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                <input
                  ref={inputRef}
                  id="dash-url-input"
                  type="text"
                  className="hero-input"
                  style={{ width: '100%' }}
                  placeholder="Paste any bloated, overcompensating long link..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                />
                {!newUrl && (
                  <button type="button" className="paste-btn-inline" onClick={handlePaste}>
                    Paste
                  </button>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={shortLoading}>
                {shortLoading ? (
                  <span className="spinner spinner-sm" />
                ) : (
                  <>Trim &amp; Deploy &rarr;</>
                )}
              </button>
            </div>
          </form>

          {shortError && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>
              {shortError}
            </div>
          )}

          {result && (
            <div className="result-card">
              <span className="result-url">{result}</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                <a href={result} target="_blank" rel="noreferrer">
                  <button className="btn btn-primary btn-sm">Open &nearr;</button>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Links Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="text-h2">
              Your Power Vault {urls.length > 0 && `(${filteredAndSortedUrls.length})`}
            </h2>
            
            {urls.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div className="search-input-wrap" style={{ minWidth: '200px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search vault..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  className="btn btn-outline btn-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.45rem 0.8rem', background: '#ffffff' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">A-Z Destination</option>
                </select>

                {/* View Switcher: Table vs Grid */}
                <div style={{ display: 'flex', border: '1px solid var(--border-medium)', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    title="Table view"
                    style={{
                      padding: '5px 8px',
                      background: viewMode === 'table' ? 'var(--navy-900)' : '#ffffff',
                      color: viewMode === 'table' ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="8" y1="6" x2="21" y2="6"></line>
                      <line x1="8" y1="12" x2="21" y2="12"></line>
                      <line x1="8" y1="18" x2="21" y2="18"></line>
                      <line x1="3" y1="6" x2="3.01" y2="6"></line>
                      <line x1="3" y1="12" x2="3.01" y2="12"></line>
                      <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grid card view"
                    style={{
                      padding: '5px 8px',
                      background: viewMode === 'grid' ? 'var(--navy-900)' : '#ffffff',
                      color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="card-glass" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ height: '36px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
                <div style={{ height: '48px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
                <div style={{ height: '48px', background: 'var(--bg-subtle)', borderRadius: '6px' }} />
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : urls.length === 0 ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '4.5rem 2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>Your vault is currently empty</h2>
              <p className="text-body" style={{ maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Stop sitting on clumsy 300-character links. Paste any destination URL into the box above to generate your first trimmed powerhouse.
              </p>
            </div>
          ) : filteredAndSortedUrls.length === 0 ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <p className="text-body">No powerhouses match your search query &ldquo;{searchQuery}&rdquo;</p>
              <button className="btn btn-ghost btn-sm" onClick={() => setSearchQuery('')} style={{ marginTop: '0.5rem' }}>
                Clear search
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredAndSortedUrls.map((u) => (
                <UrlCard
                  key={u.id}
                  url={u}
                  viewMode="grid"
                  onRequestDelete={(code) => setDeletingCode(code)}
                  onShowQr={(link) => setQrUrl(link)}
                  onShowAnalytics={(linkObj) => setAnalyticsUrl(linkObj)}
                />
              ))}
            </div>
          ) : (
            <div className="url-table-container">
              <table className="url-table">
                <thead>
                  <tr>
                    <th>Original Destination</th>
                    <th>Trimmed Power Link (Click to Copy)</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions &amp; Studio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUrls.map((u) => (
                    <UrlCard
                      key={u.id}
                      url={u}
                      viewMode="table"
                      onRequestDelete={(code) => setDeletingCode(code)}
                      onShowQr={(link) => setQrUrl(link)}
                      onShowAnalytics={(linkObj) => setAnalyticsUrl(linkObj)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* QR Studio Modal */}
      {qrUrl && <QrModal url={qrUrl} onClose={() => setQrUrl(null)} />}

      {/* UTM Campaign Builder Modal */}
      {showUtmModal && (
        <UtmBuilderModal
          initialUrl={newUrl}
          onApply={(taggedUrl) => setNewUrl(taggedUrl)}
          onClose={() => setShowUtmModal(false)}
        />
      )}

      {/* Bulk Batch Shortener Modal */}
      {showBulkModal && (
        <BulkShortenModal
          onComplete={loadData}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {/* Analytics Modal */}
      {analyticsUrl && (
        <LinkAnalyticsModal
          url={analyticsUrl}
          onClose={() => setAnalyticsUrl(null)}
        />
      )}

      {/* Branded In-App Delete Confirmation Modal */}
      {deletingCode && (
        <DeleteModal
          shortCode={deletingCode}
          deleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCode(null)}
        />
      )}
    </div>
  );
}
