import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function UrlCard({ url, onRequestDelete, onShowQr, onShowAnalytics, viewMode = 'table' }) {
  const { addToast }            = useToast();
  const [copied, setCopied]     = useState(false);

  const shortLink = `${window.location.origin}/r/${url.shortenCode}`;

  // Extract domain for favicon and clean label
  let domain = '';
  try {
    const parsed = new URL(url.originalUrl.startsWith('http') ? url.originalUrl : `https://${url.originalUrl}`);
    domain = parsed.hostname.replace('www.', '');
  } catch {
    domain = url.originalUrl;
  }

  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null;

  async function handleCopy(e) {
    if (e) e.stopPropagation();
    await navigator.clipboard.writeText(shortLink);
    setCopied(true);
    addToast('Link copied to clipboard', 'success', 2200);
    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  const createdDate = new Date(url.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // ── Grid Card View ──────────────────────────────────────────────────────────
  if (viewMode === 'grid') {
    return (
      <div className="card-glass fade-in" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="favicon-chip">
              {faviconUrl ? (
                <img src={faviconUrl} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              )}
            </div>
            <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: '0.9rem' }}>
              {domain}
            </span>
          </div>

          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {createdDate}
          </span>
        </div>

        {/* Original URL preview */}
        <div 
          style={{ 
            fontSize: '0.825rem', 
            color: 'var(--text-muted)', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            background: 'var(--bg-subtle)',
            padding: '6px 10px',
            borderRadius: '6px'
          }} 
          title={url.originalUrl}
        >
          {url.originalUrl}
        </div>

        {/* Short Code Pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="short-pill"
            onClick={handleCopy}
            title="Click to copy"
          >
            <span>/r/{url.shortenCode}</span>
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--color-success)' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>

          <a href={shortLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
            Open &nearr;
          </a>
        </div>

        {/* Card Actions Footer */}
        <div style={{ display: 'flex', gap: '6px', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button className="btn btn-outline btn-sm btn-full" onClick={() => onShowQr(shortLink)}>
            QR Code
          </button>
          <button className="btn btn-outline btn-sm btn-full" onClick={() => onShowAnalytics(url)}>
            Stats
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onRequestDelete(url.shortenCode)} title="Delete">
            &times;
          </button>
        </div>
      </div>
    );
  }

  // ── Table Row View ──────────────────────────────────────────────────────────
  return (
    <tr className="fade-in">
      {/* Destination with Favicon */}
      <td style={{ maxWidth: '320px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="favicon-chip">
            {faviconUrl ? (
              <img 
                src={faviconUrl} 
                alt="" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
              </svg>
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {domain}
            </div>
            <div 
              style={{ 
                fontSize: '0.775rem', 
                color: 'var(--text-muted)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}
              title={url.originalUrl}
            >
              {url.originalUrl}
            </div>
          </div>
        </div>
      </td>

      {/* Short link badge */}
      <td>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="short-pill"
            onClick={handleCopy}
            title="Click to copy short link"
            style={{ cursor: 'pointer' }}
          >
            <span>/r/{url.shortenCode}</span>
            {copied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-success)' }}>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>

          <a
            href={shortLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            title="Open in new tab"
            style={{ padding: '4px 6px', color: 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </td>

      {/* Created Date */}
      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {createdDate}
      </td>

      {/* Actions */}
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onShowQr(shortLink)}
            title="Generate QR Code"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>QR</span>
          </button>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onShowAnalytics(url)}
            title="View link performance"
            style={{ padding: '0.35rem 0.65rem' }}
          >
            Stats
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>Copied</span>
            ) : (
              'Copy'
            )}
          </button>

          <button
            className="btn btn-danger btn-sm"
            onClick={() => onRequestDelete(url.shortenCode)}
            title="Delete link"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
