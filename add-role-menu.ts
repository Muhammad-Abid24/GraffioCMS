import { getDb } from "./packages/db/src/index.ts";
import { menus, menuPermissions, roles } from "./packages/db/src/schema/auth.ts";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  // Find "master" root menu
  const masterRoot = await db.query.menus.findFirst({
    where: eq(menus.menuAlias, "master"),
  });

  if (!masterRoot) {
    console.log("Master root menu not found.");
    return;
  }

  // Insert Master Role
  const [roleMenu] = await db
    .insert(menus)
    .values({
      menuName: "Master Role",
      menuAlias: "master-role",
      menuUrl: "master-role",
      menuIcon: "users",
      parentId: masterRoot.menuId,
      displayOrder: "2", // Master Menu is 1
      orderMenu: 20,
      statusMenu: "A",
    })
    .returning();

  // Find Super Admin role
  const superAdmin = await db.query.roles.findFirst({
    where: eq(roles.roleName, "Super Admin"),
  });

  if (superAdmin) {
    await db.insert(menuPermissions).values({
      menuId: roleMenu.menuId,
      roleId: superAdmin.roleId,
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    });
  }

  console.log("Successfully added Master Role menu!");
  process.exit(0);
}

main().catch(console.error);
