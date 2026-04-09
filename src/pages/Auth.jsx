import { useState } from "react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Shared layout ────────────────────────────────────
function AuthLayout({ children, title, subtitle, altText, altLink, altLabel }) {
  return (
    <div style={styles.page}>
      <div style={styles.noise} />
      <div style={styles.card} className="slide-up">
        {/* Logo */}
<Link
  to="/"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "opacity 0.2s ease",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
  onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
>
  <img
    src={Logo}
    alt="Folio Logo"
    style={{
      height: 28,
      width: 28,
      objectFit: "contain",
      display: "block",
    }}
  />
  <span
    style={{
      fontFamily: "YourFontFamily, sans-serif",
      fontSize: 18,
      fontWeight: 600,
      color: "#2e1a08",
      lineHeight: 1,
    }}
  >
    Folio
  </span>
</Link>
        <h1 className="font-display" style={styles.title}>
          {title}
        </h1>
        <p style={styles.subtitle}>{subtitle}</p>

        {children}

        <p style={styles.altText}>
          {altText}{" "}
          <Link to={altLink} style={styles.altLink}>
            {altLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── SIGNUP ────────────────────────────────────────────
export function Signup() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your name.");
    if (!form.email.includes("@")) return setError("Enter a valid email.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your reading life today."
      altText="Already have an account?"
      altLink="/login"
      altLabel="Sign in"
    >
      <GoogleButton onClick={loginWithGoogle} label="Sign up with Google" />
      <Divider />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Your name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Alex Reader"
            className={`input ${error && !form.name ? "error" : ""}`}
            autoComplete="name"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="alex@example.com"
            className="input"
            autoComplete="email"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="At least 6 characters"
            className="input"
            autoComplete="new-password"
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 4 }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

// ─── LOGIN ─────────────────────────────────────────────
export function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your reading journey."
      altText="Don't have an account?"
      altLink="/signup"
      altLabel="Sign up free"
    >
      <GoogleButton onClick={loginWithGoogle} label="Continue with Google" />
      <Divider />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="alex@example.com"
            className="input"
            autoComplete="email"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Your password"
            className="input"
            autoComplete="current-password"
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 4 }}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}

// ─── Shared sub-components ─────────────────────────────
function GoogleButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-secondary"
      style={{ width: "100%", gap: 10 }}
    >
      <GoogleLogo />
      {label}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function Divider() {
  return (
    <div style={styles.divider}>
      <div style={styles.dividerLine} />
      <span style={styles.dividerText}>or</span>
      <div style={styles.dividerLine} />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    width: "100%",
    background: "linear-gradient(160deg, #2e1a08, #4a2b0f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    overflowY: "auto",
    position: "relative",
  },
  noise: {
    position: "fixed",
    inset: 0,
    zIndex: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
  },
  card: {
    background: "#fdf8f0",
    borderRadius: 28,
    padding: "36px 32px 32px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    marginBottom: 32,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: "linear-gradient(135deg, #c8974a, #8f6422)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, color: "#2e1a08", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "rgba(176,125,50,0.7)", marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#2e1a08",
    letterSpacing: "0.02em",
  },
  error: {
    fontSize: 13,
    color: "#dc2626",
    background: "#fef2f2",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 500,
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "20px 0" },
  dividerLine: { flex: 1, height: 1, background: "#e8d5b7" },
  dividerText: { fontSize: 12, color: "#c8974a", fontWeight: 600 },
  altText: {
    fontSize: 13,
    color: "rgba(176,125,50,0.7)",
    textAlign: "center",
    marginTop: 24,
  },
  altLink: { color: "#c8974a", fontWeight: 600, textDecoration: "none" },
};
