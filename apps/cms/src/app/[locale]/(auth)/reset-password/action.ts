"use server";

import { headers } from "next/headers";
import { resetPasswordSchema } from "@graffio/validation";
import { hashPassword, hashToken, revokeAllSessions } from "@graffio/auth";
import { getDb, authTokens, users, authAuditLogs } from "@graffio/db";
import { eq, and, isNull } from "drizzle-orm";

interface ResetPasswordState {
  success: boolean;
  error: string | null;
}

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Input tidak valid.";
    return { success: false, error: firstError };
  }

  const { token, password } = parsed.data;

  try {
    const db = getDb();
    const tokenHash = hashToken(token);
    const now = new Date();

    // Get IP Address
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;

    // Find valid, unused, non-expired token
    const result = await db
      .select({
        id: authTokens.authTokenId,
        userId: authTokens.userId,
        expiresAt: authTokens.expiresDate,
      })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.tokenHash, tokenHash),
          eq(authTokens.purpose, "password_reset"),
          isNull(authTokens.usedDate),
        ),
      )
      .limit(1);

    const tokenRecord = result[0];

    if (!tokenRecord || tokenRecord.expiresAt <= now) {
      return {
        success: false,
        error: "Token tidak valid atau sudah kedaluwarsa.",
      };
    }

    // Mark token as used
    await db
      .update(authTokens)
      .set({ usedDate: now })
      .where(eq(authTokens.authTokenId, tokenRecord.id));

    // Hash new password
    const newHash = await hashPassword(password);

    // Update password
    await db
      .update(users)
      .set({
        password: newHash,
      })
      .where(eq(users.userId, tokenRecord.userId));

    // Revoke all sessions per Instructions.md §6
    await revokeAllSessions(tokenRecord.userId);

    // Fetch user for audit log
    const userResult = await db
      .select({ email: users.email, roleId: users.roleId })
      .from(users)
      .where(eq(users.userId, tokenRecord.userId))
      .limit(1);

    const userInfo = userResult[0];

    // Audit log
    await db.insert(authAuditLogs).values({
      userId: tokenRecord.userId,
      roleId: userInfo?.roleId,
      actorEmail: userInfo?.email,
      event: "password.reset",
      ipAddress,
    });

    return { success: true, error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
