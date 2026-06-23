import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bold, Italic, Link1, Image, Quote, ArrowLeft, Setting2,
} from 'iconsax-react';
import PageTemplate from '../components/PageTemplate';

interface WritePageProps {
  isLoggedIn: boolean;
  onAuthChange: (v: boolean) => void;
}

export default function WritePage({ isLoggedIn, onAuthChange }: WritePageProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    if (!title.trim()) return;
    setPublished(true);
    setTimeout(() => navigate('/profile/me'), 1500);
  };

  if (published) {
    return (
      <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange} showFooter={false}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Story published!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your story is now live.</p>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate isLoggedIn={isLoggedIn} onAuthChange={onAuthChange} showFooter={false}>
      {/* Top action bar */}
      <div style={{
        borderBottom: '1px solid var(--border-light)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-primary)',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          <ArrowLeft size={16} /> Draft in BlogNest
        </button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {body.length > 0 ? 'Saved' : 'Draft'}
          </span>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}
            aria-label="Story settings"
          >
            <Setting2 size={20} />
          </button>
          <button
            className="btn-getstarted"
            onClick={handlePublish}
            disabled={!title.trim()}
            style={{ opacity: title.trim() ? 1 : 0.4 }}
          >
            Publish
          </button>
        </div>
      </div>

      <div className="write-page">
        {/* Formatting toolbar */}
        <div className="write-toolbar">
          <button className="write-toolbar-btn" title="Bold" aria-label="Bold">
            <Bold size={18} />
          </button>
          <button className="write-toolbar-btn" title="Italic" aria-label="Italic">
            <Italic size={18} />
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <button className="write-toolbar-btn" title="Heading 1" aria-label="H1" style={{ fontWeight: 700, fontSize: 15 }}>H1</button>
          <button className="write-toolbar-btn" title="Heading 2" aria-label="H2" style={{ fontWeight: 700, fontSize: 14 }}>H2</button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <button className="write-toolbar-btn" title="Quote" aria-label="Blockquote">
            <Quote size={18} />
          </button>
          <button className="write-toolbar-btn" title="Link" aria-label="Insert link">
            <Link1 size={18} />
          </button>
          <button className="write-toolbar-btn" title="Image" aria-label="Insert image">
            <Image size={18} />
          </button>
        </div>

        {/* Title */}
        <textarea
          className="write-title-input"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          rows={2}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />

        {/* Subtitle */}
        <textarea
          className="write-subtitle-input"
          placeholder="Tell your story..."
          value={subtitle}
          onChange={e => setSubtitle(e.target.value)}
          rows={1}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />

        <div className="write-divider" />

        {/* Body */}
        <textarea
          className="write-body-input"
          placeholder="Write your story..."
          value={body}
          onChange={e => setBody(e.target.value)}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }}
        />

        {/* Word count */}
        {(title || body) && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
            {body.trim().split(/\s+/).filter(Boolean).length} words
            {body.trim().split(/\s+/).filter(Boolean).length > 0 &&
              ` · ~${Math.ceil(body.trim().split(/\s+/).filter(Boolean).length / 200)} min read`
            }
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
