import { Settings } from "./models/Settings.js";
import { applyThaliPriceOverrides, getEffectiveThaliPrices } from "./pricing.js";

export const SETTINGS_SINGLETON_KEY = "current";

function readNonNegEnvNumber(key: string, fallback: number): number {
  const raw = process.env[key];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

const FALLBACK_HOUSEKEEPER_RATE_PER_DAY = readNonNegEnvNumber(
  "HOUSEKEEPER_RATE_PER_DAY",
  0
);

/** Mutable runtime value; updated in place so the effect is immediate app-wide. */
let housekeeperRatePerDay = FALLBACK_HOUSEKEEPER_RATE_PER_DAY;

export type EffectiveSettings = {
  thaliPrices: Record<number, number>;
  housekeeperRatePerDay: number;
};

export type SettingsOverrideInput = {
  thaliPrices?: Partial<Record<number, number | null | undefined>>;
  housekeeperRatePerDay?: number | null;
};

/** Apply admin-configured overrides on top of env/hardcoded fallbacks. */
export function applySettingsOverrides(input: SettingsOverrideInput): void {
  if (input.thaliPrices) {
    applyThaliPriceOverrides(input.thaliPrices);
  }
  if (input.housekeeperRatePerDay == null) {
    housekeeperRatePerDay = FALLBACK_HOUSEKEEPER_RATE_PER_DAY;
    return;
  }
  const n = Number(input.housekeeperRatePerDay);
  housekeeperRatePerDay =
    Number.isFinite(n) && n >= 0 ? n : FALLBACK_HOUSEKEEPER_RATE_PER_DAY;
}

export function getEffectiveSettings(): EffectiveSettings {
  return {
    thaliPrices: getEffectiveThaliPrices(),
    housekeeperRatePerDay,
  };
}

/** Hydrate runtime pricing from the DB singleton at server boot. */
export async function loadSettingsFromDb(): Promise<void> {
  const row = await Settings.findOne({
    singletonKey: SETTINGS_SINGLETON_KEY,
  }).lean();
  if (!row) return;
  applySettingsOverrides({
    thaliPrices: {
      1: row.thaliPrices?.thali1,
      2: row.thaliPrices?.thali2,
      3: row.thaliPrices?.thali3,
      4: row.thaliPrices?.thali4,
      5: row.thaliPrices?.thali5,
    },
    housekeeperRatePerDay: row.housekeeperRatePerDay,
  });
}
