import { Router } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { mapDuplicateUserKeyError, normalizeUsername } from "../auth/username.js";
import { publicUserFromDoc } from "../auth/publicUser.js";

export const usersRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LEN = 4;

usersRouter.patch("/me/username", requireAuth, async (req, res, next) => {
  try {
    const body = req.body as { username?: unknown };
    const raw = body.username != null ? String(body.username) : "";
    if (!normalizeUsername(raw)) {
      return res.status(400).json({ error: "username is required" });
    }
    const user = await User.findById(req.auth!.userId);
    if (
      !user ||
      user.organizationId?.toString() !== req.auth!.organizationId
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    user.set("username", raw);
    await user.save();
    const lean = await User.findById(user._id).lean();
    if (!lean) return res.status(404).json({ error: "User not found" });
    const role = lean.role === "admin" ? "admin" : "member";
    const safe = await publicUserFromDoc(
      { ...lean, role },
      { includeInviteForAdmin: role === "admin" }
    );
    res.json(safe);
  } catch (e) {
    const dup = mapDuplicateUserKeyError(e);
    if (dup) return res.status(400).json({ error: dup });
    next(e);
  }
});

usersRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, username, phone, email, address, password } = req.body as {
      name?: unknown;
      username?: unknown;
      phone?: unknown;
      email?: unknown;
      address?: unknown;
      password?: unknown;
    };
    const usernameRaw = username != null ? String(username) : "";
    if (!name || !phone || !email || !normalizeUsername(usernameRaw)) {
      return res.status(400).json({
        error: "name, username, phone, and email are required",
      });
    }
    const pwd =
      password != null && typeof password === "string" ? password : "";
    if (pwd.length < MIN_PASSWORD_LEN) {
      return res.status(400).json({
        error: `password is required (min ${MIN_PASSWORD_LEN} characters)`,
      });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ error: "email must be a valid email address" });
    }
    const orgId = req.auth!.organizationId;
    const passwordHash = await bcrypt.hash(pwd, BCRYPT_ROUNDS);
    const user = await User.create({
      name: String(name).trim(),
      username: usernameRaw,
      phone: String(phone).trim(),
      email: normalizedEmail,
      address: address != null ? String(address).trim() : "",
      organizationId: orgId,
      passwordHash,
      role: "member",
    });
    res.status(201).json(user);
  } catch (e) {
    const dup = mapDuplicateUserKeyError(e);
    if (dup) return res.status(400).json({ error: dup });
    next(e);
  }
});

usersRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const orgId = req.auth!.organizationId;
    const users = await User.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .select("-passwordHash")
      .lean();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

usersRouter.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const orgId = req.auth!.organizationId;
    const id = req.params.id;
    const user = await User.findOne({
      _id: id,
      organizationId: orgId,
    })
      .select("-passwordHash")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

usersRouter.patch(
  "/:id/username",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: "invalid user id" });
      }
      const body = req.body as { username?: unknown };
      const raw = body.username != null ? String(body.username) : "";
      if (!normalizeUsername(raw)) {
        return res.status(400).json({ error: "username is required" });
      }
      const orgId = req.auth!.organizationId;
      const target = await User.findOne({
        _id: id,
        organizationId: orgId,
      });
      if (!target) {
        return res.status(404).json({ error: "User not found" });
      }
      target.set("username", raw);
      await target.save();
      const lean = await User.findById(target._id)
        .select("-passwordHash")
        .lean();
      if (!lean) return res.status(404).json({ error: "User not found" });
      res.json(lean);
    } catch (e) {
      const dup = mapDuplicateUserKeyError(e);
      if (dup) return res.status(400).json({ error: dup });
      next(e);
    }
  }
);
