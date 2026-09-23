import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@graffio/auth";

/**
 * Auth route group layout.
 * These pages (sign-in, forgot-password, reset-password) are accessible
 * without authentication. Centered card layout.
 * If user is already authenticated, redirect them to dashboard.
 */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (token) {
    const session = await validateSession(token);
    if (session) {
      redirect(`/${locale}/dashboard`);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  );
}
