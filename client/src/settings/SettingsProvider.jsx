import { useCallback, useEffect, useMemo, useState } from "react";
import { getSettings } from "../api.js";
import { applyThaliPriceOverrides, THALI_BUNDLES } from "../data/thaliBundles.js";
import { SettingsContext } from "./settingsContext.js";

function readVitePrice(key, fallback) {
  const raw = import.meta.env[key];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

const DEFAULT_HOUSEKEEPER_RATE_PER_DAY = readVitePrice(
  "VITE_HOUSEKEEPER_RATE_PER_DAY",
  0
);

function thaliPricesSnapshot() {
  return Object.fromEntries(THALI_BUNDLES.map((b) => [b.id, b.price]));
}

/**
 * App-wide config (thali prices + HouseKeeper rate). Loaded from
 * `GET /api/settings` once authenticated, and refreshed whenever the config
 * page (username `keval` only) saves a change — so every page that reads
 * `THALI_BUNDLES` or `housekeeperRatePerDay` reflects the DB value without a
 * page reload.
 */
export function SettingsProvider({ isAuthenticated, children }) {
  const [housekeeperRatePerDay, setHousekeeperRatePerDay] = useState(
    DEFAULT_HOUSEKEEPER_RATE_PER_DAY
  );
  const [thaliPrices, setThaliPrices] = useState(thaliPricesSnapshot);
  const [loaded, setLoaded] = useState(false);

  const applySettings = useCallback((data) => {
    if (!data) return;
    if (data.thaliPrices) {
      applyThaliPriceOverrides(data.thaliPrices);
      setThaliPrices(thaliPricesSnapshot());
    }
    const rate = Number(data.housekeeperRatePerDay);
    if (Number.isFinite(rate) && rate >= 0) {
      setHousekeeperRatePerDay(rate);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      applySettings(data);
      return data;
    } catch {
      // Keep whatever defaults/last-known values are already loaded.
      return null;
    } finally {
      setLoaded(true);
    }
  }, [applySettings]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshSettings();
  }, [isAuthenticated, refreshSettings]);

  const value = useMemo(
    () => ({
      housekeeperRatePerDay,
      thaliPrices,
      loaded,
      refreshSettings,
      applySettings,
    }),
    [housekeeperRatePerDay, thaliPrices, loaded, refreshSettings, applySettings]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
