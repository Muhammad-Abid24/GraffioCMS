import { getDb } from "@graffio/db";
import { users, roles } from "@graffio/db/schema";
import { MasterUserClient } from "./client-page";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

export const metadata = {
  title: "Master User - CMS Graffio",
  description: "Manajemen data pengguna",
};

export default async function MasterUserPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  await requireUser(token);

  const db = getDb();

  // Fetch all users ordered by ID
  const allUsers = await db.query.users.findMany({
    orderBy: (users, { asc }) => [asc(users.userId)],
  });

  // Fetch all roles to map role IDs to names
  const allRoles = await db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.roleId)],
  });

  // Calculate summary stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.statusUser === "A").length;
  const inactiveUsers = totalUsers - activeUsers;

  return (
    <MasterUserClient
      usersData={allUsers}
      rolesData={allRoles}
      totalUsers={totalUsers}
      activeUsers={activeUsers}
      inactiveUsers={inactiveUsers}
    />
  );
}
