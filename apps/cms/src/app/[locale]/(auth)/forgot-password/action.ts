"use server";

import { headers } from "next/headers";
import { forgotPasswordSchema } from "@graffio/validation";
import { generateToken, hashToken } from "@graffio/auth";
import { getDb, users, authTokens, authAuditLogs } from "@graffio/db";
import { eq } from "drizzle-orm";

interface ForgotPasswordState {
  success: boolean;
  error: string | null;
}

/** Token TTL: 30 minutes (configurable) */
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export async function forgotPasswordAction(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const raw = { email: formData.get("email") };
  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    // Generic response to prevent email enumeration
    return { success: true, error: null };
  }

  const { email } = parsed.data;

  try {
    const db = getDb();

    // Get IP Address
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;

    // Find user — always return success to prevent enumeration
    const result = await db
      .select({ id: users.userId, roleId: users.roleId, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    if (user) {
      // Generate reset token
      const token = generateToken();
      const tokenH = hashToken(token);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await db.insert(authTokens).values({
        userId: user.id,
        purpose: "password_reset",
        tokenHash: tokenH,
        expiresDate: expiresAt,
      });

      // Audit log (no token/password in log)
      await db.insert(authAuditLogs).values({
        userId: user.id,
        roleId: user.roleId,
        actorEmail: user.email,
        event: "password_reset.requested",
        ipAddress,
      });

      // TODO: Send email with reset link when mail provider configured
      // For dev: log token to console (never in production!)
      if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Reset token for ${email}: ${token}`);
        console.log(`[DEV] Reset link: /reset-password?token=${token}`);
      }
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return success to prevent enumeration
  }

  return { success: true, error: null };
}
