import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { view: "home",      label: "Home",      icon: HomeIcon },
  { view: "books",     label: "Library",   icon: BookIcon },
  { view: "search",    label: "Discover",  icon: SearchIcon },
  { view: "favorites", label: "Favorites", icon: BookmarkIcon },
  { view: "profile",   label: "Profile",   icon: UserIcon },
];

export function Sidebar({ currentView, onNavigate }) {
  const { user } = useAuth();
  const initial = (user?.name || user?.email || "R")[0].toUpperCase();

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e1a08" strokeWidth="2.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span style={styles.logoText} className="font-display">Folio</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
          const active = currentView === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
            >
              <span style={{ ...styles.navIconWrap, ...(active ? styles.navIconActive : {}) }}>
                <Icon size={16} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* User chip */}
      <button onClick={() => onNavigate("profile")} style={styles.userChip}>
        {user?.avatar_url
          ? <img src={user.avatar_url} alt={user.name} style={styles.avatar} />
          : <div style={styles.avatarFallback}>{initial}</div>
        }
        <div style={styles.userInfo}>
          <p style={styles.userName} className="truncate">{user?.name || "Reader"}</p>
          <p style={styles.userEmail} className="truncate">{user?.email || ""}</p>
        </div>
      </button>
    </aside>
  );
}

export function BottomNav({ currentView, onNavigate }) {
  return (
    <nav style={styles.bottomNav}>
      {NAV_ITEMS.map(({ view, label, icon: Icon }) => {
        const active = currentView === view;
        return (
          <button key={view} onClick={() => onNavigate(view)} style={styles.bottomItem}>
            <span style={{ ...styles.bottomIconWrap, ...(active ? styles.bottomIconActive : {}) }}>
              <Icon size={20} color={active ? "#b07d32" : "rgba(176,125,50,0.35)"} />
            </span>
            <span style={{ ...styles.bottomLabel, color: active ? "#b07d32" : "rgba(176,125,50,0.35)", fontWeight: active ? 700 : 500 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Icon components ──────────────────────────────────
function HomeIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BookIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function SearchIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function BookmarkIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function UserIcon({ size = 20, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

const styles = {
  sidebar: {
    width: 230,
    background: "#2e1a08",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "32px 16px",
    flexShrink: 0,
  },
  logo: { display: "flex", alignItems: "center", gap: 10, padding: "0 12px", marginBottom: 40 },
  logoIcon: {
    width: 32, height: 32,
    borderRadius: 10,
    background: "linear-gradient(135deg, #c8974a, #8f6422)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { fontSize: 22, fontWeight: 700, color: "#fdf8f0" },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px",
    borderRadius: 14,
    border: "none", background: "transparent",
    color: "rgba(253,248,240,0.4)",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s, color 0.15s",
  },
  navItemActive: {
    background: "rgba(255,255,255,0.07)",
    color: "#c8974a",
  },
  navIconWrap: {
    width: 32, height: 32,
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  navIconActive: { background: "rgba(200,151,74,0.18)" },
  userChip: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px",
    borderRadius: 14,
    border: "none", background: "transparent",
    cursor: "pointer",
    width: "100%",
    marginTop: 8,
    transition: "background 0.15s",
  },
  avatar: { width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 },
  avatarFallback: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg, #c8974a, #8f6422)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "#2e1a08",
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0, textAlign: "left" },
  userName: { fontSize: 12, fontWeight: 600, color: "#fdf8f0" },
  userEmail: { fontSize: 10, color: "rgba(253,248,240,0.35)" },

  // Bottom nav
  bottomNav: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 72,
    background: "rgba(253,248,240,0.94)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid #e8d5b7",
    display: "flex", alignItems: "stretch",
    padding: "0 8px",
    zIndex: 50,
  },
  bottomItem: {
    flex: 1,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 3,
    background: "none", border: "none", cursor: "pointer",
    padding: "8px 0",
  },
  bottomIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s, box-shadow 0.2s",
  },
  bottomIconActive: {
    background: "rgba(200,151,74,0.12)",
    boxShadow: "0 0 16px rgba(200,151,74,0.3)",
  },
  bottomLabel: { fontSize: 10 },
};
