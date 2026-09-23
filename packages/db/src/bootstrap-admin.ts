/**
 * Bootstrap admin user script.
 * Reads email and password from environment variables or stdin.
 * Creates a Super Admin user with the given credentials.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepassword123 tsx src/bootstrap-admin.ts
 *
 * This script is meant to be run once. It does NOT commit any default
 * credentials to the codebase. Per Instructions.md §5.
 */

import { getDb } from "./client";
import { users, roles } from "./schema";
import { eq } from "drizzle-orm";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// We need to import from @graffio/auth but during bootstrap it may not
// be resolved via workspaces. Use a direct import path.
import { hashPassword } from "@graffio/auth";

async function getInput(prompt: string, isSecret = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(prompt);
  rl.close();
  return answer.trim();
}

async function bootstrap() {
  let email = process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;

  if (!email) {
    email = await getInput("Admin email: ");
  }
  if (!password) {
    password = await getInput("Admin password (min 8 chars): ");
  }

  if (!email || !password || password.length < 8) {
    console.error("❌ Email and password (min 8 chars) are required.");
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const db = getDb();

  // Check if user already exists
  const existing = await db
    .select({ userId: users.userId })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log(`⏭️  User ${normalizedEmail} already exists.`);
    process.exit(0);
  }

  // Find Super Admin role
  const roleResult = await db
    .select({ roleId: roles.roleId })
    .from(roles)
    .where(eq(roles.roleName, "Super Admin"))
    .limit(1);

  if (roleResult.length === 0) {
    console.error("❌ Super Admin role not found. Run db:seed first.");
    process.exit(1);
  }

  const superAdminRoleId = roleResult[0]!.roleId;

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  await db.insert(users).values({
    email: normalizedEmail,
    password: passwordHash,
    roleId: superAdminRoleId,
    statusUser: "A",
    createdBy: "System",
  });

  console.log(`✅ Admin user created: ${normalizedEmail}`);
  console.log("   You can now sign in at the CMS.");

  // Clear password from memory
  password = "";
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap failed:", err);
  process.exit(1);
});
