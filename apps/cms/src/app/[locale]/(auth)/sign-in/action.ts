"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@graffio/validation";
import { verifyPassword, createSession, hashToken } from "@graffio/auth";
import { getDb, users } from "@graffio/db";
import { eq, and } from "drizzle-orm";

interface SignInState {
  error: string | null;
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  // 1. Validate input with Zod
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Email atau password tidak valid." };
  }

  const { email, password } = parsed.data;

  try {
    const db = getDb();

    // Get IP Address
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;

    // 2. Find user by email (normalized/lowercased in Zod transform)
    const result = await db
      .select({
        id: users.userId,
        email: users.email,
        status: users.statusUser,
        passwordHash: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = result[0];

    // 3. Generic error response for user not found (prevent enumeration)
    if (!user) {
      return { error: "Email atau password tidak valid." };
    }

    // 4. Generic error for inactive user (same message to prevent enumeration)
    if (user.status !== "A") {
      return { error: "Email atau password tidak valid." };
    }

    // 5. Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Email atau password tidak valid." };
    }

    // 6. Create session (revokes previous sessions atomically)
    const session = await createSession(user.id, ipAddress || undefined);

    // 7. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
      // No 'domain' option = host-only cookie per Instructions.md §6
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  // 8. Redirect to dashboard (absolute path to avoid _rsc query bug)
  // The middleware will automatically prefix the default or current locale.
  redirect("/dashboard");
}
