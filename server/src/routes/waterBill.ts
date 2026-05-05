import { Router } from "express";
import { WaterBill } from "../models/WaterBill.js";

export const waterBillRouter = Router();

const MONTH_KEY_RE = /^\d{4}-\d{2}$/;

waterBillRouter.get("/", async (req, res, next) => {
  try {
    const raw = req.query.year;
    const year = typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: "year must be 2000–2100" });
    }
    const yStart = `${year}-01`;
    const yEnd = `${year}-12`;
    const rows = await WaterBill.find({
      monthKey: { $gte: yStart, $lte: yEnd },
    })
      .sort({ monthKey: 1 })
      .lean();
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

waterBillRouter.put("/", async (req, res, next) => {
  try {
    const body = req.body as {
      monthKey?: unknown;
      amount?: unknown;
    };
    const monthKey = typeof body.monthKey === "string" ? body.monthKey : "";
    if (!MONTH_KEY_RE.test(monthKey)) {
      return res.status(400).json({ error: "monthKey must be YYYY-MM" });
    }
    const n = typeof body.amount === "number" ? body.amount : Number(body.amount);
    if (!Number.isFinite(n) || n < 0) {
      return res.status(400).json({ error: "amount must be a number >= 0" });
    }

    const row = await WaterBill.findOneAndUpdate(
      { monthKey },
      { $set: { monthKey, amount: n } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json(row);
  } catch (e) {
    next(e);
  }
});
