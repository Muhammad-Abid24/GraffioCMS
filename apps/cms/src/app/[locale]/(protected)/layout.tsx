import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession } from "@graffio/auth";
import { getDb, users, menus, menuPermissions } from "@graffio/db";
import { eq, and, asc } from "drizzle-orm";
import { AppLayout } from "@/components/app-layout";

/**
 * Protected layout — validates session server-side on every request.
 * This is NOT the sole auth check; individual server actions also verify permissions.
 */
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect(`/${locale}/sign-in`);
  }

  const session = await validateSession(token);

  if (!session) {
    // Session invalid/expired — redirect to sign-in.
    // We cannot delete cookies in a Server Component. The sign-in action will overwrite it.
    redirect(`/${locale}/sign-in`);
  }

  // Query dynamic menus
  const db = getDb();

  // First, find the user's roleId
  const userRecord = await db
    .select({ roleId: users.roleId })
    .from(users)
    .where(eq(users.userId, session.user.id))
    .limit(1);

  const roleId = userRecord[0]?.roleId;

  let userMenus: any[] = [];
  if (roleId) {
    const { roles } = await import("@graffio/db");

    // Check if user is Super Admin
    const roleRecord = await db
      .select({ roleName: roles.roleName })
      .from(roles)
      .where(eq(roles.roleId, roleId))
      .limit(1);

    const isSuperAdmin = roleRecord[0]?.roleName === "Super Admin";

    if (isSuperAdmin) {
      // Super admin gets all active menus
      userMenus = await db
        .select({
          menuId: menus.menuId,
          menuName: menus.menuName,
          menuAlias: menus.menuAlias,
          menuUrl: menus.menuUrl,
          menuIcon: menus.menuIcon,
          parentId: menus.parentId,
        })
        .from(menus)
        .where(eq(menus.statusMenu, "A"))
        .orderBy(asc(menus.orderMenu));
    } else {
      // Regular users need explicit permissions
      userMenus = await db
        .select({
          menuId: menus.menuId,
          menuName: menus.menuName,
          menuAlias: menus.menuAlias,
          menuUrl: menus.menuUrl,
          menuIcon: menus.menuIcon,
          parentId: menus.parentId,
        })
        .from(menus)
        .innerJoin(menuPermissions, eq(menus.menuId, menuPermissions.menuId))
        .where(
          and(
            eq(menuPermissions.roleId, roleId),
            eq(menuPermissions.canView, "Y"),
            eq(menus.statusMenu, "A"),
          ),
        )
        .orderBy(asc(menus.orderMenu));
    }
  }

  return (
    <AppLayout
      user={session.user}
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL}
      menus={userMenus}
    >
      {children}
    </AppLayout>
  );
}
