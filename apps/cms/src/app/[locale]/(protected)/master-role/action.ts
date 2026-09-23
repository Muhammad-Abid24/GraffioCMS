"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@graffio/db";
import { roles, users, menuPermissions } from "@graffio/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@graffio/auth";
import { cookies } from "next/headers";

type ActionState = {
  success: boolean;
  error: string | null;
};

export async function createRoleAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const db = getDb();

    const roleName = formData.get("roleName") as string;
    const statusRole = formData.get("statusRole") as string;

    if (!roleName) {
      return { success: false, error: "Nama Role wajib diisi." };
    }

    // Cek duplikasi
    const existing = await db.select().from(roles).where(eq(roles.roleName, roleName)).limit(1);
    if (existing.length > 0) {
      return { success: false, error: "Nama Role sudah ada." };
    }

    await db.insert(roles).values({
      roleName,
      statusRole,
      createdBy: user.displayName || "System",
      updatedBy: user.displayName || "System",
    });

    revalidatePath("/[locale]/(protected)/master-role", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateRoleAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const roleId = Number(formData.get("roleId"));
    const roleName = formData.get("roleName") as string;
    const statusRole = formData.get("statusRole") as string;

    if (!roleId || !roleName) {
      return { success: false, error: "ID dan Nama Role wajib diisi." };
    }

    const db = getDb();

    // Protect Super Admin edit
    const target = await db.select().from(roles).where(eq(roles.roleId, roleId)).limit(1);
    if (!target[0]) return { success: false, error: "Role tidak ditemukan." };

    if (target[0].roleName === "Super Admin" && roleName !== "Super Admin") {
      return { success: false, error: "Nama Super Admin tidak boleh diubah." };
    }

    // Check duplicate if name changed
    if (target[0].roleName !== roleName) {
      const existing = await db.select().from(roles).where(eq(roles.roleName, roleName)).limit(1);
      if (existing.length > 0) {
        return { success: false, error: "Nama Role sudah digunakan." };
      }
    }

    await db
      .update(roles)
      .set({
        roleName,
        statusRole,
        updatedBy: user.displayName || "System",
        updatedDate: new Date(),
      })
      .where(eq(roles.roleId, roleId));

    revalidatePath("/[locale]/(protected)/master-role", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteRoleAction(roleId: number): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    await requireUser(token);

    const db = getDb();

    const targetRole = await db.select().from(roles).where(eq(roles.roleId, roleId)).limit(1);
    if (!targetRole[0]) {
      return { success: false, error: "Role tidak ditemukan." };
    }

    if (targetRole[0].roleName === "Super Admin") {
      return {
        success: false,
        error: "Maaf, role utama (Super Admin) tidak dapat dihapus, role ini sangat krusial.",
      };
    }

    // Safety cascade manual (permissions)
    await db.delete(menuPermissions).where(eq(menuPermissions.roleId, roleId));

    // Delete role (will fail if users are attached due to FK)
    await db.delete(roles).where(eq(roles.roleId, roleId));

    revalidatePath("/[locale]/(protected)/master-role", "page");
    return { success: true, error: null };
  } catch (error: any) {
    if (error.code === "23503") {
      return { success: false, error: "Gagal menghapus! Role ini sedang digunakan oleh User." };
    }
    return { success: false, error: error.message };
  }
}
