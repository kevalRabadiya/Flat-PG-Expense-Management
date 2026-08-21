import mongoose from "mongoose";

/**
 * Admin-configurable pricing, singleton document ("current").
 * A field left `null` means "not configured" — the app falls back to its
 * env/hardcoded default for that value. See `../settingsService.ts`.
 */
const thaliPricesSchema = new mongoose.Schema(
  {
    thali1: { type: Number, min: 0, default: null },
    thali2: { type: Number, min: 0, default: null },
    thali3: { type: Number, min: 0, default: null },
    thali4: { type: Number, min: 0, default: null },
    thali5: { type: Number, min: 0, default: null },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: "current",
    },
    thaliPrices: { type: thaliPricesSchema, default: () => ({}) },
    housekeeperRatePerDay: { type: Number, min: 0, default: null },
    updatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);

export const Settings = mongoose.model("Settings", settingsSchema);
