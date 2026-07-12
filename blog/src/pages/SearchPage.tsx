import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchNormal1 } from 'iconsax-react';
import Fuse from 'fuse.js';
import PageTemplate from '../components/PageTemplate';
import ArticleCard from '../components/ArticleCard';
import { ARTICLES, AUTHORS, RECOMMENDED_TOPICS } from '../data/mockData';
import type { Article } from '../data/mockData';
import { api } from '../lib/api';

// Map a backend article record to the frontend Article shape.
function normalizeArticle(a: any): Article {
  return {
    id: a.id,
    title: a.title ?? '',
    subtitle: a.subtitle ?? '',
    body: a.body ?? '',
    author: {
      id: a.author?.id ?? '',
      name: a.author?.name ?? 'Unknown',
      username: a.author?.username ?? '',
      avatar: a.author?.avatar ?? '',
      bio: a.author?.bio ?? '',
      followers: a.author?.followersCount ?? 0,
      following: a.author?.followingCount ?? 0,
    },
    publishedAt: a.published_at
      ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '',
    readTime: a.read_time ?? 1,
    tags: a.tags ?? [],
    thumbnail: a.thumbnail ?? '',
    claps: a.claps ?? 0,
    comments: a.comments_count ?? 0,
    isMemberOnly: a.is_member_only ?? false,
  };
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [liveArticles, setLiveArticles] = useState<Article[]>([]);

  // Fetch live articles once; fall back silently to mock-only on failure.
  useEffect(() => {
    api.get('/articles')
      .then(res => {
        const list = res.data?.articles ?? res.data ?? [];
        setLiveArticles(list.map(normalizeArticle));
      })
      .catch(() => setLiveArticles([]));
  }, []);

  // Merge live + mock articles, deduped by id (live wins).
  const allArticles = useMemo(() => {
    const byId = new Map<string, Article>();
    for (const a of ARTICLES) byId.set(a.id, a);
    for (const a of liveArticles) byId.set(a.id, a);
    return [...byId.values()];
  }, [liveArticles]);

  const articleFuse = useMemo(
    () => new Fuse(allArticles, {
      keys: ['title', 'subtitle', 'tags', 'author.name'],
      threshold: 0.4,
      ignoreLocation: true,
    }),
    [allArticles]
  );

  const authorFuse = useMemo(
    () => new Fuse(AUTHORS, {
      keys: ['name', 'bio', 'username'],
      threshold: 0.4,
      ignoreLocation: true,
    }),
    []
  );

  const q = query.trim();

  const matchedArticles = q ? articleFuse.search(q).map(r => r.item) : [];
  const matchedAuthors = q ? authorFuse.search(q).map(r => r.item) : [];

  return (
    <PageTemplate>
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
