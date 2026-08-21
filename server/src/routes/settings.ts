import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../auth.js";
import { HttpError, isHttpError } from "../httpError.js";
import { User } from "../models/User.js";
import { Settings } from "../models/Settings.js";
import {
  applySettingsOverrides,
  getEffectiveSettings,
  SETTINGS_SINGLETON_KEY,
} from "../settingsService.js";

export const settingsRouter = Router();

/** Only this username may edit global pricing config. */
const CONFIG_ADMIN_USERNAME = "keval";
const THALI_IDS = [1, 2, 3, 4, 5] as const;

settingsRouter.use(requireAuth);

async function requireConfigAdmin(req: AuthenticatedRequest) {
  const userId = req.auth?.userId;
  if (!userId) return null;
  const user = await User.findById(userId).select("username").lean();
  if (!user || user.username !== CONFIG_ADMIN_USERNAME) return null;
  return user;
}

settingsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(getEffectiveSettings());
  } catch (e) {
    next(e);
  }
});

type SettingsBody = {
  thaliPrices?: Record<string, unknown>;
  housekeeperRatePerDay?: unknown;
};

function parseNonNegNumber(raw: unknown, label: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new HttpError(400, `${label} must be a number >= 0`);
  }
  return n;
}

settingsRouter.put("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const admin = await requireConfigAdmin(req);
    if (!admin) {
      return res
        .status(403)
        .json({ error: `Only ${CONFIG_ADMIN_USERNAME} can update settings` });
    }

    const body = req.body as SettingsBody;
    const tp = (body.thaliPrices ?? {}) as Record<string, unknown>;

    let thaliPrices: Record<string, number>;
    let housekeeperRatePerDay: number;
    try {
      thaliPrices = Object.fromEntries(
        THALI_IDS.map((id) => [
          `thali${id}`,
          parseNonNegNumber(tp[String(id)], `thaliPrices.${id}`),
        ])
      );
      housekeeperRatePerDay = parseNonNegNumber(
        body.housekeeperRatePerDay,
        "housekeeperRatePerDay"
      );
    } catch (e) {
      if (isHttpError(e)) {
        return res.status(e.statusCode).json({ error: e.message });
      }
      throw e;
    }

    const row = await Settings.findOneAndUpdate(
      { singletonKey: SETTINGS_SINGLETON_KEY },
      {
        $set: {
          singletonKey: SETTINGS_SINGLETON_KEY,
          thaliPrices,
          housekeeperRatePerDay,
          updatedByUserId: admin._id,
        },
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    applySettingsOverrides({
      thaliPrices: {
        1: row?.thaliPrices?.thali1,
        2: row?.thaliPrices?.thali2,
        3: row?.thaliPrices?.thali3,
        4: row?.thaliPrices?.thali4,
        5: row?.thaliPrices?.thali5,
      },
      housekeeperRatePerDay: row?.housekeeperRatePerDay,
    });

    res.json(getEffectiveSettings());
  } catch (e) {
    next(e);
  }
});
