import { useState } from 'react';
import { Add } from 'iconsax-react';
import PageTemplate from '../components/PageTemplate';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import { ARTICLES, TOPICS } from '../data/mockData';
import { getUserArticles } from '../data/articleStore';

interface HomePageProps {
  isLoggedIn: boolean;
  onAuthChange: (v: boolean) => void;
}

export default function HomePage({ isLoggedIn, onAuthChange }: HomePageProps) {
  const [activeTopic, setActiveTopic] = useState('For You');

  // Merge user-written articles (newest first) with mock articles
  const allArticles = [...getUserArticles(), ...ARTICLES];

  const filteredArticles = activeTopic === 'For You' || activeTopic === 'Following'
    ? allArticles
    : allArticles.filter(a => a.tags.some(t => t.toLowerCase() === activeTopic.toLowerCase()));

  return (
    <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
      {/* Topic bar */}
      <div className="topic-bar">
        <div className="topic-bar-inner">
          <button
            className="topic-pill"
            aria-label="Add topics"
            title="Add topics"
            style={{ padding: '6px 8px' }}
          >
            <Add size={18} />
          </button>
          {TOPICS.map(topic => (
            <button
              key={topic}
              className={`topic-pill ${activeTopic === topic ? 'active' : ''}`}
              onClick={() => setActiveTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="home-layout">
        {/* Feed */}
        <div className="article-feed">
          {filteredArticles.length === 0 ? (
            <div style={{ padding: '48px 0', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <p style={{ fontSize: 16 }}>No articles found in "{activeTopic}"</p>
              <button
                style={{ marginTop: 12, color: 'var(--accent)', fontSize: 14, cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={() => setActiveTopic('For You')}
              >
                Back to For You
              </button>
            </div>
          ) : (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>
    </PageTemplate>
  );
}
