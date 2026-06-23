import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SearchNormal1, Edit, Notification, Add, CloseCircle } from 'iconsax-react';

interface NavbarProps {
  onSignIn?: () => void;
  isLoggedIn?: boolean;
}

export default function Navbar({ onSignIn, isLoggedIn = false }: NavbarProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">BlogNest</Link>

        {/* Search */}
        <div className="navbar-search">
          <SearchNormal1 size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/search?q=${search}`)}
          />
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <Link to="/write" className="btn-write">
                <Edit size={18} color="var(--text-secondary)" />
                <span>Write</span>
              </Link>
              <button
                className="navbar-avatar"
                style={{ position: 'relative' }}
                onClick={() => navigate('/profile/me')}
                aria-label="Notifications"
              >
                <Notification size={20} color="var(--text-secondary)" />
                <span className="notification-dot"></span>
              </button>
              <Link to="/profile/me" className="navbar-avatar" aria-label="Profile">
                <img
                  src="https://api.dicebear.com/9.x/avataaars/svg?seed=me&backgroundColor=ffd5dc"
                  alt="Your avatar"
                />
              </Link>
            </>
          ) : (
            <>
              <Link to="/write" className="btn-write">
                <Edit size={18} color="var(--text-secondary)" />
                <span>Write</span>
              </Link>
              <button className="btn-signin" onClick={onSignIn}>Sign in</button>
              <button className="btn-getstarted" onClick={onSignIn}>Get started</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ========== Sign In Modal ========== */
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, mode, onToggleMode, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) onSuccess();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseCircle size={22} />
        </button>
        <h2 className="modal-title">
          {mode === 'signin' ? 'Welcome back.' : 'Join BlogNest.'}
        </h2>

        <button className="modal-oauth-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>
        <button className="modal-oauth-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Continue with Facebook
        </button>

        <div className="modal-divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <input
            className="modal-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="modal-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="modal-submit" type="submit">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="modal-footer">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <a onClick={onToggleMode}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  );
}
