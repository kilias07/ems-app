-- Create club_place table
CREATE TABLE `club_place` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `address` text NOT NULL,
  `open_hours` text,
  `created_by` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

-- Add status, trainer_id, club_place_id to member_profile
ALTER TABLE `member_profile` ADD COLUMN `status` text NOT NULL DEFAULT 'pending';
ALTER TABLE `member_profile` ADD COLUMN `trainer_id` text;
ALTER TABLE `member_profile` ADD COLUMN `club_place_id` text;

-- Approve all existing members so nobody gets locked out
UPDATE `member_profile` SET `status` = 'approved';

-- Add status, rejection_note, reviewed_by to training_session
ALTER TABLE `training_session` ADD COLUMN `status` text NOT NULL DEFAULT 'pending';
ALTER TABLE `training_session` ADD COLUMN `rejection_note` text;
ALTER TABLE `training_session` ADD COLUMN `reviewed_by` text;

-- Approve all existing sessions so the leaderboard stays intact
UPDATE `training_session` SET `status` = 'approved';
