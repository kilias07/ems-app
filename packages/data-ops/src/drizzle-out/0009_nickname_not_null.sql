-- Forbid member_profile rows without a nickname.
-- "Ghost" profiles (created by Better Auth signup hook but never completed setup)
-- are deleted first; their FK children (training_session, user_note, club_trainer)
-- cascade away via ON DELETE CASCADE.
DELETE FROM member_profile WHERE nickname IS NULL;

-- SQLite has no ALTER COLUMN, so the only way to add NOT NULL is the
-- documented table-rebuild pattern. FK enforcement is disabled for the
-- duration so DROP TABLE doesn't trigger an implicit DELETE → CASCADE
-- that would wipe training_session / user_note / club_trainer.
PRAGMA foreign_keys = OFF;

CREATE TABLE __new_member_profile (
  id text PRIMARY KEY NOT NULL,
  nickname text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'pending',
  is_active integer NOT NULL DEFAULT 1,
  profile_complete integer NOT NULL DEFAULT 0,
  suit_size text,
  avatar_url text,
  club_place_id text,
  city text,
  joined_at text NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO __new_member_profile (
  id, nickname, role, status, is_active, profile_complete,
  suit_size, avatar_url, club_place_id, city, joined_at
)
SELECT
  id, nickname, role, status, is_active, profile_complete,
  suit_size, avatar_url, club_place_id, city, joined_at
FROM member_profile;

DROP TABLE member_profile;
ALTER TABLE __new_member_profile RENAME TO member_profile;

PRAGMA foreign_keys = ON;
