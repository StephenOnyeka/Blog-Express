import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendUp, Star1, People, Tag2, ArrowRight2 } from 'iconsax-react';
import {
  STAFF_PICKS, TRENDING, RECOMMENDED_TOPICS, WHO_TO_FOLLOW,
  formatClaps, type Article,
} from '../data/mockData';

export default function Sidebar() {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="sidebar">
      {/* Staff Picks */}
      <section className="sidebar-section">
        <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Star1 size={16} variant="Bold" color="#ffc017" />
          Staff Picks
        </div>
        {STAFF_PICKS.map(article => (
          <StaffPickCard key={article.id} article={article} />
        ))}
        <Link to="/" className="see-more-link">See the full list</Link>
      </section>

      <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0 24px' }} />

      {/* Trending */}
      <section className="sidebar-section">
        <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendUp size={16} />
          Trending on BlogNest
        </div>
        {TRENDING.slice(0, 5).map((article, i) => (
          <TrendingCard key={article.id} article={article} index={i + 1} />
        ))}
      </section>

      <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0 24px' }} />

      {/* Who to Follow */}
      <section className="sidebar-section">
        <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <People size={16} />
          Who to Follow
        </div>
        {WHO_TO_FOLLOW.map(author => (
          <div key={author.id} className="follow-card">
            <div className="follow-card-left">
              <div className="follow-card-avatar">
                <img src={author.avatar} alt={author.name} />
              </div>
              <div>
                <Link to={`/profile/${author.username}`} className="follow-card-name hover-underline">
                  {author.name}
                </Link>
                <p className="follow-card-bio">{author.bio}</p>
              </div>
            </div>
            <button
              className={`btn-follow ${followed[author.id] ? 'following' : ''}`}
              onClick={() => toggleFollow(author.id)}
            >
              {followed[author.id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
        <Link to="/" className="see-more-link" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          See more suggestions <ArrowRight2 size={14} />
        </Link>
      </section>

      <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0 24px' }} />

      {/* Recommended Topics */}
      <section className="sidebar-section">
        <div className="sidebar-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag2 size={16} />
          Recommended Topics
        </div>
        <div className="topics-grid">
          {RECOMMENDED_TOPICS.map(topic => (
            <span key={topic} className="topic-tag">{topic}</span>
          ))}
        </div>
        <Link to="/" className="see-more-link" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
          See more topics <ArrowRight2 size={14} />
        </Link>
      </section>

      {/* Footer links */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
          {['Help', 'Status', 'About', 'Careers', 'Blog', 'Privacy', 'Terms', 'Text to speech', 'Teams'].map(link => (
            <span key={link} className="footer-link" style={{ cursor: 'pointer' }}>{link}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function StaffPickCard({ article }: { article: Article }) {
  return (
    <Link to={`/article/${article.id}`} className="staff-pick-card" style={{ textDecoration: 'none' }}>
      <div className="staff-pick-author-avatar">
        <img src={article.author.avatar} alt={article.author.name} />
      </div>
      <div className="staff-pick-info">
        <div className="staff-pick-author">{article.author.name}</div>
        <div className="staff-pick-title">{article.title}</div>
        <div className="staff-pick-meta">{formatClaps(article.claps)} claps · {article.readTime} min read</div>
      </div>
    </Link>
  );
}

function TrendingCard({ article, index }: { article: Article; index: number }) {
  return (
    <Link to={`/article/${article.id}`} className="trending-card" style={{ textDecoration: 'none' }}>
      <span className="trending-number">0{index}</span>
      <div className="trending-info">
        <div className="trending-author">
          <div className="trending-author-avatar">
            <img src={article.author.avatar} alt={article.author.name} />
          </div>
          <span className="trending-author-name">{article.author.name}</span>
        </div>
        <div className="trending-title">{article.title}</div>
        <div className="trending-meta">{article.publishedAt} · {article.readTime} min read</div>
      </div>
    </Link>
  );
}
