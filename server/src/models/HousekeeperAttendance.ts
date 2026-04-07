import mongoose from "mongoose";

const housekeeperAttendanceSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      unique: true,
      index: true,
    },
    present: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const HousekeeperAttendance = mongoose.model(
  "HousekeeperAttendance",
  housekeeperAttendanceSchema
);

