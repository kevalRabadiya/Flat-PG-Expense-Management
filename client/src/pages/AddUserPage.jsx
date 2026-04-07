import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUser } from "../api";

export default function AddUserPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRe.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      await createUser({
        name,
        phone,
        email: normalizedEmail,
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
            Name and phone are required; address helps delivery runners.
          </p>
        </div>
        <Link to="/users" className="btn btn-ghost">
          Back
        </Link>
      </div>
      <form className="form card-elevated" onSubmit={onSubmit}>
        <label>
          Name
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
