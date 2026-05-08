-- Trainer ↔ club assignment (m:n) + drop legacy trainerId from member_profile
CREATE TABLE club_trainer (
  club_place_id TEXT NOT NULL REFERENCES club_place(id) ON DELETE CASCADE,
  trainer_id    TEXT NOT NULL REFERENCES member_profile(id) ON DELETE CASCADE,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (club_place_id, trainer_id)
);

ALTER TABLE member_profile DROP COLUMN trainer_id;
