import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";

const STATUS_BADGE = {
  reading: { label: "Reading",  bg: "#c8974a", color: "#2e1a08" },
  read:    { label: "Read",     bg: "#16a34a", color: "#fff" },
  wishlist:{ label: "Wishlist", bg: "#2e1a08", color: "#c8974a" },
};

export default function BookCard({ book, size = "grid", onToast }) {
  const { isOnShelf, isFavorite, getStatus, toggleFavorite, addToShelf } = useLibrary();
  const [imgError, setImgError] = useState(false);
  const [popping, setPopping]   = useState(false);

  const bookId  = book.book_id || book.id;
  const onShelf = isOnShelf(bookId);
  const fav     = isFavorite(bookId);
  const status  = getStatus(bookId);
  const badge   = status ? STATUS_BADGE[status] : null;

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!onShelf) {
      await addToShelf({ book_id: bookId, title: book.title, author: book.author, cover_url: book.cover_url }, "wishlist");
      onToast?.("Added to wishlist");
    }
    await toggleFavorite(bookId);
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
    onToast?.(fav ? "Removed from favorites" : "Added to favorites ★");
  };

  const coverStyle = imgError || !book.cover_url
    ? { background: "linear-gradient(135deg, #8b5e1a, #3d2610)" }
    : {};

  if (size === "row") {
    return (
      <div style={styles.rowCard}>
        <div style={{ ...styles.rowCover, ...coverStyle }}>
          {!imgError && book.cover_url && (
            <img
              src={book.cover_url}
              alt={book.title}
              onError={() => setImgError(true)}
              style={styles.coverImg}
            />
          )}
          <div style={styles.spineSheen} />
          <button
            onClick={handleFav}
            style={{ ...styles.favBtn, color: fav ? "#c8974a" : "rgba(255,255,255,0.55)" }}
            className={popping ? "pop" : ""}
            title={fav ? "Remove from favorites" : "Favorite"}
          >
            <BookmarkIcon filled={fav} size={14} />
          </button>
        </div>
        <p style={styles.rowTitle} className="line-clamp-2">{book.title}</p>
        <p style={styles.rowAuthor} className="truncate">{book.author}</p>
      </div>
    );
  }

  return (
    <div style={styles.gridCard} className="fade-up">
      <div style={{ ...styles.gridCover, ...coverStyle }}>
        {!imgError && book.cover_url && (
          <img
            src={book.cover_url}
            alt={book.title}
            onError={() => setImgError(true)}
            style={styles.coverImg}
          />
        )}
        <div style={styles.spineSheen} />

        {/* Status badge */}
        {badge && (
          <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFav}
          style={{ ...styles.favBtn, ...styles.favBtnGrid, color: fav ? "#c8974a" : "rgba(255,255,255,0.55)" }}
          className={popping ? "pop" : ""}
          title={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <BookmarkIcon filled={fav} size={15} />
        </button>

        {/* Progress bar for reading */}
        {status === "reading" && book.progress > 0 && (
          <div style={styles.progressWrap}>
            <div style={{ ...styles.progressBar, width: `${book.progress}%` }} />
          </div>
        )}
      </div>
      <p style={styles.gridTitle} className="line-clamp-2">{book.title}</p>
      <p style={styles.gridAuthor} className="truncate">{book.author}</p>
    </div>
  );
}

function BookmarkIcon({ filled, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const styles = {
  rowCard: {
    flexShrink: 0,
    cursor: "pointer",
    width: 100,
  },
  rowCover: {
    width: 100,
    height: 148,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
    boxShadow: "0 6px 20px rgba(46,26,8,0.22)",
    background: "#d4b896",
  },
  gridCard: {
    cursor: "pointer",
  },
  gridCover: {
    width: "100%",
    aspectRatio: "2/3",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    marginBottom: 8,
    boxShadow: "0 4px 16px rgba(46,26,8,0.18)",
    background: "#d4b896",
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease",
  },
  spineSheen: {
    position: "absolute",
    top: 0, bottom: 0, left: 0,
    width: 6,
    background: "rgba(0,0,0,0.2)",
    borderRadius: "4px 0 0 4px",
  },
  badge: {
    position: "absolute",
    top: 6, left: 6,
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    padding: "2px 6px",
    borderRadius: 100,
  },
  favBtn: {
    position: "absolute",
    top: 6, right: 6,
    width: 24, height: 24,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.15s",
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
  },
  favBtnGrid: {},
  progressWrap: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 3,
    background: "rgba(255,255,255,0.2)",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #c8974a, #e8b96a)",
    transition: "width 0.5s ease",
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#2e1a08",
    lineHeight: 1.35,
    width: 100,
    marginBottom: 3,
  },
  rowAuthor: {
    fontSize: 10,
    color: "#c8974a",
    width: 100,
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#2e1a08",
    lineHeight: 1.35,
    marginBottom: 2,
  },
  gridAuthor: {
    fontSize: 10,
    color: "#c8974a",
  },
};
