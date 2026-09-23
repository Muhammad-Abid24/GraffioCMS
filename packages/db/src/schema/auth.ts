import {
  pgTable,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
  text,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { randomInt } from "node:crypto";

// ============================================================================
// Users
// ============================================================================
// user_id, email, password_hash, role_id, status_user, created_by, created_date, updated_date

export const users = pgTable(
  "CMS_USER",
  {
    userId: integer("USER_ID")
      .primaryKey()
      .$defaultFn(() => randomInt(10000, 100000)),
    email: varchar("EMAIL", { length: 200 }).notNull(),
    password: text("PASSWORD").notNull(),
    roleId: integer("ROLE_ID")
      .notNull()
      .references(() => roles.roleId),
    statusUser: varchar("STATUS_USER", { length: 1 }).notNull().default("A"),
    createdBy: varchar("CREATED_BY", { length: 100 }).notNull().default("System"),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: varchar("UPDATED_BY", { length: 100 }).notNull().default("System"),
    updatedDate: timestamp("UPDATED_DATE", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("CMS_USER_EMAIL_IDX").on(table.email),
    index("CMS_USER_STATUS_IDX").on(table.statusUser),
    check("CMS_USER_STATUS_CHECK", sql`${table.statusUser} IN ('A', 'N')`),
  ],
);

// ============================================================================
// Roles
// ============================================================================
// role_id, role_name, status_role, created_by, created_date, updated_date

export const roles = pgTable(
  "CMS_ROLE",
  {
    roleId: integer("ROLE_ID")
      .primaryKey()
      .$defaultFn(() => randomInt(10000, 100000)),
    roleName: varchar("ROLE_NAME", { length: 50 }).notNull(),
    statusRole: varchar("STATUS_ROLE", { length: 1 }).notNull().default("A"),
    createdBy: varchar("CREATED_BY", { length: 100 }).notNull().default("System"),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: varchar("UPDATED_BY", { length: 100 }).notNull().default("System"),
    updatedDate: timestamp("UPDATED_DATE", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("CMS_ROLE_NAME_IDX").on(table.roleName),
    check("CMS_ROLE_STATUS_CHECK", sql`${table.statusRole} IN ('A', 'N')`),
  ],
);

// ============================================================================
// Menu Permissions
// ============================================================================
// menu_permission_id, menu_id, role_id, can_view, can_create, can_update, can_delete

export const menuPermissions = pgTable(
  "CMS_MENU_PERMISSION",
  {
    menuPermissionId: integer("MENU_PERMISSION_ID")
      .primaryKey()
      .$defaultFn(() => randomInt(10000, 100000)),
    menuId: integer("MENU_ID")
      .notNull()
      .references(() => menus.menuId),
    roleId: integer("ROLE_ID")
      .notNull()
      .references(() => roles.roleId),
    canView: varchar("CAN_VIEW", { length: 1 }).notNull().default("N"),
    canCreate: varchar("CAN_CREATE", { length: 1 }).notNull().default("N"),
    canUpdate: varchar("CAN_UPDATE", { length: 1 }).notNull().default("N"),
    canDelete: varchar("CAN_DELETE", { length: 1 }).notNull().default("N"),
    createdBy: varchar("CREATED_BY", { length: 100 }).notNull().default("System"),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: varchar("UPDATED_BY", { length: 100 }).notNull().default("System"),
    updatedDate: timestamp("UPDATED_DATE", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("MENU_PERMISSION_IDX").on(table.roleId, table.menuId),

    check("MENU_PERMISSION_VIEW_CHECK", sql`${table.canView} IN ('Y', 'N')`),

    check("MENU_PERMISSION_CREATE_CHECK", sql`${table.canCreate} IN ('Y', 'N')`),

    check("MENU_PERMISSION_UPDATE_CHECK", sql`${table.canUpdate} IN ('Y', 'N')`),

    check("MENU_PERMISSION_DELETE_CHECK", sql`${table.canDelete} IN ('Y', 'N')`),
  ],
);

// ============================================================================
// Menus
// ============================================================================
// menu_id, menu_name, menu_alias, menu_url, menu_icon, order_menu, status_menu, created_by, created_date, updated_date

export const menus = pgTable(
  "CMS_MENU",
  {
    menuId: integer("MENU_ID")
      .primaryKey()
      .$defaultFn(() => randomInt(10000, 100000)),
    parentId: integer("PARENT_ID"),
    menuName: varchar("MENU_NAME", { length: 100 }).notNull(),
    menuAlias: varchar("MENU_ALIAS", { length: 200 }).notNull(),
    menuUrl: varchar("MENU_URL", { length: 200 }),
    menuIcon: varchar("MENU_ICON", { length: 100 }),
    orderMenu: integer("ORDER_MENU").notNull().default(0),
    statusMenu: varchar("STATUS_MENU", { length: 1 }).notNull().default("A"),
    createdBy: varchar("CREATED_BY", { length: 100 }).notNull().default("System"),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
    updatedBy: varchar("UPDATED_BY", { length: 100 }).notNull().default("System"),
    updatedDate: timestamp("UPDATED_DATE", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("CMS_MENU_ALIAS_IDX").on(table.menuAlias),

    index("MENU_ORDER_IDX").on(table.orderMenu),

    index("MENU_STATUS_IDX").on(table.statusMenu),

    check("CMS_MENU_STATUS_CHECK", sql`${table.statusMenu} IN ('A', 'N')`),

    check("CMS_MENU_ORDER_CHECK", sql`${table.orderMenu} >= 0`),

    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.menuId],
      name: "CMS_MENU_PARENT_FK",
    }),
  ],
);

// ============================================================================
// SESSION (save token for user login and for auto logout if user not active)
// ============================================================================

export const sessions = pgTable(
  "CMS_SESSIONS",
  {
    sessionId: integer("SESSION_ID").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("USER_ID")
      .notNull()
      .references(() => users.userId),
    tokenHash: varchar("TOKEN_HASH", { length: 128 }).notNull(),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
    expiresDate: timestamp("EXPIRES_DATE", { withTimezone: true }).notNull(),
    revokedDate: timestamp("REVOKED_DATE", { withTimezone: true }),
    lastSeenDate: timestamp("LAST_SEEN_DATE", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("SESSION_TOKEN_HASH_IDX").on(table.tokenHash),
    index("SESSION_USER_IDX").on(table.userId),
    index("SESSION_EXPIRES_DATE_IDX").on(table.expiresDate),
  ],
);

// ============================================================================
// Auth Tokens (forgot password, email verification, etc.)
// ============================================================================

export const authTokens = pgTable(
  "CMS_AUTH_TOKEN",
  {
    authTokenId: integer("AUTH_TOKEN_ID").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("USER_ID")
      .notNull()
      .references(() => users.userId),
    purpose: varchar("PURPOSE", { length: 50 }).notNull(),
    tokenHash: varchar("TOKEN", { length: 128 }).notNull(),
    expiresDate: timestamp("EXPIRES_DATE", { withTimezone: true }).notNull(),
    usedDate: timestamp("USED_DATE", { withTimezone: true }),
    createdDate: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("AUTH_TOKEN_IDX").on(table.tokenHash),
    index("AUTH_TOKEN_PURPOSE_IDX").on(table.userId, table.purpose),
  ],
);

// ============================================================================
// Auth Audit Logs
// ============================================================================

export const authAuditLogs = pgTable(
  "CMS_AUTH_LOG",
  {
    authLogId: integer("AUTH_LOG_ID").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("USER_ID").references(() => users.userId, {
      onDelete: "set null",
    }),
    roleId: integer("ROLE_ID").references(() => roles.roleId, {
      onDelete: "set null",
    }),
    actorEmail: varchar("ACTOR_EMAIL", {
      length: 200,
    }),
    event: varchar("EVENT", { length: 100 }).notNull(),
    ipAddress: varchar("IP_ADDRESS", { length: 45 }),
    createdAt: timestamp("CREATED_DATE", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("AUTH_LOG_USER_IDX").on(table.userId),
    index("AUTH_LOG_ROLE_IDX").on(table.roleId),
    index("AUTH_LOG_EVENT_IDX").on(table.event),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

// ============================================================================
// USERS
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.roleId],
  }),

  sessions: many(sessions),

  authTokens: many(authTokens),

  auditLogs: many(authAuditLogs),
}));

