import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { hashPassword, verifyPassword } from "./password";
import { getDb } from "@graffio/db";
import { sessions, users, roles, menuPermissions, menus, authAuditLogs } from "@graffio/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";

// ============================================================================
// Session Constants
// ============================================================================

/** Absolute session lifetime: 5 hours (18000 seconds) per Instructions.md §6 */
const SESSION_MAX_AGE_MS = (Number(process.env.SESSION_MAX_AGE_SECONDS) || 18000) * 1000;

// ============================================================================
// Token Utilities
// ============================================================================

/** Generate a cryptographically secure random token */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** Hash a token for storage (SHA-256 is fine for random tokens, not passwords) */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Time-safe comparison of token hashes */
export function verifyTokenHash(token: string, storedHash: string): boolean {
  const computed = hashToken(token);
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ============================================================================
// Session Management
// ============================================================================

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
  status: string;
}

export interface SessionData {
  sessionId: number;
  user: SessionUser;
  expiresAt: Date;
}

/**
 * Create a new session for a user.
 * Revokes all existing active sessions first (single active session policy).
 * Returns the raw session token to be stored in the cookie.
 */
export async function createSession(
  userId: number,
  ipAddress?: string,
): Promise<{ token: string; expiresAt: Date }> {
  const db = getDb();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);

  // Single active session: revoke previous sessions atomically
  await db
    .update(sessions)
    .set({ revokedDate: now })
    .where(
      and(eq(sessions.userId, userId), isNull(sessions.revokedDate), gt(sessions.expiresDate, now)),
    );

  // Create new session
  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresDate: expiresAt,
    lastSeenDate: now,
  });

  // Fetch user info for audit log
  const userResult = await db
    .select({ email: users.email, roleId: users.roleId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  const userInfo = userResult[0];

  // Audit log
  await db.insert(authAuditLogs).values({
    userId,
    roleId: userInfo?.roleId,
    actorEmail: userInfo?.email,
    event: "session.created",
    ipAddress: ipAddress ?? null,
  });

  return { token, expiresAt };
}

/**
 * Validate a session token.
 * Checks: token exists, not revoked, not expired, user active.
 * Updates lastSeenAt but does NOT extend expiresAt (absolute lifetime).
 */
export async function validateSession(token: string): Promise<SessionData | null> {
  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();

  const result = await db
    .select({
      sessionId: sessions.sessionId,
      expiresAt: sessions.expiresDate,
      revokedAt: sessions.revokedDate,
      userId: users.userId,
      email: users.email,
      statusUser: users.statusUser,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.userId))
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  const session = result[0];
  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt <= now) return null;
  if (session.statusUser !== "A") return null;

  // Update lastSeenAt (NOT expiresAt — absolute lifetime)
  await db
    .update(sessions)
    .set({ lastSeenDate: now })
    .where(eq(sessions.sessionId, session.sessionId));

  return {
    sessionId: session.sessionId,
    user: {
      id: session.userId,
      email: session.email,
      displayName: session.email.split("@")[0] || "Admin",
      status: session.statusUser,
    },
    expiresAt: session.expiresAt,
  };
}

/**
 * Revoke a session (logout).
 */
export async function revokeSession(sessionId: number): Promise<void> {
  const db = getDb();
  await db
    .update(sessions)
    .set({ revokedDate: new Date() })
    .where(eq(sessions.sessionId, sessionId));
}

/**
 * Revoke all sessions for a user (password change, deactivation).
 */
export async function revokeAllSessions(userId: number): Promise<void> {
  const db = getDb();
  const now = new Date();
  await db
    .update(sessions)
    .set({ revokedDate: now })
    .where(
      and(eq(sessions.userId, userId), isNull(sessions.revokedDate), gt(sessions.expiresDate, now)),
    );
}

// ============================================================================
// Permission Checks (Server-Only)
// ============================================================================

/**
 * Get the current user from a session token. Returns null if no valid session.
 */
export async function getCurrentUser(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null;
  return validateSession(token);
}

/**
 * Require an authenticated user. Throws if not authenticated.
 */
export async function requireUser(token: string | undefined): Promise<SessionData> {
  const session = await getCurrentUser(token);
  if (!session) {
    throw new AuthError("Sesi tidak valid atau telah berakhir.", "UNAUTHORIZED");
  }
  return session;
}

/**
 * Require a specific permission. Throws if user lacks the permission.
 */
export async function requirePermission(
  token: string | undefined,
  permissionKey: string,
): Promise<SessionData> {
  const session = await requireUser(token);
  const hasPermission = await checkPermission(session.user.id, permissionKey);
  if (!hasPermission) {
    throw new AuthError("Anda tidak memiliki izin untuk operasi ini.", "FORBIDDEN");
  }
  return session;
}

/**
 * Check if a user has a specific permission via their roles.
 * Example permissionKey: 'dashboard.view', 'products.create'
 */
export async function checkPermission(userId: number, permissionKey: string): Promise<boolean> {
  const db = getDb();

  const [menuAlias, action] = permissionKey.split(".");
  if (!menuAlias || !action) return false;

  const result = await db
    .select({
      canView: menuPermissions.canView,
      canCreate: menuPermissions.canCreate,
      canUpdate: menuPermissions.canUpdate,
      canDelete: menuPermissions.canDelete,
    })
    .from(users)
    .innerJoin(menuPermissions, eq(users.roleId, menuPermissions.roleId))
    .innerJoin(menus, eq(menuPermissions.menuId, menus.menuId))
    .where(and(eq(users.userId, userId), eq(menus.menuAlias, menuAlias)))
    .limit(1);

  if (result.length === 0) return false;

  const perms = result[0]!;
  if (action === "view" && perms.canView === "Y") return true;
  if (action === "create" && perms.canCreate === "Y") return true;
  if (action === "update" && perms.canUpdate === "Y") return true;
  if (action === "delete" && perms.canDelete === "Y") return true;

  return false;
}

// ============================================================================
// Auth Error
// ============================================================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code: "UNAUTHORIZED" | "FORBIDDEN" | "RATE_LIMITED" = "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// ============================================================================
// Re-exports
// ============================================================================

export { hashPassword, verifyPassword } from "./password";
