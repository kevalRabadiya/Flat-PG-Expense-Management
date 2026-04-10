import { Router } from "express";
import { HousekeeperAttendance } from "../models/HousekeeperAttendance.js";
import { requireAuth } from "../middleware/auth.js";

export const housekeeperRouter = Router();

function todayDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(value: unknown, fallback: string) {
  const s = value != null ? String(value).slice(0, 10) : fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error("date must be YYYY-MM-DD");
  }
  return s;
}

housekeeperRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const orgId = req.auth!.organizationId;
    const q = req.query as Record<string, unknown>;
    const today = todayDateKey();
    let from: string;
    let to: string;
    try {
      from = parseDateKey(q.from, today);
      to = parseDateKey(q.to, from);
    } catch {
      return res.status(400).json({ error: "from and to must be YYYY-MM-DD" });
    }
    if (from > to) {
      return res.status(400).json({ error: "from must be on or before to" });
    }
    const rows = await HousekeeperAttendance.find({
      organizationId: orgId,
      dateKey: { $gte: from, $lte: to },
      present: true,
    })
      .sort({ dateKey: 1 })
      .lean();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

housekeeperRouter.put("/:dateKey", requireAuth, async (req, res, next) => {
  try {
    const orgId = req.auth!.organizationId;
    const { dateKey } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey))) {
      return res.status(400).json({ error: "dateKey must be YYYY-MM-DD" });
    }
    const { present } = req.body as { present?: unknown };
    if (typeof present !== "boolean") {
      return res.status(400).json({ error: "present must be boolean" });
    }

    if (!present) {
      await HousekeeperAttendance.deleteOne({ organizationId: orgId, dateKey });
      return res.json({ dateKey, present: false });
    }

    const row = await HousekeeperAttendance.findOneAndUpdate(
      { organizationId: orgId, dateKey },
      { $set: { organizationId: orgId, dateKey, present: true } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json(row);
  } catch (e) {
    next(e);
  }
});

