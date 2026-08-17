import { useState } from 'react';
import { shortenUrl } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function BulkShortenModal({ onComplete, onClose }) {
  const { addToast }          = useToast();
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);

  async function handleBulkShorten(e) {
    e.preventDefault();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;
    if (lines.length > 10) {
      addToast('Maximum 10 URLs per bulk batch', 'error', 3000);
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: lines.length });
    const trimmed = [];

    for (let i = 0; i < lines.length; i++) {
      let rawUrl = lines[i];
      if (!/^https?:\/\//i.test(rawUrl)) {
        rawUrl = 'https://' + rawUrl;
      }

      try {
        const res = await shortenUrl({ originalUrl: rawUrl });
        const rawCode = typeof res.data === 'string' ? res.data.trim() : String(res.data);
        const code = rawCode.split('/').filter(Boolean).pop();
        trimmed.push({ original: rawUrl, short: `${window.location.origin}/r/${code}`, success: true });
      } catch {
        trimmed.push({ original: rawUrl, error: 'Quota exceeded or invalid', success: false });
      }
      setProgress({ current: i + 1, total: lines.length });
    }

    setResults(trimmed);
    setLoading(false);
    addToast(`Processed ${trimmed.length} links!`, 'success', 3000);
    onComplete();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card-padded fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="tag-badge">BATCH SHORTENER</span>
            <h2 className="text-h2" style={{ marginTop: '0.35rem' }}>Trim Multiple Links</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {results.length === 0 ? (
          <form onSubmit={handleBulkShorten} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="bulk-text">
                Paste URLs (1 URL per line, up to 10):
              </label>
              <textarea
                id="bulk-text"
                className="form-input text-mono"
                rows={6}
                placeholder={"https://github.com/profile\nhttps://youtube.com/watch?v=123\nhttps://notion.so/my-doc"}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            {loading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>Shortening batch...</span>
                  <span style={{ fontWeight: 700 }}>{progress.current} / {progress.total}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="spinner spinner-sm" /> : 'Shorten All Links &rarr;'}
              </button>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Batch Completed ({results.filter(r => r.success).length} succeeded):
              </div>
              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.map((r, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                      {r.original}
                    </div>
                    {r.success ? (
                      <div className="text-mono" style={{ color: 'var(--primary-600)', fontWeight: 700, marginTop: '2px' }}>
                        {r.short}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--color-danger)', fontSize: '0.775rem' }}>
                        {r.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-full" onClick={onClose}>
              Done &amp; View Vault
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
