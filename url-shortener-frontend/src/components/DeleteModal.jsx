export default function DeleteModal({ shortCode, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-content card-padded fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h2 className="text-h2" style={{ marginBottom: '0.4rem' }}>Delete Short Link?</h2>
          <p className="text-body" style={{ fontSize: '0.9rem' }}>
            Are you sure you want to permanently remove <strong className="text-mono" style={{ color: 'var(--navy-900)' }}>/r/{shortCode}</strong>? This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-full" onClick={onCancel} disabled={deleting}>
            Cancel
          </button>
          <button className="btn btn-danger btn-full" onClick={onConfirm} disabled={deleting}>
            {deleting ? <span className="spinner spinner-sm" /> : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
