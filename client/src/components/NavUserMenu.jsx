import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth.js";
import { useTheme } from "../theme/useTheme.js";

function initialsFromName(name) {
  const s = typeof name === "string" ? name.trim() : "";
  if (!s) return "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase();
}

export default function NavUserMenu() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = useMemo(() => initialsFromName(user?.name), [user?.name]);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="nav-user-menu" ref={menuRef}>
      <button
        type="button"
        className={`nav-user-trigger ${open ? "active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-user-avatar" aria-hidden>
          {initials}
        </span>
      </button>
      {open ? (
        <div
          className="nav-user-panel"
          role="menu"
          aria-label="Account"
        >
          <div className="nav-user-panel-header" role="none">
            <span className="nav-user-panel-label">Signed in as</span>
            <span className="nav-user-panel-name">{user.name}</span>
          </div>
          {/* <div className="nav-user-panel-divider" role="separator" />
          <div className="nav-user-panel-section" role="none">
            <span className="nav-user-panel-section-title" id="nav-user-username-label">
              Username
            </span>
            <p className="small muted nav-user-username-hint">
              Login name; globally unique. Saved in lowercase.
            </p>
            <input
              type="text"
              className="nav-user-username-input"
              aria-labelledby="nav-user-username-label"
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value)}
              autoComplete="username"
            />
            {usernameErr ? (
              <p className="small error nav-user-username-err" role="alert">
                {usernameErr}
              </p>
            ) : null}
            <button
              type="button"
              className="btn btn-sm primary nav-user-username-save"
              disabled={usernameBusy}
              onClick={async () => {
                setUsernameErr(null);
                setUsernameBusy(true);
                try {
                  await patchMyUsername(usernameDraft.trim());
                  await refreshUser();
                } catch (err) {
                  setUsernameErr(err.message || "Could not update username");
                } finally {
                  setUsernameBusy(false);
                }
              }}
            >
              {usernameBusy ? "Saving…" : "Save username"}
            </button>
          </div>
          <div className="nav-user-panel-divider" role="separator" /> */}
          <div className="nav-user-panel-section" role="none">
            <span className="nav-user-panel-section-title" id="nav-user-appearance-label">
              Appearance
            </span>
            <div
              className="nav-user-appearance-row"
              role="group"
              aria-labelledby="nav-user-appearance-label"
            >
              <button
                type="button"
                role="menuitemradio"
                aria-checked={resolvedTheme === "light"}
                className={`nav-user-theme-option ${resolvedTheme === "light" ? "is-active" : ""}`}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={resolvedTheme === "dark"}
                className={`nav-user-theme-option ${resolvedTheme === "dark" ? "is-active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>
          <div className="nav-user-panel-divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="nav-user-logout"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
