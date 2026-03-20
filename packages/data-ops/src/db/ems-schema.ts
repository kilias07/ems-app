import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const memberProfile = sqliteTable("member_profile", {
  id: text("id").primaryKey(),
  nickname: text("nickname").unique(),
  role: text("role").notNull().default("member"),
  isActive: integer("is_active").notNull().default(1),
  profileComplete: integer("profile_complete").notNull().default(0),
  avatarUrl: text("avatar_url"),
  joinedAt: text("joined_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const trainingSession = sqliteTable("training_session", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => memberProfile.id, { onDelete: "cascade" }),
  sessionDate: text("session_date").notNull(),
  suitSize: text("suit_size").notNull(),
  rawPoints: integer("raw_points").notNull(),
  correctedPoints: real("corrected_points").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  notes: text("notes"),
});
