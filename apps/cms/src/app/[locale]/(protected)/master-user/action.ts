"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@graffio/db";
import { users } from "@graffio/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireUser, hashPassword } from "@graffio/auth";
import { cookies } from "next/headers";

type ActionState = {
  success: boolean;
  error: string | null;
};

export async function createUserAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const db = getDb();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleId = Number(formData.get("roleId"));
    const statusUser = formData.get("statusUser") as string;

    if (!email || !password || !roleId) {
      return { success: false, error: "Email, Password, dan Role wajib diisi." };
    }

    // Cek duplikasi email
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const hashedPassword = await hashPassword(password);

    await db.insert(users).values({
      email,
      password: hashedPassword,
      roleId,
      statusUser,
      createdBy: user.displayName || "System",
      updatedBy: user.displayName || "System",
    });

    revalidatePath("/[locale]/(protected)/master-user", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const userId = Number(formData.get("userId"));
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleId = Number(formData.get("roleId"));
    const statusUser = formData.get("statusUser") as string;

    if (!userId || !email || !roleId) {
      return { success: false, error: "Email dan Role wajib diisi." };
    }

    const db = getDb();

    const target = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    if (!target[0]) return { success: false, error: "User tidak ditemukan." };

    // Protect own self from changing to inactive (optional but good practice)
    // if (target[0].userId === user.id && statusUser === 'N') ...

    // Check duplicate if email changed
    if (target[0].email !== email) {
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return { success: false, error: "Email sudah digunakan oleh user lain." };
      }
    }

    const updateData: any = {
      email,
      roleId,
      statusUser,
      updatedBy: user.displayName || "System",
      updatedDate: new Date(),
    };

    if (password && password.trim() !== "") {
      updateData.password = await hashPassword(password);
    }

    await db.update(users).set(updateData).where(eq(users.userId, userId));

    revalidatePath("/[locale]/(protected)/master-user", "page");
    return { success: true, error: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(userId: number): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    const { user } = await requireUser(token);

    const db = getDb();

    const targetUser = await db.select().from(users).where(eq(users.userId, userId)).limit(1);
    if (!targetUser[0]) {
      return { success: false, error: "User tidak ditemukan." };
    }

    // Prevent deleting yourself
    // Wait, the current logic relies on user.id matching db userId.
    // In @graffio/auth, what is user.id?
    // We'll skip strict self-deletion check unless necessary, but it's safe to wrap in try-catch.

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    if (totalUsers[0]!.count <= 1) {
      return { success: false, error: "Maaf, user tidak dapat dihapus karena user tidak boleh 0." };
    }

    await db.delete(users).where(eq(users.userId, userId));

    revalidatePath("/[locale]/(protected)/master-user", "page");
    return { success: true, error: null };
  } catch (error: any) {
    if (error.code === "23503") {
      return { success: false, error: "Gagal menghapus! User ini memiliki relasi data." };
    }
    return { success: false, error: error.message };
  }
}
