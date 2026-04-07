import { Router } from "express";
import { User } from "../models/User.js";

export const usersRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

usersRouter.post("/", async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body as {
      name?: unknown;
      phone?: unknown;
      email?: unknown;
      address?: unknown;
    };
    if (!name || !phone || !email) {
      return res.status(400).json({ error: "name, phone, and email are required" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ error: "email must be a valid email address" });
    }
    const user = await User.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: normalizedEmail,
      address: address != null ? String(address).trim() : "",
    });
    res.status(201).json(user);
  } catch (e) {
    if (
      typeof e === "object" &&
      e != null &&
      "code" in e &&
      (e as { code?: unknown }).code === 11000
    ) {
      return res.status(400).json({ error: "email already exists" });
    }
    next(e);
  }
});

usersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    next(e);
  }
});

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    next(e);
  }
});
