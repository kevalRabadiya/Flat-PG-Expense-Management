/** Normalized login username: trim + lowercase (globally unique in DB). */
export function normalizeUsername(value: string): string {
  return String(value).trim().toLowerCase();
}

export function mapDuplicateUserKeyError(err: unknown): string | null {
  if (typeof err !== "object" || err === null) return null;
  const code = (err as { code?: unknown }).code;
  if (code !== 11000) return null;
  const keyPattern = (err as { keyPattern?: Record<string, unknown> }).keyPattern;
  if (keyPattern && "username" in keyPattern) return "username already taken";
  if (keyPattern && "loginName" in keyPattern) return "username already taken";
  if (keyPattern && "email" in keyPattern) return "email already exists";
  const keyValue = (err as { keyValue?: Record<string, unknown> }).keyValue;
  if (keyValue && "username" in keyValue) return "username already taken";
  if (keyValue && "loginName" in keyValue) return "username already taken";
  if (keyValue && "email" in keyValue) return "email already exists";
  return null;
}
