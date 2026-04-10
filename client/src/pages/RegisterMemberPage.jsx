import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

export default function RegisterMemberPage() {
  const { user, loading, registerMember } = useAuth();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
      await registerMember({
        inviteCode: inviteCode.trim().toUpperCase(),
        username: username.trim(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-shell app-glass">
      <div className="auth-inner">
        <div className="page page-head glass-hero auth-hero">
          <div>
            <p className="eyebrow">Join</p>
            <h1>Join with invite code</h1>
            <p className="lede muted">
              Ask your admin for the organization code.
            </p>
          </div>
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
        </div>
        <form
          className="form card-elevated glass-surface auth-form"
          onSubmit={onSubmit}
        >
          <label>
            Invite code
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              autoComplete="one-time-code"
              placeholder="8 characters"
              maxLength={16}
            />
          </label>
          <label>
            Username <span className="muted">(for login, globally unique)</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label>
            Your name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Phone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password <span className="muted">(min 4 characters)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              autoComplete="new-password"
            />
          </label>
          {error ? (
            <div className="banner banner--error" role="alert">
              {error}
            </div>
          ) : null}
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? "Joining…" : "Join organization"}
          </button>
          <p className="muted mb-0 small auth-footer-links">
            <span>Starting fresh?</span>{" "}
            <Link to="/register">Create organization</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
