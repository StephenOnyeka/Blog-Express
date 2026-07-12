import { useState } from 'react';
import { api } from '../lib/api';

export default function Footer() {
  const links = [
    'Help', 'Status', 'About', 'Careers', 'Blog',
    'Privacy', 'Terms', 'Text to speech', 'Teams'
  ];

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await api.post('/subscriptions', { email, newsletter: true });
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner" style={{ flexDirection: 'column', gap: 20 }}>
        <form
          onSubmit={handleSubscribe}
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Get the weekly digest
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
            required
            style={{
              border: '1px solid var(--border-light)', borderRadius: 100,
              padding: '8px 16px', fontSize: 14, outline: 'none',
              fontFamily: 'var(--font-sans)', minWidth: 220,
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-getstarted"
            style={{ padding: '8px 18px' }}
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
          {status === 'done' && (
            <span style={{ fontSize: 13, color: 'var(--accent, green)' }}>
              Check your inbox to confirm!
            </span>
          )}
          {status === 'error' && (
            <span style={{ fontSize: 13, color: 'red' }}>Something went wrong.</span>
          )}
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {links.map(link => (
            <span key={link} className="footer-link" style={{ cursor: 'pointer' }}>{link}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
