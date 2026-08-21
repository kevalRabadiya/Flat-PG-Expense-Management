import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSettings, updateSettings } from "../api";
import Loader from "../components/Loader.jsx";
import { toast } from "../lib/toast.js";
import { useSettings } from "../settings/useSettings.js";

const CONFIG_ADMIN_USERNAME = "keval";
const THALI_IDS = [1, 2, 3, 4, 5];

function toFieldValue(n) {
  return Number.isFinite(Number(n)) ? String(n) : "";
}

export default function ConfigPage({ authUser }) {
  const { applySettings } = useSettings();
  const isAuthorized =
    String(authUser?.username || "").toLowerCase() === CONFIG_ADMIN_USERNAME;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [thaliPrices, setThaliPrices] = useState({});
  const [housekeeperRatePerDay, setHousekeeperRatePerDay] = useState("");

  useEffect(() => {
    if (!isAuthorized) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSettings()
      .then((data) => {
        if (cancelled) return;
        const nextThali = {};
        for (const id of THALI_IDS) {
          nextThali[id] = toFieldValue(data?.thaliPrices?.[id]);
        }
        setThaliPrices(nextThali);
        setHousekeeperRatePerDay(toFieldValue(data?.housekeeperRatePerDay));
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load config.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthorized]);

  function setThaliPrice(id, value) {
    setThaliPrices((prev) => ({ ...prev, [id]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    const parsedThali = {};
    for (const id of THALI_IDS) {
      const n = Number(thaliPrices[id]);
      if (thaliPrices[id] === "" || !Number.isFinite(n) || n < 0) {
        setError(`Thali ${id} price must be a number >= 0.`);
        return;
      }
      parsedThali[id] = n;
    }
    const rate = Number(housekeeperRatePerDay);
    if (housekeeperRatePerDay === "" || !Number.isFinite(rate) || rate < 0) {
      setError("HouseKeeper rate per day must be a number >= 0.");
      return;
    }

    setSaving(true);
    try {
      const data = await updateSettings({
        thaliPrices: parsedThali,
        housekeeperRatePerDay: rate,
      });
      applySettings(data);
      toast.success("Config saved. Applied everywhere.");
    } catch (err) {
      const msg = err.message || "Failed to save config.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="page premium-shell premium-page">
        <div className="page-head glass-hero premium-hero motion-fade-up">
          <div>
            <p className="eyebrow">Config</p>
            <h1>Not authorized</h1>
            <p className="lede muted mb-0">
              Only the {CONFIG_ADMIN_USERNAME} account can view pricing config.
            </p>
          </div>
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page premium-shell premium-page">
      <div className="page-head glass-hero premium-hero motion-fade-up">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Config</h1>
          <p className="lede muted mb-0">
            Update thali prices and the HouseKeeper daily rate. Saving applies
            the new values in the database, everywhere in the app,
            immediately.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Home
        </Link>
      </div>

      {loading ? (
        <div className="loading-block">
          <Loader label="Loading config…" />
        </div>
      ) : (
        <form
          className="form card-elevated config-form glass-panel-3d depth-card neon-edge motion-fade-up motion-delay-1"
          onSubmit={onSubmit}
        >
          <fieldset className="extras">
            <legend>Thali prices (₹)</legend>
            <div className="grid-2 config-thali-grid">
              {THALI_IDS.map((id) => (
                <label key={id}>
                  Thali {id}
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={thaliPrices[id] ?? ""}
                    onChange={(e) => setThaliPrice(id, e.target.value)}
                    placeholder="0"
                    required
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            HouseKeeper rate per day (₹)
            <input
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={housekeeperRatePerDay}
              onChange={(e) => setHousekeeperRatePerDay(e.target.value)}
              placeholder="0"
              required
            />
          </label>

          {error ? (
            <div className="banner banner--error" role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving…" : "Save config"}
          </button>
        </form>
      )}
    </div>
  );
}
