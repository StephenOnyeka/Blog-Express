import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, HeartAdd, Save2, Message, More,
} from 'iconsax-react';
import type { Article } from '../data/mockData';
import { formatClaps } from '../data/mockData';

interface ArticleCardProps {
  article: Article;
  showThumbnail?: boolean;
}

export default function ArticleCard({ article, showThumbnail = true }: ArticleCardProps) {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [claps, setClaps] = useState(article.claps);

  const handleClap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(v => !v);
    setClaps(c => liked ? c - 1 : c + 1);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(v => !v);
  };

  return (
    <Link to={`/article/${article.id}`} className="article-card" style={{ textDecoration: 'none' }}>
      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author row */}
        <div className="article-card-author">
          <div className="article-card-author-avatar">
            <img src={article.author.avatar} alt={article.author.name} />
          </div>
          <span className="article-card-author-name">{article.author.name}</span>
          {article.isMemberOnly && (
            <span style={{
              background: '#ffc017',
              color: '#1a1a1a',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '3px',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}>
              Member Only
            </span>
          )}
        </div>

        {/* Title + Subtitle */}
        <h2 className="article-card-title">{article.title}</h2>
        <p className="article-card-subtitle">{article.subtitle}</p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div className="article-card-meta">
            <span className="article-card-date">{article.publishedAt}</span>
            <span className="dot-sep" />
            <span className="article-card-read-time">{article.readTime} min read</span>
            {article.tags.slice(0, 1).map(tag => (
              <span key={tag} className="article-card-tag">{tag}</span>
            ))}
          </div>

          <div className="article-card-actions">
            <button
              className={`article-card-action-btn ${liked ? 'saved' : ''}`}
              onClick={handleClap}
              aria-label="Clap"
            >
              {liked
                ? <Heart size={16} variant="Bold" color="#e03131" />
                : <HeartAdd size={16} />
              }
              <span>{formatClaps(claps)}</span>
            </button>
            <button className="article-card-action-btn" aria-label="Comments">
              <Message size={16} />
              <span>{article.comments}</span>
            </button>
            <button
              className={`article-card-action-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              aria-label="Save"
            >
              <Save2 size={16} variant={saved ? 'Bold' : 'Linear'} color={saved ? 'var(--accent)' : undefined} />
            </button>
            <button className="article-card-action-btn" aria-label="More">
              <More size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      {showThumbnail && (
        <img
          src={article.thumbnail}
          alt={article.title}
          className="article-card-thumbnail"
        />
      )}
    </Link>
  );
}
