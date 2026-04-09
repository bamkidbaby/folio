import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/LibraryContext";
import { useToast } from "../hooks/useToast";
import { Sidebar, BottomNav } from "../components/Navigation";
import BookCard from "../components/BookCard";
import AddToShelfModal from "../components/AddToShelfModal";
import ToastContainer from "../components/ToastContainer";

const VIEWS = ["home", "books", "search", "favorites", "profile"];

export default function Dashboard() {
  const [view, setView]           = useState("home");
  const [modalBook, setModalBook] = useState(null);
  const { toasts, toast }         = useToast();
  const isDesktop                 = useWindowWidth() >= 1024;

  // Swipe navigation
  useEffect(() => {
    let tx = 0, ty = 0;
    const onStart = (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; };
    const onEnd = (e) => {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) < 55 || Math.abs(dy) > Math.abs(dx)) return;
      const i = VIEWS.indexOf(view);
      if (dx < 0 && i < VIEWS.length - 1) setView(VIEWS[i + 1]);
      if (dx > 0 && i > 0) setView(VIEWS[i - 1]);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [view]);

  const navigate = useCallback((v) => setView(v), []);

  return (
    <div style={styles.app}>
      {isDesktop && <Sidebar currentView={view} onNavigate={navigate} />}

      <main style={styles.main}>
        {view === "home"      && <HomeScreen      navigate={navigate} onBook={setModalBook} onToast={toast} />}
        {view === "books"     && <BooksScreen     onBook={setModalBook} onToast={toast} />}
        {view === "search"    && <SearchScreen    onBook={setModalBook} onToast={toast} />}
        {view === "favorites" && <FavoritesScreen onBook={setModalBook} onToast={toast} navigate={navigate} />}
        {view === "profile"   && <ProfileScreen   navigate={navigate} onToast={toast} />}

        {!isDesktop && <BottomNav currentView={view} onNavigate={navigate} />}
      </main>

      {modalBook && (
        <AddToShelfModal
          book={modalBook}
          onClose={() => setModalBook(null)}
          onToast={(msg) => toast.show(msg)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ═══════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════
function HomeScreen({ navigate, onBook, onToast }) {
  const { user } = useAuth();
  const { shelf, currentlyReading, read, reading, favorites } = useLibrary();
  const firstName = (user?.name || "Reader").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={styles.screen}>
      {/* Sticky header */}
      <div style={styles.stickyHeader}>
        <p style={styles.greetLabel}>{greeting}</p>
        <h1 className="font-display" style={styles.greetTitle}>
          Welcome back, <em style={{ color: "#c8974a", fontStyle: "normal" }}>{firstName}</em>
        </h1>
      </div>

      <div style={styles.screenBody}>
        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { value: read.length,      label: "Books read" },
            { value: reading.length,   label: "In progress" },
            { value: favorites.length, label: "Favorites" },
            { value: shelf.length,     label: "Library" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard} className="fade-up" style={{ ...styles.statCard, animationDelay: `${i * 0.05}s` }}>
              <div className="font-display" style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Currently Reading */}
        {currentlyReading && (
          <div style={styles.currentlyReading} className="fade-up">
            <div style={styles.crGlow} />
            <div style={styles.crCoverWrap}>
              {currentlyReading.cover_url
                ? <img src={currentlyReading.cover_url} alt={currentlyReading.title} style={styles.crCover} />
                : <div style={styles.crCoverFallback} />
              }
            </div>
            <div style={styles.crInfo}>
              <p style={styles.crEyebrow}>Currently reading</p>
              <p className="font-display" style={styles.crTitle}>{currentlyReading.title}</p>
              <p style={styles.crAuthor}>{currentlyReading.author}</p>
              <div style={styles.crBarWrap}>
                <div style={{ ...styles.crBar, width: `${currentlyReading.progress || 0}%` }} />
              </div>
              <p style={styles.crPct}>{currentlyReading.progress || 0}% complete</p>
            </div>
          </div>
        )}

        {/* Library row */}
        <SectionHeader title="Library" onSeeAll={() => navigate("books")} />
        {shelf.length > 0 ? (
          <div style={styles.hScroll}>
            {shelf.slice(0, 12).map((b) => (
              <BookCard key={b.book_id} book={b} size="row" onToast={(m) => onToast.show(m)} />
            ))}
          </div>
        ) : (
          <EmptyShelf onDiscover={() => navigate("search")} />
        )}

        {/* Favorites row */}
        {favorites.length > 0 && (
          <>
            <SectionHeader title="Favorites" onSeeAll={() => navigate("favorites")} />
            <div style={styles.hScroll}>
              {favorites.slice(0, 8).map((b) => (
                <BookCard key={b.book_id} book={b} size="row" onToast={(m) => onToast.show(m)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// BOOKS SCREEN
// ═══════════════════════════════════════
function BooksScreen({ onBook, onToast }) {
  const { shelf } = useLibrary();
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = shelf.filter((b) => {
    const matchFilter = filter === "all" ? true
      : filter === "fav" ? b.favorited
      : b.status === filter;
    const q = query.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={styles.screen}>
      <div style={styles.stickyHeader}>
        <p style={styles.eyebrow}>Library</p>
        <h1 className="font-display" style={styles.pageTitle}>Your <em style={{ color: "#c8974a", fontStyle: "normal" }}>collection</em></h1>
      </div>
      <div style={styles.screenBody}>
        {/* Search */}
        <div style={styles.searchBar}>
          <SearchIcon />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or author…"
            style={styles.searchInput}
          />
          {query && (
            <button onClick={() => setQuery("")} style={styles.clearBtn}>
              <ClearIcon />
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={styles.filterRow}>
          {[
            { v: "all",      l: "All" },
            { v: "reading",  l: "Reading" },
            { v: "read",     l: "Read" },
            { v: "wishlist", l: "Wishlist" },
            { v: "fav",      l: "⭐ Favorites" },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{ ...styles.filterPill, ...(filter === v ? styles.filterPillActive : {}) }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📚</p>
            <p style={styles.emptyTitle}>{shelf.length === 0 ? "Your library is empty" : "No books found"}</p>
            <p style={styles.emptyDesc}>{shelf.length === 0 ? "Discover books to add to your shelf." : "Try a different search or filter."}</p>
          </div>
        ) : (
          <div style={styles.booksGrid}>
            {filtered.map((b) => (
              <BookCard key={b.book_id} book={b} size="grid" onToast={(m) => onToast.show(m)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// SEARCH / DISCOVER SCREEN
// ═══════════════════════════════════════
function SearchScreen({ onBook, onToast }) {
  const { searchBooks, searchResults, searching, setSearchResults } = useLibrary();
  const [query, setQuery] = useState("");
  const [timer, setTimer] = useState(null);

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(timer);
    if (!val.trim()) { setSearchResults([]); return; }
    setTimer(setTimeout(() => searchBooks(val), 500));
  };

  return (
    <div style={styles.screen}>
      <div style={styles.stickyHeader}>
        <p style={styles.eyebrow}>Discover</p>
        <h1 className="font-display" style={styles.pageTitle}>Find your <em style={{ color: "#c8974a", fontStyle: "normal" }}>next read</em></h1>
      </div>
      <div style={styles.screenBody}>
        <div style={styles.searchBar}>
          <SearchIcon />
          <input
            value={query} onChange={(e) => handleInput(e.target.value)}
            placeholder="Search millions of books…"
            style={styles.searchInput}
            autoFocus
          />
          {query && <button onClick={() => { setQuery(""); setSearchResults([]); }} style={styles.clearBtn}><ClearIcon /></button>}
        </div>

        {searching && (
          <div style={styles.searching}>
            <span className="spinner" />
            <span style={{ fontSize: 13, color: "#c8974a", marginLeft: 10 }}>Searching Open Library…</span>
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div style={styles.booksGrid}>
            {searchResults.map((b) => (
              <div key={b.id} onClick={() => onBook(b)} style={{ cursor: "pointer" }}>
                <BookCard book={{ ...b, book_id: b.id }} size="grid" onToast={(m) => onToast.show(m)} />
              </div>
            ))}
          </div>
        )}

        {!searching && !query && (
          <div style={styles.searchPlaceholder}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
            <p style={styles.emptyTitle}>Search for any book</p>
            <p style={styles.emptyDesc}>Powered by the Open Library database with millions of titles</p>
          </div>
        )}

        {!searching && query && searchResults.length === 0 && (
          <div style={styles.searchPlaceholder}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>😕</p>
            <p style={styles.emptyTitle}>No results for "{query}"</p>
            <p style={styles.emptyDesc}>Try a different title or author name</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// FAVORITES SCREEN
// ═══════════════════════════════════════
function FavoritesScreen({ onBook, onToast, navigate }) {
  const { favorites } = useLibrary();

  return (
    <div style={styles.screen}>
      <div style={styles.stickyHeader}>
        <p style={styles.eyebrow}>Saved</p>
        <h1 className="font-display" style={styles.pageTitle}>Your <em style={{ color: "#c8974a", fontStyle: "normal" }}>favorites</em></h1>
      </div>
      <div style={styles.screenBody}>
        {favorites.length === 0 ? (
          <div style={{ ...styles.empty, marginTop: 40 }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🔖</p>
            <p style={styles.emptyTitle}>No favorites yet</p>
            <p style={styles.emptyDesc}>Tap the bookmark icon on any book to save it here.</p>
            <button onClick={() => navigate("books")} className="btn btn-primary" style={{ marginTop: 20 }}>
              Browse library
            </button>
          </div>
        ) : (
          <div style={styles.booksGrid}>
            {favorites.map((b) => (
              <BookCard key={b.book_id} book={b} size="grid" onToast={(m) => onToast.show(m)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════
function ProfileScreen({ navigate, onToast }) {
  const { user, logout } = useAuth();
  const { read, reading, favorites, shelf } = useLibrary();
  const initial = (user?.name || user?.email || "R")[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div style={styles.screen}>
      {/* Profile hero */}
      <div style={styles.profileHero}>
        <div style={styles.profileGlow} />
        <div style={styles.profileAvatarWrap}>
          {user?.avatar_url
            ? <img src={user.avatar_url} alt={user.name} style={styles.profileAvatar} />
            : <div style={styles.profileAvatarFallback}>{initial}</div>
          }
        </div>
        <div>
          <p className="font-display" style={styles.profileName}>{user?.name || "Reader"}</p>
          <p style={styles.profileEmail}>{user?.email}</p>
          {user?.google_id && (
            <span style={styles.googleBadge}>
              <GoogleLogoSmall /> Google account
            </span>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={styles.profileStats}>
        {[
          { value: read.length,    label: "Read" },
          { value: reading.length, label: "Reading" },
          { value: favorites.length, label: "Favorites" },
        ].map((s, i) => (
          <div key={i} style={{ ...styles.profileStat, ...(i < 2 ? { borderRight: "1px solid #e8d5b7" } : {}) }}>
            <div className="font-display" style={styles.profileStatValue}>{s.value}</div>
            <div style={styles.profileStatLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Goal card */}
      <div style={styles.screenBodyProfile}>
        <div style={styles.goalCard}>
          <div style={styles.goalIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8974a" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={styles.goalTitle}>2025 Reading Goal</p>
            <p style={styles.goalSub}>{read.length} of 52 books</p>
            <div style={styles.goalBarWrap}>
              <div style={{ ...styles.goalBar, width: `${Math.min(100, (read.length / 52) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Settings */}
        <p style={styles.settingsLabel}>Account</p>
        {[
          { icon: "👤", label: "Edit profile",   onClick: () => onToast.show("Coming soon") },
          { icon: "📊", label: "Reading goals",  onClick: () => onToast.show("Coming soon") },
          { icon: "🔔", label: "Notifications",  onClick: () => onToast.show("Coming soon") },
        ].map((item, i) => (
          <button key={i} onClick={item.onClick} style={styles.settingsRow}>
            <span style={styles.settingsEmoji}>{item.icon}</span>
            <span style={styles.settingsRowLabel}>{item.label}</span>
            <ChevronIcon />
          </button>
        ))}

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span style={styles.logoutIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
          <span style={{ color: "#ef4444", fontWeight: 600, fontSize: 14 }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}

// ── Small shared components ──────────────────────────
function SectionHeader({ title, onSeeAll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <h2 className="font-display" style={{ fontSize: 20, color: "#2e1a08" }}>{title}</h2>
      {onSeeAll && <button onClick={onSeeAll} style={{ fontSize: 13, fontWeight: 600, color: "#c8974a", background: "none", border: "none", cursor: "pointer" }}>See all →</button>}
    </div>
  );
}

function EmptyShelf({ onDiscover }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <p style={{ fontSize: 36, marginBottom: 12 }}>📚</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#2e1a08", marginBottom: 8 }}>Your library is empty</p>
      <p style={{ fontSize: 13, color: "rgba(176,125,50,0.7)", marginBottom: 20 }}>Search for books to add to your collection.</p>
      <button onClick={onDiscover} className="btn btn-primary">Discover books</button>
    </div>
  );
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8974a" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function ClearIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function ChevronIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8974a" strokeWidth="2" style={{ opacity: 0.4 }}><path d="m9 18 6-6-6-6"/></svg>;
}
function GoogleLogoSmall() {
  return <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>;
}

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// ── Styles ────────────────────────────────────────────
const styles = {
  app: { display: "flex", height: "100dvh", width: "100vw", overflow: "hidden", background: "#fdf8f0" },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", overflow: "hidden" },

  screen: {
    position: "absolute", inset: 0,
    overflowY: "auto", overflowX: "hidden",
    background: "#fdf8f0",
    paddingBottom: 80,
    "@media (minWidth: 1024px)": { paddingBottom: 0 },
  },
  stickyHeader: {
    position: "sticky", top: 0, zIndex: 10,
    padding: "40px 24px 12px",
    background: "linear-gradient(to bottom, #f5ead8 70%, rgba(245,234,216,0))",
  },
  screenBody: { padding: "0 24px 24px" },
  screenBodyProfile: { padding: "16px 24px 40px" },

  greetLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8974a", marginBottom: 4 },
  greetTitle: { fontSize: "clamp(28px, 5vw, 38px)", color: "#2e1a08", lineHeight: 1.15 },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8974a", marginBottom: 4 },
  pageTitle: { fontSize: "clamp(28px, 5vw, 38px)", color: "#2e1a08", lineHeight: 1.15 },

  statsRow: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4, marginBottom: 24 },
  statCard: {
    flexShrink: 0,
    background: "white",
    border: "1px solid #e8d5b7",
    borderRadius: 20,
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(176,125,50,0.08)",
  },
  statValue: { fontSize: 26, color: "#2e1a08", lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#c8974a", fontWeight: 600, marginTop: 4 },

  currentlyReading: {
    background: "linear-gradient(135deg, #4a2b0f, #2e1a08)",
    borderRadius: 24,
    padding: "20px 22px",
    display: "flex", gap: 18, alignItems: "center",
    marginBottom: 28,
    position: "relative", overflow: "hidden",
    boxShadow: "0 8px 32px rgba(46,26,8,0.25)",
  },
  crGlow: { position: "absolute", top: 0, right: 0, width: 160, height: 160, borderRadius: "50%", background: "rgba(200,151,74,0.1)", transform: "translate(40%,-40%)", filter: "blur(30px)", pointerEvents: "none" },
  crCoverWrap: { width: 60, height: 88, borderRadius: 8, overflow: "hidden", flexShrink: 0, boxShadow: "0 6px 20px rgba(0,0,0,0.4)", background: "#6b3f1a" },
  crCover: { width: "100%", height: "100%", objectFit: "cover" },
  crCoverFallback: { width: "100%", height: "100%", background: "linear-gradient(135deg,#8b5e1a,#3d2610)" },
  crInfo: { flex: 1, minWidth: 0 },
  crEyebrow: { fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c8974a", marginBottom: 5 },
  crTitle: { fontSize: 16, color: "#fdf8f0", lineHeight: 1.3, marginBottom: 3 },
  crAuthor: { fontSize: 12, color: "rgba(253,248,240,0.45)", marginBottom: 12 },
  crBarWrap: { height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 100, overflow: "hidden" },
  crBar: { height: "100%", background: "linear-gradient(90deg, #c8974a, #e8b96a)", borderRadius: 100, transition: "width 0.8s ease" },
  crPct: { fontSize: 11, color: "#c8974a", fontWeight: 600, marginTop: 5 },

  hScroll: { display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, marginBottom: 28 },

  searchBar: {
    display: "flex", alignItems: "center", gap: 10,
    background: "white",
    border: "1.5px solid #e8d5b7",
    borderRadius: 16,
    padding: "11px 16px",
    marginBottom: 14,
    transition: "border-color 0.15s",
  },
  searchInput: {
    flex: 1, background: "transparent",
    border: "none", outline: "none",
    fontSize: 14, color: "#2e1a08",
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: { background: "none", border: "none", cursor: "pointer", color: "rgba(200,151,74,0.5)", display: "flex" },

  filterRow: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20 },
  filterPill: {
    flexShrink: 0,
    fontSize: 12, fontWeight: 600,
    padding: "7px 16px",
    borderRadius: 100,
    border: "1.5px solid #e8d5b7",
    background: "white",
    color: "#c8974a",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  filterPillActive: {
    background: "#2e1a08",
    borderColor: "#2e1a08",
    color: "#fdf8f0",
  },

  booksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },

  empty: { textAlign: "center", padding: "40px 0" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "#2e1a08", marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: "rgba(176,125,50,0.7)", lineHeight: 1.5, maxWidth: 280, margin: "0 auto" },

  searching: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" },
  searchPlaceholder: { textAlign: "center", padding: "60px 20px" },

  // Profile
  profileHero: {
    background: "linear-gradient(135deg, #4a2b0f, #2e1a08)",
    padding: "56px 24px 28px",
    display: "flex", alignItems: "center", gap: 18,
    position: "relative", overflow: "hidden",
  },
  profileGlow: { position: "absolute", bottom: 0, right: 0, width: 200, height: 200, borderRadius: "50%", background: "rgba(200,151,74,0.08)", transform: "translate(40%,40%)", filter: "blur(40px)" },
  profileAvatarWrap: { flexShrink: 0 },
  profileAvatar: { width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(200,151,74,0.3)", boxShadow: "0 4px 20px rgba(200,151,74,0.3)" },
  profileAvatarFallback: {
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #c8974a, #8f6422)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'DM Serif Display', serif",
    fontSize: 30, fontWeight: 700, color: "#2e1a08",
    border: "2px solid rgba(200,151,74,0.3)",
    boxShadow: "0 4px 20px rgba(200,151,74,0.3)",
  },
  profileName: { fontSize: 26, color: "#fdf8f0", marginBottom: 4 },
  profileEmail: { fontSize: 13, color: "rgba(253,248,240,0.4)", marginBottom: 8 },
  googleBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 100, padding: "3px 10px",
    fontSize: 11, color: "rgba(253,248,240,0.55)",
  },
  profileStats: {
    display: "flex",
    background: "white",
    borderRadius: "0 0 20px 20px",
    marginHorizontal: 24,
    border: "1px solid #e8d5b7",
    borderTop: "none",
    overflow: "hidden",
    marginBottom: 4,
    boxShadow: "0 2px 12px rgba(176,125,50,0.08)",
  },
  profileStat: { flex: 1, padding: "14px 0", textAlign: "center" },
  profileStatValue: { fontSize: 24, color: "#2e1a08" },
  profileStatLabel: { fontSize: 11, color: "#c8974a", fontWeight: 500, marginTop: 2 },

  goalCard: {
    background: "rgba(200,151,74,0.08)",
    border: "1px solid rgba(200,151,74,0.2)",
    borderRadius: 18,
    padding: 16,
    display: "flex", alignItems: "center", gap: 14,
    marginBottom: 24,
  },
  goalIcon: { width: 44, height: 44, background: "rgba(200,151,74,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  goalTitle: { fontSize: 14, fontWeight: 700, color: "#2e1a08", marginBottom: 2 },
  goalSub: { fontSize: 12, color: "#c8974a", marginBottom: 8 },
  goalBarWrap: { height: 5, background: "rgba(200,151,74,0.15)", borderRadius: 100, overflow: "hidden" },
  goalBar: { height: "100%", background: "linear-gradient(90deg, #c8974a, #e8b96a)", borderRadius: 100, transition: "width 0.8s ease" },

  settingsLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(200,151,74,0.5)", marginBottom: 10, paddingLeft: 4 },
  settingsRow: {
    display: "flex", alignItems: "center", gap: 14,
    width: "100%", padding: "13px 14px",
    background: "none", border: "none",
    borderRadius: 14, cursor: "pointer",
    transition: "background 0.15s",
    textAlign: "left",
    marginBottom: 2,
  },
  settingsEmoji: { fontSize: 20, width: 36, height: 36, background: "#f5ead8", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  settingsRowLabel: { flex: 1, fontSize: 14, fontWeight: 500, color: "#2e1a08" },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 14,
    width: "100%", padding: "13px 14px",
    background: "none", border: "none",
    borderRadius: 14, cursor: "pointer",
    transition: "background 0.15s",
    marginTop: 8,
  },
  logoutIcon: { width: 36, height: 36, background: "#fef2f2", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
};
