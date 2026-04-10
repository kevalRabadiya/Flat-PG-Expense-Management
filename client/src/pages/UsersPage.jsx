import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { getUsers, patchUserUsername } from "../api";
import { useAuth } from "../auth/useAuth.js";

export default function UsersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isAdmin);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [usernameErr, setUsernameErr] = useState(null);
  const [usernameBusy, setUsernameBusy] = useState(false);

  async function reloadUsers() {
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    reloadUsers()
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="page">
        <div className="panel panel--error space-y-2">
          <p className="error mb-0">Only admins can manage users.</p>
          <Link to="/" className="btn primary">
            Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-block">
          <Loader label="Loading users…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="panel panel--error">
          <p className="error mb-0">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Directory</p>
          <h1>Users</h1>
          <p className="lede muted">
            Everyone who orders from you — open an order in one tap. Admins can
            change a member&apos;s login username (globally unique).
          </p>
        </div>
        <Link to="/users/new" className="btn primary">
          Add user
        </Link>
      </div>
      {users.length === 0 ? (
        <div className="empty-hint">
          <p className="muted mb-0">
            No users yet. <Link to="/users/new">Add your first user</Link>{" "}
            to start taking orders.
          </p>
        </div>
      ) : (
        <ul className="user-list">
          {users.map((u) => (
            <li key={u._id} className="user-card">
              <div className="user-meta">
                <strong>{u.name}</strong>
                <span className="small muted">
                  @{u.username || "—"}
                </span>
                <span className="muted">{u.phone}</span>
                {u.email ? <span className="small muted">{u.email}</span> : null}
                {u.address ? <span className="small">{u.address}</span> : null}
                {editingId === u._id ? (
                  <div className="user-username-edit">
                    <label className="user-username-label small muted">
                      New username
                    </label>
                    <div className="user-username-row">
                      <input
                        type="text"
                        className="user-username-input"
                        value={draftUsername}
                        onChange={(e) => setDraftUsername(e.target.value)}
                        autoComplete="username"
                      />
                      <button
                        type="button"
                        className="btn btn-sm primary"
                        disabled={usernameBusy}
                        onClick={async () => {
                          setUsernameErr(null);
                          setUsernameBusy(true);
                          try {
                            await patchUserUsername(u._id, draftUsername.trim());
                            setEditingId(null);
                            await reloadUsers();
                          } catch (err) {
                            setUsernameErr(err.message || "Update failed");
                          } finally {
                            setUsernameBusy(false);
                          }
                        }}
                      >
                        {usernameBusy ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        disabled={usernameBusy}
                        onClick={() => {
                          setEditingId(null);
                          setUsernameErr(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                    {usernameErr ? (
                      <p className="small error user-username-err-msg" role="alert">
                        {usernameErr}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost user-username-change-btn"
                    onClick={() => {
                      setEditingId(u._id);
                      setDraftUsername(
                        typeof u.username === "string" ? u.username : ""
                      );
                      setUsernameErr(null);
                    }}
                  >
                    Change username
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
