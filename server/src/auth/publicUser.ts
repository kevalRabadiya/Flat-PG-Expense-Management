import { Organization } from "../models/Organization.js";

export async function publicUserFromDoc(
  user: {
    _id: { toString: () => string };
    name: string;
    username?: string;
    phone?: string;
    role?: string;
    organizationId?: unknown;
  },
  opts?: { includeInviteForAdmin?: boolean }
) {
  const orgId = user.organizationId
    ? String(
        typeof user.organizationId === "object" &&
          user.organizationId !== null &&
          "toString" in user.organizationId
          ? (user.organizationId as { toString: () => string }).toString()
          : user.organizationId
      )
    : "";
  const org = orgId
    ? await Organization.findById(orgId).lean()
    : null;
  const orgNameRaw = org?.name != null ? String(org.name).trim() : "";
  const usernameRaw =
    user.username != null ? String(user.username).trim() : "";
  const base = {
    _id: user._id.toString(),
    name: user.name,
    username: usernameRaw,
    phone: user.phone ?? "",
    role: user.role === "admin" ? "admin" : "member",
    organizationId: orgId,
    organizationKind: org?.kind ?? null,
    organizationName: orgNameRaw,
  };
  if (
    opts?.includeInviteForAdmin &&
    user.role === "admin" &&
    org?.inviteCode
  ) {
    return { ...base, inviteCode: org.inviteCode };
  }
  return base;
}
