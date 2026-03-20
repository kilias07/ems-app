CREATE TABLE IF NOT EXISTS `member_profile` (
  `id` text PRIMARY KEY NOT NULL,
  `nickname` text UNIQUE,
  `role` text NOT NULL DEFAULT 'member',
  `is_active` integer NOT NULL DEFAULT 1,
  `profile_complete` integer NOT NULL DEFAULT 0,
  `avatar_url` text,
  `joined_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `training_session` (
  `id` text PRIMARY KEY NOT NULL,
  `member_id` text NOT NULL REFERENCES `member_profile`(`id`) ON DELETE CASCADE,
  `session_date` text NOT NULL,
  `suit_size` text NOT NULL,
  `raw_points` integer NOT NULL,
  `corrected_points` real NOT NULL,
  `created_by` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `notes` text
);

CREATE INDEX IF NOT EXISTS `idx_training_session_member_id` ON `training_session` (`member_id`);
CREATE INDEX IF NOT EXISTS `idx_training_session_session_date` ON `training_session` (`session_date`);
