import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      required: true,
      enum: ["flat_pg", "user"],
    },
    name: { type: String, trim: true, default: "" },
    inviteCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export const Organization = mongoose.model("Organization", organizationSchema);
