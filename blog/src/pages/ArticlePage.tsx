import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, HeartAdd, Message, Save2, Share, More, ArrowLeft, Link1,
} from 'iconsax-react';
import PageTemplate from '../components/PageTemplate';
import ArticleCard from '../components/ArticleCard';
import { ARTICLES, formatClaps } from '../data/mockData';
import { getUserArticles } from '../data/articleStore';

interface ArticlePageProps {
  isLoggedIn: boolean;
  onAuthChange: (v: boolean) => void;
}

export default function ArticlePage({ isLoggedIn, onAuthChange }: ArticlePageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Look up in mock articles first, then user-created articles
  const article = ARTICLES.find(a => a.id === id) ?? getUserArticles().find(a => a.id === id);

  const [claps, setClaps] = useState(0);
  const [clapped, setClapped] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (article) setClaps(article.claps);
  }, [article]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  if (!article) {
    return (
      <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>Article not found</h1>
          <button
            onClick={() => navigate('/')}
            style={{ color: 'var(--accent)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Back to home
          </button>
        </div>
      </PageTemplate>
    );
  }

  // Render Quill HTML directly (it's already valid HTML)
  const renderBody = (html: string) => {
    // If the body contains HTML tags (from Quill), render as-is.
    // Otherwise fall back to simple paragraph splitting for mock data.
    const isQuillHtml = /<[a-z][\s\S]*>/i.test(html);
    if (isQuillHtml) {
      return { __html: html };
    }
    return { __html: html
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
    };
  };

  const moreArticles = ARTICLES.filter(
    a => a.id !== article.id && a.author.id === article.author.id
  ).slice(0, 2);

  const relatedArticles = ARTICLES.filter(
    a => a.id !== article.id && a.tags.some(t => article.tags.includes(t))
  ).slice(0, 3);

  return (
    <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="article-page">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-secondary)', fontSize: 14,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '16px 0', marginBottom: '8px'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Hero */}
        <div className="article-hero">
          {/* Tags */}
          <div className="article-tag-list">
            {article.tags.map(tag => (
              <span key={tag} className="article-tag">{tag}</span>
            ))}
            {article.isMemberOnly && (
              <span style={{
                background: '#ffc017',
                color: '#1a1a1a',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '3px',
                letterSpacing: '0.5px',
              }}>
                ★ MEMBER ONLY
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="article-title">{article.title}</h1>
          <p className="article-subtitle">{article.subtitle}</p>

          {/* Author bar */}
          <div className="article-author-bar">
            <div className="article-author-info">
              <Link to={`/profile/${article.author.username}`} className="article-author-avatar">
                <img src={article.author.avatar} alt={article.author.name} />
              </Link>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link
                    to={`/profile/${article.author.username}`}
                    className="article-author-name"
                  >
                    {article.author.name}
                  </Link>
                  <button
                    className="btn-follow-inline"
                    onClick={() => setFollowing(v => !v)}
                  >
                    {following ? '· Following' : '· Follow'}
                  </button>
                </div>
                <div className="article-author-meta">
                  <span>{article.readTime} min read</span>
                  <span className="dot-sep" />
                  <span>{article.publishedAt}</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="article-toolbar">
              <button
                className={`article-toolbar-btn ${clapped ? 'active' : ''}`}
                onClick={() => {
                  setClapped(v => !v);
                  setClaps(c => clapped ? c - 1 : c + 1);
                }}
                aria-label="Clap"
              >
                {clapped
                  ? <Heart size={20} variant="Bold" color="#e03131" />
                  : <HeartAdd size={20} />
                }
                <span>{formatClaps(claps)}</span>
              </button>
              <button className="article-toolbar-btn" aria-label="Comments">
                <Message size={20} />
                <span>{article.comments}</span>
              </button>
              <button
                className="article-toolbar-btn"
                onClick={() => { setSaved(v => !v); showToast(saved ? 'Removed from list' : 'Saved to reading list'); }}
                aria-label="Save"
              >
                <Save2 size={20} variant={saved ? 'Bold' : 'Linear'} color={saved ? 'var(--accent)' : undefined} />
              </button>
              <button
                className="article-toolbar-btn"
                onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied!'); }}
                aria-label="Share"
              >
                <Share size={20} />
              </button>
              <button className="article-toolbar-btn" aria-label="More">
                <More size={20} />
              </button>
            </div>
          </div>

          {/* Cover image */}
          <img
            src={article.thumbnail}
            alt={article.title}
            className="article-cover-image"
          />
        </div>

        {/* Body */}
        <div
          className="article-body"
          dangerouslySetInnerHTML={renderBody(article.body)}
        />

        {/* Clap zone */}
        <div className="article-clap-zone">
          <button
            className={`clap-btn ${clapped ? 'clapped' : ''}`}
            onClick={() => {
              setClapped(v => !v);
              setClaps(c => clapped ? c - 1 : c + 1);
            }}
          >
            {clapped
              ? <Heart size={28} variant="Bold" color="#e03131" />
              : <HeartAdd size={28} />
            }
            <span style={{ fontSize: 16, fontWeight: 500 }}>{formatClaps(claps)}</span>
          </button>
          <button className="clap-btn" aria-label="Comments">
            <Message size={24} />
            <span style={{ fontSize: 14 }}>{article.comments} responses</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
            <button
              className="clap-btn"
              onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Link copied!'); }}
              aria-label="Copy link"
            >
              <Link1 size={20} />
            </button>
            <button
              className="clap-btn"
              onClick={() => { setSaved(v => !v); showToast(saved ? 'Removed from list' : 'Saved!'); }}
              aria-label="Save"
            >
              <Save2 size={20} variant={saved ? 'Bold' : 'Linear'} color={saved ? 'var(--accent)' : undefined} />
            </button>
          </div>
        </div>

        {/* Author card */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: 8,
          padding: '32px',
          margin: '40px 0',
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
        }}>
          <Link to={`/profile/${article.author.username}`}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <img src={article.author.avatar} alt={article.author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <Link to={`/profile/${article.author.username}`}>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{article.author.name}</span>
              </Link>
              <button
                className={`btn-follow ${following ? 'following' : ''}`}
                onClick={() => setFollowing(v => !v)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{article.author.bio}</p>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {article.author.followers.toLocaleString()} followers
            </span>
          </div>
        </div>

        {/* More from author */}
        {moreArticles.length > 0 && (
          <div className="more-from-section">
            <h2 className="more-from-title">More from {article.author.name}</h2>
            <div className="article-feed">
              {moreArticles.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}

        {/* Related reading */}
        {relatedArticles.length > 0 && (
          <div className="more-from-section">
            <h2 className="more-from-title">Recommended Reading</h2>
            <div className="article-feed">
              {relatedArticles.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </PageTemplate>
  );
}
