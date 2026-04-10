import mongoose from "mongoose";

const monthKeyRe = /^\d{4}-\d{2}$/;

const lightBillSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    fromMonthKey: {
      type: String,
      required: true,
      match: monthKeyRe,
      index: true,
    },
    toMonthKey: {
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

lightBillSchema.index(
  { organizationId: 1, fromMonthKey: 1, toMonthKey: 1 },
  { unique: true }
);

export const LightBill = mongoose.model("LightBill", lightBillSchema);
