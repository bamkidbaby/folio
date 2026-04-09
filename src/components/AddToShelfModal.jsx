import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

const STATUSES = [
  { value: "reading", label: "Currently Reading", emoji: "📖" },
  { value: "read",    label: "Already Read",       emoji: "✅" },
  { value: "wishlist",label: "Want to Read",       emoji: "🔖" },
];

export default function AddToShelfModal({ book, onClose, onToast }) {
  const { addToShelf, isOnShelf, getStatus, removeFromShelf, updateShelf } = useLibrary();
  const [status, setStatus]     = useState(getStatus(book.book_id || book.id) || "wishlist");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading]   = useState(false);

  const bookId  = book.book_id || book.id;
  const onShelf = isOnShelf(bookId);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (onShelf) {
        await updateShelf(bookId, { status, progress: status === "reading" ? progress : undefined });
      } else {
        await addToShelf({ book_id: bookId, title: book.title, author: book.author, cover_url: book.cover_url }, status);
      }
      onToast?.(`${onShelf ? "Updated" : "Added to"} shelf ✓`);
      onClose();
    } catch (err) {
      onToast?.(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeFromShelf(bookId);
      onToast?.("Removed from shelf");
      onClose();
    } catch {
      onToast?.("Failed to remove");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="slide-up">
        {/* Book preview */}
        <div style={styles.preview}>
          <div style={styles.coverWrap}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} style={styles.cover} />
              : <div style={styles.coverFallback} />
            }
          </div>
          <div style={styles.info}>
            <p style={styles.title}>{book.title}</p>
            <p style={styles.author}>{book.author}</p>
            {book.year && <p style={styles.year}>{book.year}</p>}
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={styles.divider} />

        {/* Status picker */}
        <p style={styles.label}>Add to shelf as</p>
        <div style={styles.statusGrid}>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              style={{
                ...styles.statusBtn,
                ...(status === s.value ? styles.statusBtnActive : {}),
              }}
            >
              <span style={{ fontSize: 20 }}>{s.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Progress (only for "reading") */}
        {status === "reading" && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <p style={styles.label}>Progress</p>
              <span style={styles.progressPct}>{progress}%</span>
            </div>
            <input
              type="range"
              min={0} max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={styles.rangeInput}
            />
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          {onShelf && (
            <button className="btn btn-danger" onClick={handleRemove} disabled={loading} style={{ flex: 1 }}>
              Remove
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 2 }}>
            {loading ? <span className="spinner" /> : onShelf ? "Update shelf" : "Add to shelf"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(46,26,8,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    padding: "0 0 0 0",
  },
  modal: {
    background: "#fdf8f0",
    borderRadius: "24px 24px 0 0",
    padding: "24px 24px 40px",
    width: "100%",
    maxWidth: 500,
    boxShadow: "0 -8px 40px rgba(46,26,8,0.2)",
  },
  preview: {
    display: "flex", alignItems: "flex-start", gap: 14,
    position: "relative",
  },
  coverWrap: {
    width: 56, height: 80,
    borderRadius: 8,
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(46,26,8,0.2)",
    background: "#d4b896",
  },
  cover: { width: "100%", height: "100%", objectFit: "cover" },
  coverFallback: { width: "100%", height: "100%", background: "linear-gradient(135deg,#8b5e1a,#3d2610)" },
  info: { flex: 1, minWidth: 0, paddingRight: 32 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#2e1a08", lineHeight: 1.3, marginBottom: 4 },
  author: { fontSize: 13, color: "#c8974a", marginBottom: 2 },
  year: { fontSize: 11, color: "rgba(200,151,74,0.6)" },
  closeBtn: {
    position: "absolute", top: 0, right: 0,
    width: 32, height: 32,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f5ead8", border: "none",
    borderRadius: 10, cursor: "pointer",
    color: "#c8974a",
  },
  divider: { height: 1, background: "#e8d5b7", margin: "20px 0 16px" },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(200,151,74,0.7)", marginBottom: 12 },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 },
  statusBtn: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "12px 8px",
    borderRadius: 14,
    border: "2px solid #e8d5b7",
    background: "white",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    color: "#2e1a08",
  },
  statusBtnActive: {
    borderColor: "#c8974a",
    background: "rgba(200,151,74,0.08)",
  },
  progressSection: { marginBottom: 20 },
  progressHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressPct: { fontSize: 14, fontWeight: 700, color: "#c8974a" },
  rangeInput: { width: "100%", accentColor: "#c8974a" },
  actions: { display: "flex", gap: 10, marginTop: 4 },
};
