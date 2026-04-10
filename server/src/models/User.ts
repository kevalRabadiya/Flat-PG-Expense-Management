import mongoose from "mongoose";
import { normalizeUsername } from "../auth/username.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    // Legacy compatibility: some DBs still have a unique loginName index.
    // Keep it mirrored to username so writes don't fail with duplicate null.
    loginName: {
      type: String,
      trim: true,
      lowercase: true,
      select: false,
    },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    address: { type: String, trim: true, default: "" },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      default: null,
    },
    passwordHash: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Must run before validation: normalize `username` (login identity).
userSchema.pre("validate", function (next) {
  const doc = this as unknown as {
    name: string;
    username: string;
    loginName?: string;
  };
  doc.name = String(doc.name ?? "").trim();
  doc.username = normalizeUsername(String(doc.username ?? ""));
  doc.loginName = doc.username;
  next();
});

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const o = ret as Record<string, unknown>;
    delete o.passwordHash;
    return o;
  },
});

export const User = mongoose.model("User", userSchema);
