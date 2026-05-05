import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getWaterBillsForYear, saveWaterBill } from "../api";
import Loader from "../components/Loader.jsx";
import { toast } from "../lib/toast.js";

function currentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthHumanLabel(ym) {
  const [ys, ms] = String(ym).split("-");
  const y = Number(ys);
  const mo = Number(ms);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || mo < 1 || mo > 12) return ym;
  return new Date(y, mo - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function WaterBillPage() {
  const [monthKey, setMonthKey] = useState(currentMonthValue);
  const [amount, setAmount] = useState("");
  const [yearRows, setYearRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const selectedYear = useMemo(() => Number(monthKey.slice(0, 4)), [monthKey]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const rows = await getWaterBillsForYear(selectedYear);
        if (cancelled) return;
        const safeRows = Array.isArray(rows) ? rows : [];
        setYearRows(safeRows);
        const existing = safeRows.find((r) => r?.monthKey === monthKey);
        const v =
          existing != null && Number.isFinite(Number(existing.amount))
            ? String(existing.amount)
            : "";
        setAmount(v);
      } catch (e) {
        if (!cancelled) {
          setYearRows([]);
          setAmount("");
          setError(e.message || "Failed to load water bill.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [monthKey, selectedYear]);

  const recentRows = useMemo(
    () =>
      [...yearRows]
        .sort((a, b) => {
          const aTs = String(a?.updatedAt ?? a?.createdAt ?? "");
          const bTs = String(b?.updatedAt ?? b?.createdAt ?? "");
          return bTs.localeCompare(aTs);
        })
        .slice(0, 5),
    [yearRows]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!monthKey) {
      setError("Select a month.");
      return;
    }
    if (String(amount).trim() === "") {
      setError("Enter an amount.");
      return;
    }
    const n = Number(amount);
    if (!Number.isFinite(n) || n < 0) {
      setError("Enter a valid amount (0 or more).");
      return;
    }

    setSaving(true);
    try {
      await saveWaterBill({ monthKey, amount: n });
      const rows = await getWaterBillsForYear(selectedYear);
      const safeRows = Array.isArray(rows) ? rows : [];
      setYearRows(safeRows);
      const existing = safeRows.find((r) => r?.monthKey === monthKey);
      setAmount(existing != null ? String(existing.amount) : String(n));
      toast.success("Water bill saved.");
    } catch (e2) {
      const msg = e2.message || "Could not save water bill.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page--wide waterbill-page premium-shell premium-page">
      <div className="page-head waterbill-page-head glass-hero premium-hero motion-fade-up">
        <div>
          <p className="eyebrow">Utilities</p>
          <h1>Water bill</h1>
          <p className="lede muted mb-0">
            Save one amount per month and track the latest 5 updates.
          </p>
        </div>
        <Link to="/" className="btn btn-ghost">
          Home
        </Link>
      </div>

      {loading ? (
        <div className="loading-block">
          <Loader label="Loading…" />
        </div>
      ) : (
        <>
          <form
            className="form card-elevated waterbill-form glass-surface glass-panel-3d depth-card neon-edge motion-fade-up motion-delay-1"
            onSubmit={onSubmit}
          >
            <h2 className="form-section-title mb-0">Month entry</h2>
            <label>
              Month
              <input
                type="month"
                value={monthKey}
                onChange={(e) => setMonthKey(e.target.value)}
                max={currentMonthValue()}
              />
            </label>
            <p className="small muted mb-0">{monthHumanLabel(monthKey)}</p>
            <label>
              Amount (₹)
              <input
                type="number"
                min="0"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                inputMode="decimal"
              />
            </label>
            {error ? (
              <div className="banner banner--error" role="alert">
                {error}
              </div>
            ) : null}
            <div className="form-actions">
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>

          <section className="card-elevated water-bill-history glass-surface glass-panel-3d depth-card premium-chart-card motion-fade-up motion-delay-2">
            <div className="water-bill-history-head">
              <h2 className="form-section-title mb-0">Recent water bill history</h2>
              <span className="small muted">Last 5</span>
            </div>
            {recentRows.length === 0 ? (
              <p className="muted mb-0">No water bill history yet.</p>
            ) : (
              <ul className="water-bill-history-list">
                {recentRows.map((row, idx) => (
                  <li
                    key={`${row.monthKey}-${row.updatedAt || row.createdAt || idx}`}
                    className="water-bill-history-item"
                  >
                    <span className="water-bill-history-period">
                      {monthHumanLabel(row.monthKey)}
                    </span>
                    <strong className="water-bill-history-amount">
                      ₹{Number(row.amount) || 0}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
