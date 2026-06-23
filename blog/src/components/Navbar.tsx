import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SearchNormal1, Edit, Notification, CloseCircle } from 'iconsax-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface NavbarProps {
  onSignIn?: () => void;
}

export default function Navbar({ onSignIn }: NavbarProps) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications/unread-count');
          setUnreadCount(res.data.count);
        } catch (error) {
          console.error(error);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

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
                aria-label="Notifications"
                onClick={async () => {
                   await api.patch('/notifications/read-all');
                   setUnreadCount(0);
                }}
              >
                <Notification size={20} color="var(--text-secondary)" />
                {unreadCount > 0 && <span className="notification-dot"></span>}
              </button>
              <Link to={`/profile/${user?.username}`} className="navbar-avatar" aria-label="Profile">
                <img
                  src={user?.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=me&backgroundColor=ffd5dc"}
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
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signin') {
        await login({ email, password });
      } else {
        await register({ name, username, email, password });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
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

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <input
                className="modal-input"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </>
          )}
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
