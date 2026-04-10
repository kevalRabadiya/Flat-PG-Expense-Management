import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../api";
import { useAuth } from "../auth/useAuth.js";

export default function AddUserPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (user?.role !== "admin") {
    return (
      <div className="page">
        <div className="panel panel--error space-y-2">
          <p className="error mb-0">Only admins can add users.</p>
          <Link to="/" className="btn primary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRe.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setSaving(true);
    try {
      await createUser({
        username,
        name,
        phone,
        email: normalizedEmail,
        password,
        address: address.trim() || undefined,
      });
      navigate("/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Onboarding</p>
          <h1>New user</h1>
          <p className="lede muted">
            Username (login), name, phone, and email are required; address
            helps delivery runners.
          </p>
        </div>
        <Link to="/users" className="btn btn-ghost">
          Back
        </Link>
      </div>
      <form className="form card-elevated" onSubmit={onSubmit}>
        <label>
          Username <span className="muted">(login, globally unique)</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="e.g. john_flatmate"
          />
        </label>
        <label>
          Display name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="e.g. John Doe"
          />
        </label>
        <label>
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
            placeholder="+91 …"
          />
        </label>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
          />
        </label>
        <label>
          Password <span className="muted">(min 4 — they log in with this)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
            autoComplete="new-password"
          />
        </label>
        <label>
          Address <span className="muted">(optional)</span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="Building, area, landmark"
          />
        </label>
        {error ? (
          <div className="banner banner--error" role="alert">
            {error}
          </div>
        ) : null}
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? "Saving…" : "Save user"}
        </button>
      </form>
    </div>
  );
}
