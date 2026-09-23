"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@graffio/db";
import { menuPermissions } from "@graffio/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

type ActionState = {
  success: boolean;
  error: string | null;
};

export type PermissionUpdatePayload = {
  menuId: number;
  roleId: number;
  canView: "Y" | "N";
  canCreate: "Y" | "N";
  canUpdate: "Y" | "N";
  canDelete: "Y" | "N";
};

export async function savePermissionsAction(
  updates: PermissionUpdatePayload[],
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const db = getDb();

    await db.transaction(async (tx) => {
      for (const update of updates) {
        // Find existing record
        const existing = await tx
          .select()
          .from(menuPermissions)
          .where(
            and(
              eq(menuPermissions.roleId, update.roleId),
              eq(menuPermissions.menuId, update.menuId),
            ),
          )
          .limit(1);

        if (existing.length > 0) {
          // Update
          await tx
            .update(menuPermissions)
            .set({
              canView: update.canView,
              canCreate: update.canCreate,
              canUpdate: update.canUpdate,
              canDelete: update.canDelete,
              updatedBy: user.displayName || "System",
              updatedDate: new Date(),
            })
            .where(eq(menuPermissions.menuPermissionId, existing[0]!.menuPermissionId));
        } else {
          // Insert
          await tx.insert(menuPermissions).values({
            roleId: update.roleId,
            menuId: update.menuId,
            canView: update.canView,
            canCreate: update.canCreate,
            canUpdate: update.canUpdate,
            canDelete: update.canDelete,
            createdBy: user.displayName || "System",
            updatedBy: user.displayName || "System",
          });
        }
      }
    });

    revalidatePath("/[locale]/(protected)/master-menu-permission", "page");
    // Also revalidate layout to refresh sidebar if permissions changed
    revalidatePath("/[locale]/(protected)", "layout");

    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
