import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export type AuthPayload = {
  userId: string;
  organizationId: string;
  role: "admin" | "member";
};

const JWT_SECRET_ENV = "JWT_SECRET";

export function getJwtSecret(): string {
  const s = process.env[JWT_SECRET_ENV];
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${JWT_SECRET_ENV} must be set (min 16 chars) in production`);
  }
  return "dev-only-jwt-secret-min-16ch";
}

export function signAuthToken(payload: AuthPayload): string {
  return jwt.sign(
    {
      sub: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role,
    },
    getJwtSecret(),
    { algorithm: "HS256" }
  );
}

export function verifyAuthToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
  const userId = decoded.sub;
  const organizationId = decoded.organizationId;
  const role = decoded.role;
  if (
    typeof userId !== "string" ||
    typeof organizationId !== "string" ||
    (role !== "admin" && role !== "member")
  ) {
    throw new Error("Invalid token payload");
  }
  return { userId, organizationId, role };
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const raw = req.headers.authorization;
  const token =
    typeof raw === "string" && raw.startsWith("Bearer ")
      ? raw.slice(7).trim()
      : "";
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.auth = verifyAuthToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.auth.role !== "admin") {
    res.status(403).json({ error: "Admin only" });
    return;
  }
  next();
};
