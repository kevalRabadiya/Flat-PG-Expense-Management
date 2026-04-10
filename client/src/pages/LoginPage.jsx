import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell app-glass">
      <div className="auth-inner">
        <div className="page page-head glass-hero auth-hero">
          <div>
            <p className="eyebrow">Account</p>
            <h1>Log in</h1>
            <p className="lede muted">
              Log in with your username (not your display name) and password.
              Usernames are globally unique.
            </p>
          </div>
        </div>
        <form
          className="form card-elevated glass-surface auth-form"
          onSubmit={onSubmit}
        >
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={4}
            />
          </label>
          {error ? (
            <div className="banner banner--error" role="alert">
              {error}
            </div>
          ) : null}
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="muted mb-0 small auth-footer-links">
            <span>New organization?</span>{" "}
            <Link to="/register">Create one</Link>
            <span aria-hidden="true"> · </span>
            <span>Have an invite code?</span>{" "}
            <Link to="/register/member">Join</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
