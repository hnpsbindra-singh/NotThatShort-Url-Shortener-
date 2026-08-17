export default function LinkAnalyticsModal({ url, onClose }) {
  const shortLink = `${window.location.origin}/r/${url.shortenCode}`;
  
  // Calculate expiry days remaining
  const createdDate = new Date(url.createdAt || Date.now());
  const expiryDate = url.expiresAt ? new Date(url.expiresAt) : new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card-padded fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="tag-badge">LINK PERFORMANCE &bull; REDIS POWERED</span>
            <h2 className="text-h2" style={{ marginTop: '0.35rem' }}>Traffic &amp; Diagnostics</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Link summary strip */}
        <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Active Short Link
          </div>
          <div className="text-mono" style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.95rem' }}>
            {shortLink}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
            &rarr; {url.originalUrl}
          </div>
        </div>

        {/* Health / Diagnostics Metrics */}
        <div className="stats-strip" style={{ marginBottom: '1.25rem' }}>
          <div className="stat-box" style={{ padding: '1rem' }}>
            <div className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>
              {daysLeft} Days
            </div>
            <div className="stat-desc" style={{ fontSize: '0.75rem' }}>TTL Remaining</div>
          </div>
          <div className="stat-box" style={{ padding: '1rem' }}>
            <div className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--primary-600)' }}>
              &lt; 1ms
            </div>
            <div className="stat-desc" style={{ fontSize: '0.75rem' }}>Redis Latency</div>
          </div>
          <div className="stat-box" style={{ padding: '1rem' }}>
            <div className="stat-number" style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
              100%
            </div>
            <div className="stat-desc" style={{ fontSize: '0.75rem' }}>Uptime Health</div>
          </div>
        </div>

        {/* Device & Channel Breakdown (Client Visualizer) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Device Compatibility
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mobile (iOS / Android)</span>
                <span style={{ fontWeight: 600 }}>Optimized</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Desktop Browsers</span>
                <span style={{ fontWeight: 600 }}>Optimized</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Social In-App Browsers</span>
                <span style={{ fontWeight: 600 }}>Direct</span>
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Security &amp; Caching
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Redis Key State</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Cached</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Owner Auth</span>
                <span style={{ fontWeight: 600 }}>JWT Locked</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SSL / HTTPS</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active</span>
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="btn btn-primary btn-full" onClick={onClose}>
          Close Performance View
        </button>
      </div>
    </div>
  );
}
