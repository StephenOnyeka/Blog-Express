import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchNormal1 } from 'iconsax-react';
import PageTemplate from '../components/PageTemplate';
import ArticleCard from '../components/ArticleCard';
import { ARTICLES, AUTHORS, RECOMMENDED_TOPICS } from '../data/mockData';

interface SearchPageProps {
  isLoggedIn: boolean;
  onAuthChange: (v: boolean) => void;
}

export default function SearchPage({ isLoggedIn, onAuthChange }: SearchPageProps) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');

  const q = query.toLowerCase().trim();

  const matchedArticles = q
    ? ARTICLES.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.author.name.toLowerCase().includes(q)
      )
    : [];

  const matchedAuthors = q
    ? AUTHORS.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.bio.toLowerCase().includes(q)
      )
    : [];

  return (
    <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange}>
      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Search input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-secondary)',
          borderRadius: 100,
          padding: '12px 20px',
          marginBottom: 32,
          maxWidth: 600,
        }}>
          <SearchNormal1 size={20} color="var(--text-secondary)" />
          <input
            autoFocus
            type="text"
            placeholder="Search BlogNest"
            value={query}
            onChange={e => { setQuery(e.target.value); setParams({ q: e.target.value }); }}
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 18, color: 'var(--text-primary)', width: '100%',
              fontFamily: 'var(--font-sans)',
            }}
          />
        </div>

        {!q && (
          <>
            {/* Default state — show topics */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                Recommended Topics
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {RECOMMENDED_TOPICS.map(topic => (
                  <button
                    key={topic}
                    className="topic-tag"
                    onClick={() => { setQuery(topic); setParams({ q: topic }); }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                Popular Writers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {AUTHORS.slice(0, 4).map(author => (
                  <Link
                    key={author.id}
                    to={`/profile/${author.username}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-light)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
                      <img src={author.avatar} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{author.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{author.bio}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {q && (
          <>
            {/* Stories results */}
            {matchedArticles.length > 0 && (
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  Stories ({matchedArticles.length})
                </h2>
                <div className="article-feed" style={{ maxWidth: 740 }}>
                  {matchedArticles.map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            )}

            {/* People results */}
            {matchedAuthors.length > 0 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                  People ({matchedAuthors.length})
                </h2>
                {matchedAuthors.map(author => (
                  <Link
                    key={author.id}
                    to={`/profile/${author.username}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      borderBottom: '1px solid var(--border-light)',
                      textDecoration: 'none',
                    }}
                  >
                    <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-tertiary)', flexShrink: 0 }}>
                      <img src={author.avatar} alt={author.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{author.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{author.bio}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{author.followers.toLocaleString()} followers</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {matchedArticles.length === 0 && matchedAuthors.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
                  No results for "{q}"
                </p>
                <p>Try searching for something else, or check your spelling.</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}
