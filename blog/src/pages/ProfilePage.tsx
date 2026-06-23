import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Link1, People } from 'iconsax-react';
import PageTemplate from '../components/PageTemplate';
import ArticleCard from '../components/ArticleCard';
import { AUTHORS, ARTICLES } from '../data/mockData';
import { getUserArticles, CURRENT_USER as ME } from '../data/articleStore';

interface ProfilePageProps {
  isLoggedIn: boolean;
  onAuthChange: (v: boolean) => void;
}

export default function ProfilePage({ isLoggedIn, onAuthChange }: ProfilePageProps) {
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState<'home' | 'lists' | 'about'>('home');
  const [following, setFollowing] = useState(false);

  const isOwn = username === 'me';
  const author = isOwn
    ? {
        id: 'me',
        name: ME.name,
        username: 'me',
        avatar: ME.avatar,
        bio: ME.bio,
        followers: ME.followers,
        following: ME.following,
      }
    : AUTHORS.find(a => a.username === username);

  if (!author) {
    return (
      <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>User not found</h1>
          <Link to="/" style={{ color: 'var(--accent)' }}>← Back to home</Link>
        </div>
      </PageTemplate>
    );
  }

  // For the "me" profile, load fresh from localStorage on each render
  const authorArticles = isOwn
    ? getUserArticles()
    : ARTICLES.filter(a => a.author.username === username);

  return (
    <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
      {/* Profile header */}
      <div className="profile-header">
        <div className="profile-header-inner">
          <div style={{ flex: 1, paddingBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 className="profile-name">{author.name}</h1>
                <p className="profile-bio">{author.bio}</p>
                <div className="profile-stats">
                  <span><strong>{author.followers.toLocaleString()}</strong> followers</span>
                  <span><strong>{author.following}</strong> following</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <People size={14} /> {authorArticles.length} stories
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="profile-avatar">
                  <img src={author.avatar} alt={author.name} />
                </div>
                {!isOwn ? (
                  <button
                    className={`btn-follow ${following ? 'following' : ''}`}
                    onClick={() => setFollowing(v => !v)}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="article-toolbar-btn" aria-label="Edit profile">
                      <Edit size={18} />
                    </button>
                    <button className="article-toolbar-btn" aria-label="Share profile">
                      <Link1 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              {(['home', 'lists', 'about'] as const).map(tab => (
                <button
                  key={tab}
                  className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {activeTab === 'home' && (
          <div style={{ maxWidth: 740 }}>
            {authorArticles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
                <p>No stories published yet.</p>
                {isOwn && (
                  <Link
                    to="/write"
                    style={{ display: 'inline-block', marginTop: 16, background: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: 100, fontSize: 14, fontWeight: 500 }}
                  >
                    Write your first story
                  </Link>
                )}
              </div>
            ) : (
              <div className="article-feed">
                {authorArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div style={{ maxWidth: 740, textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
            <Save2Icon />
            <p style={{ fontSize: 16, marginTop: 16 }}>No lists yet</p>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-light)',
              borderRadius: 8,
              padding: 24,
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>About {author.name}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{author.bio}</p>
              <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: 14, color: 'var(--text-muted)' }}>
                <span><strong style={{ color: 'var(--text-primary)' }}>{author.followers.toLocaleString()}</strong> followers</span>
                <span><strong style={{ color: 'var(--text-primary)' }}>{author.following}</strong> following</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

function Save2Icon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 3H7C5.9 3 5 3.9 5 5v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
    </svg>
  );
}
