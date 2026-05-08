import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";

export const clubPlace = sqliteTable("club_place", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull().default(""),
  address: text("address").notNull(),
  openHours: text("open_hours"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const memberProfile = sqliteTable("member_profile", {
  id: text("id").primaryKey(),
  nickname: text("nickname").unique(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved'
  isActive: integer("is_active").notNull().default(1),
  profileComplete: integer("profile_complete").notNull().default(0),
  suitSize: text("suit_size"),
  avatarUrl: text("avatar_url"),
  clubPlaceId: text("club_place_id"), // FK to club_place
  city: text("city"), // ranking city (set when clubPlaceId === HOME_CLUB_ID; otherwise derived from club)
  joinedAt: text("joined_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const clubTrainer = sqliteTable(
  "club_trainer",
  {
    clubPlaceId: text("club_place_id")
      .notNull()
      .references(() => clubPlace.id, { onDelete: "cascade" }),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => memberProfile.id, { onDelete: "cascade" }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [primaryKey({ columns: [t.clubPlaceId, t.trainerId] })],
);

export const userNote = sqliteTable("user_note", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => memberProfile.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at")
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
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  rejectionNote: text("rejection_note"),
  reviewedBy: text("reviewed_by"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  notes: text("notes"),
});
