import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";

export default function RegisterOrgPage() {
  const { user, loading, registerOrg } = useAuth();
  const navigate = useNavigate();
  const [organizationKind, setOrganizationKind] = useState("flat_pg");
  const [organizationName, setOrganizationName] = useState("");
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
      await registerOrg({
        organizationKind,
        ...(organizationKind === "flat_pg"
          ? { organizationName: organizationName.trim() || undefined }
          : {}),
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
            <p className="eyebrow">Setup</p>
            <h1>Create organization</h1>
            <p className="lede muted">
              You become the admin and get an invite code for flatmates.
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
            Organization type
            <select
              value={organizationKind}
              onChange={(e) => {
                const v = e.target.value;
                setOrganizationKind(v);
                if (v === "user") setOrganizationName("");
              }}
            >
              <option value="flat_pg">Flat / PG</option>
              <option value="user">User (personal)</option>
            </select>
          </label>
          {organizationKind === "flat_pg" ? (
            <label>
              Organization name <span className="muted">(optional)</span>
              <input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. 4B Maple society"
              />
            </label>
          ) : null}
          <label>
            Username <span className="muted">(for login, globally unique)</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="e.g. keval"
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
            {busy ? "Creating…" : "Create organization"}
          </button>
          <p className="muted mb-0 small auth-footer-links">
            <span>Have an invite?</span>{" "}
            <Link to="/register/member">Join existing org</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
