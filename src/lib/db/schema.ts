import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  json,
  date,
} from "drizzle-orm/pg-core";
import { createId } from "../utils";
import { MessageReference } from "discord.js";

export const guildConfig = pgTable("guild_config", {
  id: text("id").primaryKey(), // guild id
  disabledCommands: text("disabled_command").array().notNull().default([]),

  //Logging
  logsChannelId: text("logs_channel_id"),
  enabledLogs: text("enabled_loggers")
    .array()
    .notNull()
    .default(["moderation", "memberAdd"]),

  // toggables
  reactionRoles: boolean("reaction_roles").notNull().default(false),
});

export type GuildConfigSelect = typeof guildConfig.$inferSelect;
export type GuildConfigInsert = typeof guildConfig.$inferInsert;

export const reactionRole = pgTable("reaction_role", {
  id: text("id").primaryKey(),
  guildId: text("guild_id").notNull(),
  uniqueId: text("unique_id")
    .notNull()
    .$defaultFn(() => createId()),
  message: text("message").notNull(), // message payload JSON str
  reactions: text("reactions").notNull().array(), // Array of json stringifies, { roleId: string, emoji: string; label: string; style: string}
  messageId: text("message_id"), // links to existing message if there is one
  channelId: text("channel_id"),
  name: text("name").notNull(),
});

export type ReactionRoleSelect = typeof reactionRole.$inferSelect;
export type ReactionRoleInsert = typeof reactionRole.$inferInsert;

export const infraction = pgTable("infraction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId(15)), // unique id,
  userId: text("user_id").notNull(),
  guildId: text("guild_id").notNull(),
  silenced: boolean("silenced").default(false),
  permanent: boolean("permanent").default(false),
  reason: text("reason").notNull(),
  proofUrl: text("proof_url"),
  moderatorId: text("moderator_id").notNull(),
  type: text("infraction_type").notNull(),
  history: json("history")
    .$type<
      {
        id: string;
        content: string | null | undefined;
        time: number;
        edited: number | undefined | null;
        reference: MessageReference;
      }[]
    >()
    .array(),

  timestampIssued: date("date_issued", {
    mode: "string",
  }).defaultNow(),
});

export type InfractionSelect = typeof infraction.$inferSelect;
export type InfractionInsert = typeof infraction.$inferInsert;

// Auth + Stripe

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  guilds: text("guilds").notNull(),
});

export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type Session = typeof session.$inferSelect;
export type SessionInsert = typeof session.$inferInsert;

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  seats: integer("seats"),
});
