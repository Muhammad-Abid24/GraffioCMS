import { getTranslations } from "next-intl/server";
import { getDb, menus } from "@graffio/db";
import { asc } from "drizzle-orm";
import { MasterMenuClient } from "./client-page";

export default async function MasterMenuPage() {
  const t = await getTranslations("master-menu");
  const db = getDb();

  // Fetch all menus ordered by parentId (nulls first) and orderMenu
  const allMenus = await db.select().from(menus).orderBy(asc(menus.parentId), asc(menus.orderMenu));

  const totalMenus = allMenus.length;
  const activeMenus = allMenus.filter((m) => m.statusMenu === "A").length;
  const inactiveMenus = totalMenus - activeMenus;

  // Build tree hierarchy
  const rootMenus = allMenus.filter((m) => !m.parentId);
  const childMenus = allMenus.filter((m) => m.parentId);

  const menuTree = rootMenus.map((root, index) => ({
    ...root,
    displayOrder: index + 1,
    children: childMenus
      .filter((child) => child.parentId === root.menuId)
      .map((child, cIndex) => ({
        ...child,
        displayOrder: `${index + 1}.${cIndex + 1}`,
      })),
  }));

  return (
    <MasterMenuClient
      menuTree={menuTree}
      rootMenus={rootMenus}
      totalMenus={totalMenus}
      activeMenus={activeMenus}
      inactiveMenus={inactiveMenus}
    />
  );
}
