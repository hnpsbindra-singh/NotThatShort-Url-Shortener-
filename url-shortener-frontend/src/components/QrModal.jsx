import { useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { useToast } from '../context/ToastContext';

const PRESET_COLORS = [
  { name: 'Navy', hex: '#0b1736' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Charcoal', hex: '#1e293b' },
  { name: 'Crimson', hex: '#dc2626' }
];

export default function QrModal({ url, onClose }) {
  const { addToast }            = useToast();
  const canvasContainerRef      = useRef(null);
  const svgContainerRef         = useRef(null);
  const [fgColor, setFgColor]   = useState('#0b1736');
  const [format, setFormat]     = useState('png'); // png or svg

  function downloadPng() {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const urlPng = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = urlPng;
    link.download = `NotThatShort-QR-${url.split('/').pop()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('PNG QR code downloaded!', 'success', 2500);
  }

  function downloadSvg() {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `NotThatShort-QR-${url.split('/').pop()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(svgUrl);
    addToast('SVG vector QR code downloaded!', 'success', 2500);
  }

  function handlePrint() {
    window.print();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    addToast('Short link copied to clipboard!', 'success', 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content card-padded" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <span className="tag-badge">QR CODE STUDIO</span>
            <h2 className="text-h2" style={{ marginTop: '0.3rem' }}>Customize &amp; Export</h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* QR Code Preview Box */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="qr-box" style={{ padding: '16px', borderRadius: '14px', border: '1.5px solid var(--border-light)' }}>
            <div ref={canvasContainerRef} style={{ display: format === 'png' ? 'block' : 'none' }}>
              <QRCodeCanvas
                value={url}
                size={200}
                bgColor="#ffffff"
                fgColor={fgColor}
                level="H"
                marginSize={2}
              />
            </div>
            <div ref={svgContainerRef} style={{ display: format === 'svg' ? 'block' : 'none' }}>
              <QRCodeSVG
                value={url}
                size={200}
                bgColor="#ffffff"
                fgColor={fgColor}
                level="H"
                marginSize={2}
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Choose QR Color
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setFgColor(c.hex)}
                  title={c.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: c.hex,
                    border: fgColor === c.hex ? '3px solid #3b82f6' : '2px solid #ffffff',
                    boxShadow: fgColor === c.hex ? '0 0 0 2px rgba(59, 130, 246, 0.4)' : '0 1px 3px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Target link label */}
          <div style={{ textAlign: 'center', width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div className="text-mono" style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 700, wordBreak: 'break-all' }}>
              {url}
            </div>
          </div>

          {/* Export & Actions Grid */}
          <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '0.25rem' }}>
            <button className="btn btn-primary btn-full" onClick={downloadPng}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Save PNG
            </button>
            <button className="btn btn-outline" onClick={downloadSvg} title="Save vector SVG for print">
              SVG
            </button>
            <button className="btn btn-outline" onClick={copyLink} title="Copy short link">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
