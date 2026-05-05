import mongoose from "mongoose";

const monthKeyRe = /^\d{4}-\d{2}$/;

const waterBillSchema = new mongoose.Schema(
  {
    monthKey: {
      type: String,
      required: true,
      match: monthKeyRe,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true, versionKey: false }
);

waterBillSchema.index({ monthKey: 1 }, { unique: true });

export const WaterBill = mongoose.model("WaterBill", waterBillSchema);
