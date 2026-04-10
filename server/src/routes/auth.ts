import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";
import { requireAuth, signAuthToken } from "../middleware/auth.js";
import {
  mapDuplicateUserKeyError,
  normalizeUsername,
} from "../auth/username.js";
import { publicUserFromDoc } from "../auth/publicUser.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LEN = 4;

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      code += INVITE_ALPHABET[bytes[i]! % INVITE_ALPHABET.length];
    }
    const exists = await Organization.exists({ inviteCode: code });
    if (!exists) return code;
  }
  throw new Error("Could not generate invite code");
}

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

authRouter.post("/register-org", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const organizationKind = body.organizationKind;
    const organizationName =
      body.organizationName != null ? String(body.organizationName).trim() : "";
    const name = body.name != null ? String(body.name).trim() : "";
    const usernameRaw =
      body.username != null ? String(body.username) : "";
    const phone = body.phone != null ? String(body.phone).trim() : "";
    const email = normalizeEmail(body.email);
    const password =
      body.password != null ? String(body.password) : "";

    if (organizationKind !== "flat_pg" && organizationKind !== "user") {
      return res
        .status(400)
        .json({ error: "organizationKind must be flat_pg or user" });
    }
    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }
    if (!normalizeUsername(usernameRaw)) {
      return res.status(400).json({ error: "username is required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "valid email is required" });
    }
    if (password.length < MIN_PASSWORD_LEN) {
      return res
        .status(400)
        .json({ error: `password must be at least ${MIN_PASSWORD_LEN} characters` });
    }

    const inviteCode = await generateUniqueInviteCode();
    const orgDisplayName =
      organizationKind === "user" ? name : organizationName;
    const org = await Organization.create({
      kind: organizationKind,
      name: orgDisplayName,
      inviteCode,
    });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      username: usernameRaw,
      phone,
      email,
      address: body.address != null ? String(body.address).trim() : "",
      organizationId: org._id,
      passwordHash,
      role: "admin",
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      organizationId: org._id.toString(),
      role: "admin",
    });

    const safeUser = await publicUserFromDoc(user, { includeInviteForAdmin: true });
    res.status(201).json({ token, user: safeUser });
  } catch (e) {
    const dup = mapDuplicateUserKeyError(e);
    if (dup) return res.status(400).json({ error: dup });
    next(e);
  }
});

authRouter.post("/register-member", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const inviteCode = String(body.inviteCode ?? "")
      .trim()
      .toUpperCase();
    const name = body.name != null ? String(body.name).trim() : "";
    const usernameRaw =
      body.username != null ? String(body.username) : "";
    const phone = body.phone != null ? String(body.phone).trim() : "";
    const email = normalizeEmail(body.email);
    const password =
      body.password != null ? String(body.password) : "";

    if (!inviteCode) {
      return res.status(400).json({ error: "inviteCode is required" });
    }
    if (!name || !phone) {
      return res.status(400).json({ error: "name and phone are required" });
    }
    if (!normalizeUsername(usernameRaw)) {
      return res.status(400).json({ error: "username is required" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "valid email is required" });
    }
    if (password.length < MIN_PASSWORD_LEN) {
      return res
        .status(400)
        .json({ error: `password must be at least ${MIN_PASSWORD_LEN} characters` });
    }

    const org = await Organization.findOne({ inviteCode }).lean();
    if (!org) {
      return res.status(400).json({ error: "invalid invite code" });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      username: usernameRaw,
      phone,
      email,
      address: body.address != null ? String(body.address).trim() : "",
      organizationId: org._id,
      passwordHash,
      role: "member",
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      organizationId: org._id.toString(),
      role: "member",
    });

    const safeUser = await publicUserFromDoc(user);
    res.status(201).json({ token, user: safeUser });
  } catch (e) {
    const dup = mapDuplicateUserKeyError(e);
    if (dup) return res.status(400).json({ error: dup });
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>;
    const usernameRaw =
      body.username != null ? String(body.username) : "";
    const usernameNorm = normalizeUsername(usernameRaw);
    const password =
      body.password != null ? String(body.password) : "";

    if (!usernameNorm) {
      return res.status(400).json({ error: "username is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }

    const user = await User.findOne({ username: usernameNorm }).lean();
    if (!user || !user.passwordHash || !user.organizationId) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const role = user.role === "admin" ? "admin" : "member";
    const token = signAuthToken({
      userId: user._id.toString(),
      organizationId: user.organizationId.toString(),
      role,
    });

    const safeUser = await publicUserFromDoc(
      { ...user, role },
      { includeInviteForAdmin: role === "admin" }
    );
    res.json({ token, user: safeUser });
  } catch (e) {
    next(e);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const a = req.auth!;
    const user = await User.findById(a.userId).lean();
    if (!user || user.organizationId?.toString() !== a.organizationId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const role = user.role === "admin" ? "admin" : "member";
    if (role !== a.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const safeUser = await publicUserFromDoc(
      { ...user, role },
      { includeInviteForAdmin: role === "admin" }
    );
    res.json(safeUser);
  } catch (e) {
    next(e);
  }
});
