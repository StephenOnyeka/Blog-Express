import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  ArrowLeft,
  Setting2,
  CloseCircle,
  Image as ImageIcon,
  TickCircle,
  Add,
} from "iconsax-react";
import PageTemplate from "../components/PageTemplate";
import {
  saveArticle,
  getArticleById,
  createDraftArticle,
  estimateReadTime,
  wordCount,
  CURRENT_USER,
} from "../data/articleStore";
import type { Article } from "../data/mockData";

/* ─── Quill toolbar modules ─────────────────────── */
const MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      [{ align: [] }],
      ["clean"],
    ],
  },
};

const FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "bullet",
  "link",
  "image",
  "video",
  "align",
];

/* ─── Suggested tags ───────────────────────────── */
const SUGGESTED_TAGS = [
  "Technology",
  "AI",
  "Design",
  "Programming",
  "Startups",
  "Science",
  "Writing",
  "Culture",
  "Health",
  "Psychology",
  "Business",
  "Finance",
  "Productivity",
  "Education",
  "Travel",
];

/* ─── Component ─────────────────────────────────── */
export default function WritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // Load draft from store or create new one
  const [draft, setDraft] = useState<Article>(() => {
    if (editId) {
      const existing = getArticleById(editId);
      if (existing) return existing;
    }
    return createDraftArticle();
  });

  const [title, setTitle] = useState(draft.title);
  const [subtitle, setSubtitle] = useState(draft.subtitle);
  const [body, setBody] = useState(draft.body);
  const [tags, setTags] = useState<string[]>(draft.tags);
  const [thumbnail, setThumbnail] = useState(draft.thumbnail);
  const [isMemberOnly, setIsMemberOnly] = useState(draft.isMemberOnly);

  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"draft" | "saving" | "saved">(
    "draft",
  );
  const [published, setPublished] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage whenever content changes
  const autosave = useCallback(() => {
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const updatedDraft: Article = {
        ...draft,
        title,
        subtitle,
        body,
        tags,
        thumbnail,
        isMemberOnly,
        readTime: estimateReadTime(body),
        publishedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };
      saveArticle(updatedDraft);
      setDraft(updatedDraft);
      setSaveStatus("saved");
    }, 800);
  }, [draft, title, subtitle, body, tags, thumbnail, isMemberOnly]);

  useEffect(() => {
    if (title || body) autosave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, body, tags, thumbnail, isMemberOnly]);

  // Tag helpers
  const addTag = (tag: string) => {
    const cleaned = tag.trim();
    if (!cleaned || tags.includes(cleaned) || tags.length >= 5) return;
    setTags([...tags, cleaned]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  // Thumbnail upload (file → data URL)
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnail(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Publish
  const handlePublish = () => {
    if (!title.trim()) return;
    const finalArticle: Article = {
      ...draft,
      title,
      subtitle,
      body,
      tags,
      thumbnail,
      isMemberOnly,
      author: CURRENT_USER,
      readTime: estimateReadTime(body),
      publishedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
    saveArticle(finalArticle);
    setPublished(true);
  };

  const words = wordCount(body);
  const readMins = estimateReadTime(body);
  const canPublish =
    title.trim().length > 0 && body.replace(/<[^>]+>/g, "").trim().length > 0;


  /* ── Published success screen ──────────────────── */
  if (published) {
    return (
      <PageTemplate showFooter={false}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            gap: 16,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <div style={{ fontSize: 56 }}>🎉</div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: -0.5,
            }}
          >
            Your story is live!
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              maxWidth: 400,
            }}
          >
            "{title}" has been published to BlogNest. Share it with the world!
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              className="btn-publish-now"
              onClick={() => navigate(`/article/${draft.id}`)}
            >
              View story
            </button>
            <button
              style={{
                border: "1px solid var(--border)",
                borderRadius: 100,
                padding: "10px 24px",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--text-primary)",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
              onClick={() => navigate("/profile/me")}
            >
              Go to profile
            </button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  /* ── Editor ─────────────────────────────────────── */
  return (
    <PageTemplate showFooter={false}>
      {/* Top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-light)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 57,
          gap: 16,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} />
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {saveStatus === "saving" && (
              <span style={{ color: "var(--text-muted)" }}>Saving…</span>
            )}
            {saveStatus === "saved" && (
              <span
                style={{
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <TickCircle size={14} /> Saved
              </span>
            )}
            {saveStatus === "draft" && (
              <span style={{ color: "var(--text-muted)" }}>Draft</span>
            )}
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {words > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {words.toLocaleString()} words · {readMins} min read
            </span>
          )}
          <button
            title="Story settings"
            aria-label="Settings"
            onClick={() => setShowPublishPanel(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "var(--text-secondary)",
              padding: 4,
            }}
          >
            <Setting2 size={20} />
          </button>
          <button
            className="btn-getstarted"
            style={{
              opacity: canPublish ? 1 : 0.4,
              transition: "opacity 0.2s",
            }}
            onClick={() => canPublish && setShowPublishPanel(true)}
            disabled={!canPublish}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div
        style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px 80px" }}
      >
        {/* Title */}
        <textarea
          className="write-title-input"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onInput={(e) => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          rows={1}
          style={{ marginBottom: 8 }}
        />

        {/* Subtitle */}
        <textarea
          className="write-subtitle-input"
          placeholder="Add a subtitle (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          onInput={(e) => {
            const el = e.target as HTMLTextAreaElement;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          rows={1}
          style={{ marginBottom: 24 }}
        />

        {/* Author strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              background: "var(--bg-tertiary)",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {CURRENT_USER.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* ReactQuill */}
        <ReactQuill
          theme="snow"
          value={body}
          onChange={setBody}
          modules={MODULES}
          formats={FORMATS}
          placeholder="Tell your story…"
          style={{ fontFamily: "var(--font-serif)" }}
        />
      </div>

      {/* Hidden file input for thumbnail */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleThumbnailUpload}
      />

      {/* Publish panel */}
      {showPublishPanel && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowPublishPanel(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 499,
            }}
          />
          <div className="publish-panel">
            <div className="publish-panel-header">
              <span className="publish-panel-title">Story preview</span>
              <button
                onClick={() => setShowPublishPanel(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-secondary)",
                }}
                aria-label="Close"
              >
                <CloseCircle size={22} />
              </button>
            </div>

            <div className="publish-panel-body">
              {/* Preview card */}
              <div className="publish-panel-section">
                <div className="publish-panel-preview">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt="Cover"
                      className="publish-panel-preview-img"
                    />
                  ) : (
                    <button
                      onClick={() => thumbnailInputRef.current?.click()}
                      style={{
                        width: "100%",
                        height: 160,
                        background: "var(--bg-tertiary)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      <ImageIcon size={28} />
                      <span style={{ fontSize: 13 }}>Add cover image</span>
                    </button>
                  )}
                  {thumbnail && (
                    <button
                      onClick={() => thumbnailInputRef.current?.click()}
                      style={{
                        width: "100%",
                        textAlign: "center",
                        fontSize: 12,
                        color: "var(--accent)",
                        padding: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        borderTop: "1px solid var(--border-light)",
                      }}
                    >
                      Change image
                    </button>
                  )}
                  <div className="publish-panel-preview-text">
                    <div className="publish-panel-preview-title">
                      {title || "Story title…"}
                    </div>
                    <div className="publish-panel-preview-subtitle">
                      {subtitle || "Story subtitle…"}
                    </div>
                  </div>
                </div>
                <p className="publish-panel-hint">
                  Note: Changes here affect how your story appears in public
                  places like BlogNest's homepage — not the story itself.
                </p>
              </div>

              {/* Tags */}
              <div className="publish-panel-section">
                <span className="publish-panel-label">Add up to 5 topics</span>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  Topics make it easier for readers to find your story.
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="publish-panel-input"
                    style={{ flex: 1, borderRadius: 100, padding: "8px 16px" }}
                    placeholder="Add a topic…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        (e.key === "Enter" || e.key === ",") &&
                        tagInput.trim()
                      ) {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    disabled={tags.length >= 5}
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    style={{
                      background: "var(--text-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: 100,
                      padding: "8px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      opacity: !tagInput.trim() || tags.length >= 5 ? 0.4 : 1,
                    }}
                  >
                    <Add size={18} />
                  </button>
                </div>

                {/* Current tags */}
                {tags.length > 0 && (
                  <div className="publish-panel-tags">
                    {tags.map((tag) => (
                      <span key={tag} className="publish-panel-tag">
                        {tag}
                        <span
                          className="publish-panel-tag-remove"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested tags */}
                <div style={{ marginTop: 12 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Suggested:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          disabled={tags.length >= 5}
                          style={{
                            background: "var(--bg-tertiary)",
                            color: "var(--text-secondary)",
                            fontSize: 12,
                            padding: "4px 10px",
                            borderRadius: 100,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                            transition: "background 0.15s",
                            opacity: tags.length >= 5 ? 0.4 : 1,
                          }}
                        >
                          + {tag}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="publish-panel-section">
                <span className="publish-panel-label">Publishing options</span>
                <div>
                  <ToggleRow
                    label="Member only story"
                    sublabel="Only subscribers can read the full story"
                    checked={isMemberOnly}
                    onChange={setIsMemberOnly}
                  />
                </div>
              </div>
            </div>

            <div className="publish-panel-footer">
              <button
                className="btn-publish-now"
                onClick={handlePublish}
                disabled={!canPublish}
              >
                Publish now
              </button>
              <button
                className="btn-schedule"
                onClick={() => setShowPublishPanel(false)}
              >
                Save as draft
              </button>
            </div>
          </div>
        </>
      )}
    </PageTemplate>
  );
}

/* ─── Toggle Row ──────────────────────────────────── */
interface ToggleRowProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, sublabel, checked, onChange }: ToggleRowProps) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="toggle-row">
      <div>
        <div className="toggle-label">{label}</div>
        {sublabel && <div className="toggle-sublabel">{sublabel}</div>}
      </div>
      <label className="toggle-switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-track" />
        <span className="toggle-thumb" />
      </label>
    </div>
  );
}
