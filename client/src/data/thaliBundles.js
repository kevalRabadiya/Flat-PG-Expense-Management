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
