import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={styles.page}>
      {/* Noise texture overlay */}
      <div style={styles.noise} />

      {/* Header */}
      <header style={styles.header} className="fade-in">
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e1a08" strokeWidth="2.5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <span className="font-display" style={styles.logoText}>Folio</span>
        </div>
        <div style={styles.headerActions}>
          <Link to="/login" className="btn btn-ghost" style={{ color: "rgba(253,248,240,0.6)" }}>Sign in</Link>
          <Link to="/signup" className="btn btn-primary">Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge} className="fade-up">
            <span style={styles.badgeDot} />
            Track. Discover. Remember.
          </div>

          <h1 className="font-display fade-up stagger-1" style={styles.headline}>
            Your entire<br />
            <em style={styles.headlineAccent}>reading life,</em><br />
            in one place.
          </h1>

          <p className="fade-up stagger-2" style={styles.subhead}>
            Folio helps you track what you've read, discover what to read next,
            and remember why you loved it.
          </p>

          <div style={styles.heroCTAs} className="fade-up stagger-3">
            <Link to="/signup" className="btn btn-primary" style={{ fontSize: 15, padding: "14px 32px" }}>
              Start for free
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: 15, padding: "14px 32px", background: "rgba(255,255,255,0.1)", color: "#fdf8f0", borderColor: "rgba(255,255,255,0.15)" }}>
              Sign in
            </Link>
          </div>

          <p className="fade-up stagger-4" style={styles.socialProof}>
            No credit card required · Free forever
          </p>
        </div>

        {/* Decorative book stack */}
        <div style={styles.bookStack} className="fade-up stagger-2">
          {MOCK_BOOKS.map((book, i) => (
            <div key={i} style={{ ...styles.stackBook, ...book.style }}>
              {book.cover
                ? <img src={book.cover} alt="" style={styles.stackCover} onError={(e) => { e.target.style.display = "none"; }} />
                : null
              }
              <div style={{ ...styles.stackSpine, background: book.bg }} />
            </div>
          ))}
        </div>
      </main>

      {/* Features strip */}
      <div style={styles.features} className="fade-up stagger-4">
        {FEATURES.map((f, i) => (
          <div key={i} style={styles.featureItem}>
            <span style={styles.featureEmoji}>{f.emoji}</span>
            <div>
              <p style={styles.featureTitle}>{f.title}</p>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MOCK_BOOKS = [
  { cover: "https://covers.openlibrary.org/b/isbn/9780525559474-M.jpg", bg: "#5c3d2e", style: { transform: "rotate(-8deg) translateX(-20px) translateY(10px)", zIndex: 1, width: 90 } },
  { cover: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg", bg: "#2d4a3e", style: { transform: "rotate(3deg)", zIndex: 3, width: 100 } },
  { cover: "https://covers.openlibrary.org/b/isbn/9780593135204-M.jpg", bg: "#1a3a5c", style: { transform: "rotate(10deg) translateX(18px) translateY(8px)", zIndex: 2, width: 88 } },
];

const FEATURES = [
  { emoji: "📚", title: "Track your reads", desc: "Log every book with status and progress" },
  { emoji: "🔍", title: "Search millions", desc: "Powered by the Open Library database" },
  { emoji: "⭐", title: "Save favorites", desc: "Build your personal collection" },
  { emoji: "📊", title: "Reading stats", desc: "See your reading habits at a glance" },
];

const styles = {
  page: {
    minHeight: "100dvh",
    width: "100%",
    background: "linear-gradient(160deg, #2e1a08 0%, #4a2b0f 50%, #2e1a08 100%)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
  },
  noise: {
    position: "fixed", inset: 0, zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 40px",
    position: "relative", zIndex: 10,
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    background: "linear-gradient(135deg, #c8974a, #8f6422)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 22, fontWeight: 700, color: "#fdf8f0" },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },
  hero: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 80,
    padding: "40px 40px 60px",
    position: "relative", zIndex: 1,
    flexWrap: "wrap",
  },
  heroContent: { maxWidth: 520 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(200,151,74,0.15)",
    border: "1px solid rgba(200,151,74,0.3)",
    borderRadius: 100,
    padding: "6px 14px",
    fontSize: 12, fontWeight: 600,
    color: "#c8974a",
    letterSpacing: "0.04em",
    marginBottom: 24,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#c8974a",
    boxShadow: "0 0 6px #c8974a",
  },
  headline: {
    fontSize: "clamp(42px, 6vw, 72px)",
    lineHeight: 1.1,
    color: "#fdf8f0",
    marginBottom: 24,
    letterSpacing: "-0.02em",
  },
  headlineAccent: {
    color: "#c8974a",
    fontStyle: "italic",
  },
  subhead: {
    fontSize: 17,
    color: "rgba(253,248,240,0.55)",
    lineHeight: 1.6,
    marginBottom: 36,
    maxWidth: 420,
  },
  heroCTAs: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 },
  socialProof: { fontSize: 12, color: "rgba(253,248,240,0.35)", letterSpacing: "0.02em" },
  bookStack: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 220,
    flexShrink: 0,
  },
  stackBook: {
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    flexShrink: 0,
  },
  stackCover: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  stackSpine: { position: "absolute", inset: 0 },
  features: {
    display: "flex",
    gap: 0,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    position: "relative", zIndex: 1,
    flexWrap: "wrap",
  },
  featureItem: {
    flex: "1 1 200px",
    display: "flex", alignItems: "center", gap: 14,
    padding: "20px 32px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  featureEmoji: { fontSize: 28, flexShrink: 0 },
  featureTitle: { fontSize: 13, fontWeight: 700, color: "#fdf8f0", marginBottom: 2 },
  featureDesc: { fontSize: 12, color: "rgba(253,248,240,0.4)" },
};
