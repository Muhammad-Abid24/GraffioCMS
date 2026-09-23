import { getDb } from "./client";
import { roles, menus, menuPermissions } from "./schema";
import { eq } from "drizzle-orm";

const ROLES = [
  { roleName: "Super Admin", statusRole: "A" },
  { roleName: "Admin", statusRole: "A" },
  { roleName: "Editor", statusRole: "N" },
] as const;

const SYSTEM_MENUS = [
  {
    menuName: "Dashboard",
    menuAlias: "dashboard",
    menuUrl: "dashboard",
    menuIcon: "layout-dashboard",
    orderMenu: 0,
    statusMenu: "A",
  },
  {
    menuName: "Master",
    menuAlias: "master",
    menuUrl: "master",
    menuIcon: "master",
    orderMenu: 0,
    statusMenu: "A",
  },
  {
    menuName: "Company Profile",
    menuAlias: "company-profile",
    menuUrl: "company-profile",
    menuIcon: "building",
    orderMenu: 10,
    statusMenu: "N",
  },
  {
    menuName: "FAQ",
    menuAlias: "faq",
    menuUrl: "faq",
    menuIcon: "help-circle",
    orderMenu: 20,
    statusMenu: "N",
  },
] as const;

async function seed() {
  console.log("🌱 Seeding database...");
  const db = getDb();

  // 1. Seed roles
  for (const role of ROLES) {
    const existing = await db
      .select({ roleId: roles.roleId })
      .from(roles)
      .where(eq(roles.roleName, role.roleName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(roles).values({
        roleName: role.roleName,
        statusRole: role.statusRole,
        createdBy: "System",
      });
      console.log(`  ✅ Role: ${role.roleName}`);
    } else {
      console.log(`  ⏭️  Role: ${role.roleName} (exists)`);
    }
  }

  // 2. Seed system menus
  for (const menu of SYSTEM_MENUS) {
    const existing = await db
      .select({ menuId: menus.menuId })
      .from(menus)
      .where(eq(menus.menuAlias, menu.menuAlias))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(menus).values({
        menuName: menu.menuName,
        menuAlias: menu.menuAlias,
        menuUrl: menu.menuUrl,
        menuIcon: menu.menuIcon,
        orderMenu: menu.orderMenu,
        statusMenu: menu.statusMenu,
        createdBy: "System",
      });
      console.log(`  ✅ Menu: ${menu.menuName}`);
    } else {
      console.log(`  ⏭️  Menu: ${menu.menuName} (exists)`);
    }
  }

  // 3. Seed menu permissions
  const allRoles = await db.select().from(roles);
  const allMenus = await db.select().from(menus);

  for (const role of allRoles) {
    for (const menu of allMenus) {
      // Default to read-only for basic roles, but super admin gets everything
      let canView = "Y";
      let canCreate = "N";
      let canUpdate = "N";
      let canDelete = "N";

      if (role.roleName === "Super Admin") {
        canCreate = "Y";
        canUpdate = "Y";
        canDelete = "Y";
      } else if (role.roleName === "Admin") {
        canCreate = "Y";
        canUpdate = "Y";
      } else if (role.roleName === "Editor") {
        canUpdate = "Y"; // Editors can only update, not create or delete
      }

      await db
        .insert(menuPermissions)
        .values({
          roleId: role.roleId,
          menuId: menu.menuId,
          canView,
          canCreate,
          canUpdate,
          canDelete,
          createdBy: "System",
        })
        .onConflictDoNothing({
          target: [menuPermissions.roleId, menuPermissions.menuId],
        });
    }
  }
  console.log("  ✅ Menu permissions assigned");

  console.log("🌱 Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
