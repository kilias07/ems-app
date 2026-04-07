CREATE TABLE `user_note` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `author_id` text NOT NULL,
  `content` text NOT NULL,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (`user_id`) REFERENCES `member_profile`(`id`) ON DELETE CASCADE
);
