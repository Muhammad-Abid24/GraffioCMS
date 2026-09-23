"use server";

import { revalidatePath } from "next/cache";
import { getDb, menus, menuPermissions, users } from "@graffio/db";
import { eq } from "drizzle-orm";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

interface ActionState {
  success: boolean;
  error: string | null;
}

export async function createMenuAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const menuName = formData.get("menuName") as string;
    const menuAlias = formData.get("menuAlias") as string;
    const menuUrl = formData.get("menuUrl") as string;
    const menuIcon = formData.get("menuIcon") as string;
    const parentIdStr = formData.get("parentId") as string;
    const orderMenuStr = formData.get("orderMenu") as string;
    const statusMenu = formData.get("statusMenu") as string;

    if (!menuName || !menuAlias) {
      return { success: false, error: "Menu Name and Alias are required" };
    }

    const db = getDb();

    // Get user's roleId
    const userRecord = await db
      .select({ roleId: users.roleId })
      .from(users)
      .where(eq(users.userId, user.id))
      .limit(1);
    const roleId = userRecord[0]?.roleId;

    const insertedMenu = await db
      .insert(menus)
      .values({
        menuName,
        menuAlias,
        menuUrl: menuUrl || null,
        menuIcon: menuIcon || null,
        parentId: parentIdStr && parentIdStr !== "none" ? parseInt(parentIdStr, 10) : null,
        orderMenu: orderMenuStr ? parseInt(orderMenuStr, 10) : 0,
        statusMenu: statusMenu === "A" ? "A" : "N",
        createdBy: user.displayName || "System",
      })
      .returning({ menuId: menus.menuId });

    if (insertedMenu[0] && roleId) {
      // Grant permission to the user's role so it appears in their sidebar
      await db.insert(menuPermissions).values({
        roleId,
        menuId: insertedMenu[0].menuId,
        canView: "Y",
        canCreate: "Y",
        canUpdate: "Y",
        canDelete: "Y",
        createdBy: user.displayName || "System",
      });
    }

    revalidatePath("/[locale]/(protected)/master-menu", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMenuAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const menuIdStr = formData.get("menuId") as string;
    const menuName = formData.get("menuName") as string;
    const menuAlias = formData.get("menuAlias") as string;
    const menuUrl = formData.get("menuUrl") as string;
    const menuIcon = formData.get("menuIcon") as string;
    const parentIdStr = formData.get("parentId") as string;
    const orderMenuStr = formData.get("orderMenu") as string;
    const statusMenu = formData.get("statusMenu") as string;

    if (!menuIdStr || !menuName || !menuAlias) {
      return { success: false, error: "Menu ID, Name, and Alias are required" };
    }

    const menuId = parseInt(menuIdStr, 10);
    const db = getDb();

    await db
      .update(menus)
      .set({
        menuName,
        menuAlias,
        menuUrl: menuUrl || null,
        menuIcon: menuIcon || null,
        parentId: parentIdStr && parentIdStr !== "none" ? parseInt(parentIdStr, 10) : null,
        orderMenu: orderMenuStr ? parseInt(orderMenuStr, 10) : 0,
        statusMenu: statusMenu === "A" ? "A" : "N",
        updatedBy: user.displayName || "System",
        updatedDate: new Date(),
      })
      .where(eq(menus.menuId, menuId));

    revalidatePath("/[locale]/(protected)/master-menu", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMenuAction(menuId: number): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    await requireUser(token);

    const db = getDb();

    // Check if menu is protected
    const targetMenu = await db.select().from(menus).where(eq(menus.menuId, menuId)).limit(1);
    const menu = targetMenu[0];

    if (!menu) {
      return { success: false, error: "Menu not found." };
    }

    // Check if it's a protected root menu
    const isProtectedRoot = ["dashboard", "master"].includes(menu.menuAlias);

    // Check if it's a child of a protected root menu
    let isProtectedChild = false;
    if (menu.parentId) {
      const parent = await db.select().from(menus).where(eq(menus.menuId, menu.parentId)).limit(1);
      if (parent[0] && ["dashboard", "master"].includes(parent[0].menuAlias)) {
        isProtectedChild = true;
      }
    }

    if (isProtectedRoot || isProtectedChild) {
      return {
        success: false,
        error:
          "maaf, menu utama tidak dapat dihapus, menu ini sangat krusial dan akan mempengaruhi proses sistem",
      };
    }

    // First, delete any permissions associated with this menu
    await db.delete(menuPermissions).where(eq(menuPermissions.menuId, menuId));

    // Attempt delete. If it has children, the foreign key constraint will fail,
    // which is standard safety. (Or we can catch and return friendly error).
    await db.delete(menus).where(eq(menus.menuId, menuId));

    revalidatePath("/[locale]/(protected)/master-menu", "page");
    return { success: true, error: null };
  } catch (error: any) {
    // Handle FK violation for children
    if (error.code === "23503") {
      return { success: false, error: "Cannot delete this menu because it has child menus." };
    }
    return { success: false, error: error.message };
  }
}
export async function reorderMenusAction(
  updates: { menuId: number; orderMenu: number }[],
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const db = getDb();

    // Perform updates in a transaction for safety
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(menus)
          .set({
            orderMenu: update.orderMenu,
            updatedBy: user.displayName || "System",
            updatedDate: new Date(),
          })
          .where(eq(menus.menuId, update.menuId));
      }
    });

    revalidatePath("/[locale]/(protected)/master-menu", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
