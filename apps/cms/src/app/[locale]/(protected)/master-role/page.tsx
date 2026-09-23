import { getDb } from "@graffio/db";
import { roles } from "@graffio/db/schema";
import { MasterRoleClient } from "./client-page";
import { eq, count } from "drizzle-orm";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

export const metadata = {
  title: "Master Role - CMS Graffio",
  description: "Manajemen hak akses dan role sistem",
};

export default async function MasterRolePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  await requireUser(token);

  const db = getDb();

  // Fetch all roles ordered by ID
  const allRoles = await db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.roleId)],
  });

  // Calculate summary stats
  const totalRoles = allRoles.length;
  const activeRoles = allRoles.filter((r) => r.statusRole === "A").length;
  const inactiveRoles = totalRoles - activeRoles;

  return (
    <MasterRoleClient
      rolesData={allRoles}
      totalRoles={totalRoles}
      activeRoles={activeRoles}
      inactiveRoles={inactiveRoles}
    />
  );
}
