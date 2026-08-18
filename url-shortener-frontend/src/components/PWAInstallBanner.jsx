import { useState, useEffect } from 'react';

/**
 * PWAInstallBanner
 * Shows a native-style "Add to Home Screen" banner when the browser
 * fires the beforeinstallprompt event (Android/Desktop Chrome, Edge, etc.).
 * Dismissed state is persisted in localStorage so it doesn't reappear.
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    function handlePrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      localStorage.setItem('pwa-banner-dismissed', '1');
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('pwa-banner-dismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="pwa-banner" role="banner" aria-live="polite">
      <div className="pwa-banner-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="pwa-banner-text">
        <strong>Install NotThatShort</strong>
        <span>Add to home screen for Big Link Energy, anywhere.</span>
      </div>
      <div className="pwa-banner-actions">
        <button className="btn btn-primary btn-sm" onClick={handleInstall}>Install</button>
        <button className="btn btn-ghost btn-sm pwa-dismiss" onClick={handleDismiss} aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
