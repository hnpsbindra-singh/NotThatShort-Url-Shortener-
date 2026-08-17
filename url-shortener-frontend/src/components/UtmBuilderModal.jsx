import { useState } from 'react';

const PRESETS = [
  { name: 'Google Ads', source: 'google', medium: 'cpc', campaign: 'spring_promo' },
  { name: 'Facebook Ad', source: 'facebook', medium: 'social_ad', campaign: 'retargeting' },
  { name: 'X / Twitter', source: 'twitter', medium: 'social', campaign: 'tweet_thread' },
  { name: 'Newsletter', source: 'newsletter', medium: 'email', campaign: 'weekly_digest' },
  { name: 'LinkedIn Post', source: 'linkedin', medium: 'organic_social', campaign: 'thought_leadership' }
];

export default function UtmBuilderModal({ initialUrl = '', onApply, onClose }) {
  const [baseUrl, setBaseUrl]         = useState(initialUrl);
  const [utmSource, setUtmSource]     = useState('');
  const [utmMedium, setUtmMedium]     = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm]         = useState('');
  const [utmContent, setUtmContent]   = useState('');

  function applyPreset(p) {
    setUtmSource(p.source);
    setUtmMedium(p.medium);
    setUtmCampaign(p.campaign);
  }

  // Build the tagged URL in real-time
  let builtUrl = baseUrl.trim();
  if (builtUrl) {
    try {
      const urlObj = new URL(builtUrl.startsWith('http') ? builtUrl : `https://${builtUrl}`);
      if (utmSource.trim())   urlObj.searchParams.set('utm_source', utmSource.trim());
      if (utmMedium.trim())   urlObj.searchParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign.trim()) urlObj.searchParams.set('utm_campaign', utmCampaign.trim());
      if (utmTerm.trim())     urlObj.searchParams.set('utm_term', utmTerm.trim());
      if (utmContent.trim())  urlObj.searchParams.set('utm_content', utmContent.trim());
      builtUrl = urlObj.toString();
    } catch {
      // Keep basic
    }
  }

  function handleSave(e) {
    e.preventDefault();
    if (!baseUrl.trim()) return;
    onApply(builtUrl);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card-padded fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="tag-badge">UTM CAMPAIGN BUILDER</span>
            <h2 className="text-h2" style={{ marginTop: '0.35rem' }}>Tag &amp; Track Traffic</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Quick Presets
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => applyPreset(p)}
                style={{ fontSize: '0.775rem', padding: '0.25rem 0.65rem' }}
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="utm-base">Destination URL *</label>
            <input
              id="utm-base"
              type="text"
              className="form-input"
              placeholder="https://example.com/landing-page"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="utm-source">UTM Source</label>
              <input
                id="utm-source"
                type="text"
                className="form-input"
                placeholder="google, twitter, newsletter"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="utm-medium">UTM Medium</label>
              <input
                id="utm-medium"
                type="text"
                className="form-input"
                placeholder="cpc, social, email"
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="utm-camp">UTM Campaign</label>
              <input
                id="utm-camp"
                type="text"
                className="form-input"
                placeholder="summer_sale, launch_2026"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="utm-content">UTM Content / Term</label>
              <input
                id="utm-content"
                type="text"
                className="form-input"
                placeholder="banner_cta, hero_btn"
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
              />
            </div>
          </div>

          {/* Real-time Preview */}
          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Tagged URL Output
            </div>
            <div className="text-mono" style={{ fontSize: '0.825rem', color: 'var(--navy-900)', wordBreak: 'break-all', maxHeight: '60px', overflowY: 'auto' }}>
              {builtUrl || 'Enter a destination URL above to preview...'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-full">
              Use Tagged URL &rarr;
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
