/**
 * Menu thali bundles: included extras per plate (must match Order page labels).
 * Prices must match server `THALI_PRICES`.
 */
function readVitePrice(key, fallback) {
  const raw = import.meta.env[key];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

export const THALI_BUNDLES = [
  { id: 1, price: readVitePrice("VITE_THALI_1_PRICE", 110), roti: 5, sabji: 2, dalRice: 1 },
  { id: 2, price: readVitePrice("VITE_THALI_2_PRICE", 110), roti: 8, sabji: 2, dalRice: 0 },
  { id: 3, price: readVitePrice("VITE_THALI_3_PRICE", 90), roti: 5, sabji: 1, dalRice: 1 },
  { id: 4, price: readVitePrice("VITE_THALI_4_PRICE", 90), roti: 5, sabji: 2, dalRice: 0 },
  { id: 5, price: readVitePrice("VITE_THALI_5_PRICE", 75), roti: 5, sabji: 1, dalRice: 0 },
];

const THALI_BUNDLE_BY_ID = new Map(THALI_BUNDLES.map((b) => [b.id, b]));

/**
 * Apply admin-configured thali prices (from `GET /api/settings`) on top of
 * the env/hardcoded defaults above. Mutates the bundle objects in place so
 * every module that already imported `THALI_BUNDLES` (order form, history,
 * optimizer) reflects the new price on its next render — no reload needed.
 */
export function applyThaliPriceOverrides(thaliPrices) {
  if (!thaliPrices || typeof thaliPrices !== "object") return;
  for (const [key, value] of Object.entries(thaliPrices)) {
    const id = Number(key);
    const bundle = THALI_BUNDLE_BY_ID.get(id);
    if (!bundle) continue;
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) {
      bundle.price = n;
    }
  }
}
