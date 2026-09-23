"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession, revokeSession } from "@graffio/auth";

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    const session = await validateSession(token);
    if (session) {
      await revokeSession(session.sessionId);
    }
    cookieStore.delete("session_token");
  }

  redirect("/");
}
