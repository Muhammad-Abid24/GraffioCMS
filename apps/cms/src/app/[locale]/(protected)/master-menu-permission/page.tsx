import { getDb } from "@graffio/db";
import { roles, menus, menuPermissions } from "@graffio/db/schema";
import { MasterMenuPermissionClient } from "./client-page";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

export const metadata = {
  title: "Menu Permission - CMS Graffio",
  description: "Manajemen hak akses role ke menu",
};

export default async function MasterMenuPermissionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  await requireUser(token);

  const db = getDb();

  // Fetch all roles
  const allRoles = await db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.roleId)],
  });

  // Fetch all menus (filter out those that shouldn't have permissions like very top-level wrappers if necessary,
  // but usually we want to see all of them)
  const allMenus = await db.query.menus.findMany({
    orderBy: (menus, { asc }) => [asc(menus.orderMenu)],
  });

  // Fetch all existing permissions
  const allPermissions = await db.query.menuPermissions.findMany();

  return (
    <MasterMenuPermissionClient
      rolesData={allRoles}
      menusData={allMenus}
      initialPermissions={allPermissions}
    />
  );
}