// ============================================================================
// ROLES
// ============================================================================

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),

  menuPermissions: many(menuPermissions),

  auditLogs: many(authAuditLogs),
}));

// ============================================================================
// MENUS
// ============================================================================

export const menusRelations = relations(menus, ({ one, many }) => ({
  menuPermissions: many(menuPermissions),
  parent: one(menus, {
    fields: [menus.parentId],
    references: [menus.menuId],
    relationName: "parent_child",
  }),
  children: many(menus, { relationName: "parent_child" }),
}));

// ============================================================================
// MENU PERMISSIONS
// ============================================================================

export const menuPermissionsRelations = relations(menuPermissions, ({ one }) => ({
  role: one(roles, {
    fields: [menuPermissions.roleId],
    references: [roles.roleId],
  }),

  menu: one(menus, {
    fields: [menuPermissions.menuId],
    references: [menus.menuId],
  }),
}));

// ============================================================================
// SESSIONS
// ============================================================================

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.userId],
  }),
}));

// ============================================================================
// AUTH TOKENS
// ============================================================================

export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.userId],
  }),
}));

// ============================================================================
// AUTH AUDIT LOGS
// ============================================================================

export const authAuditLogsRelations = relations(authAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [authAuditLogs.userId],
    references: [users.userId],
  }),

  role: one(roles, {
    fields: [authAuditLogs.roleId],
    references: [roles.roleId],
  }),
}));
