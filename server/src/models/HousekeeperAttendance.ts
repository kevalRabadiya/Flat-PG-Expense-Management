import mongoose from "mongoose";

const housekeeperAttendanceSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },
    present: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, versionKey: false }
);

housekeeperAttendanceSchema.index(
  { organizationId: 1, dateKey: 1 },
  { unique: true }
);

export const HousekeeperAttendance = mongoose.model(
  "HousekeeperAttendance",
  housekeeperAttendanceSchema
);

