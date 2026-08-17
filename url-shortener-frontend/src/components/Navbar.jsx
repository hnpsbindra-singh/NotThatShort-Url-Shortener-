import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
    setMobileOpen(false);
  }

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Not<span className="text-gradient">ThatShort</span></span>
          <span className="logo-badge nav-badge-desktop">BIG LINK ENERGY</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links navbar-links-desktop">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <button className={`btn btn-ghost btn-sm ${location.pathname === '/dashboard' ? 'nav-active' : ''}`}>Vault</button>
              </Link>
              <Link to="/profile">
                <button className={`btn btn-ghost btn-sm ${location.pathname === '/profile' ? 'nav-active' : ''}`}>Quota</button>
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="btn btn-ghost btn-sm">Sign In</button>
              </Link>
              <Link to="/register">
                <button className="btn btn-primary btn-sm">Get Started</button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Button (Mobile) */}
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span className={`hamburger-icon ${mobileOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-inner">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
                  Vault
                </Link>
                <Link to="/profile" className="mobile-nav-link" onClick={closeMenu}>
                  Quota
                </Link>
                <div className="mobile-menu-divider" />
                <button className="btn btn-outline btn-full" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={closeMenu}>
                  Sign In
                </Link>
                <div className="mobile-menu-divider" />
                <Link to="/register" onClick={closeMenu}>
                  <button className="btn btn-primary btn-full">Get Started</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
