-- ═══════════════════════════════════════════════════
-- CLUBS
-- ═══════════════════════════════════════════════════
INSERT INTO club_place (id, name, city, address, open_hours, created_by, created_at) VALUES
  ('club-poznan-centrum', 'EMS Centrum', 'Poznań', 'ul. Półwiejska 12', 'Pn-Pt 7:00-21:00, Sb 9:00-15:00', 'system', datetime('now')),
  ('club-poznan-grunwald', 'EMS Grunwald', 'Poznań', 'ul. Grunwaldzka 104', 'Pn-Pt 8:00-20:00, Sb 10:00-14:00', 'system', datetime('now')),
  ('club-warszawa-mokotow', 'EMS Mokotów', 'Warszawa', 'ul. Puławska 45', 'Pn-Pt 7:00-22:00, Sb-Nd 9:00-17:00', 'system', datetime('now')),
  ('club-warszawa-wola', 'EMS Wola', 'Warszawa', 'ul. Wolska 88', 'Pn-Pt 6:30-21:00, Sb 8:00-16:00', 'system', datetime('now')),
  ('club-krakow-kazimierz', 'EMS Kazimierz', 'Kraków', 'ul. Starowiślna 22', 'Pn-Pt 7:00-21:00, Sb 9:00-14:00', 'system', datetime('now'));

-- ═══════════════════════════════════════════════════
-- MEMBERS (stub members — no auth user, can't log in)
-- ═══════════════════════════════════════════════════
INSERT INTO member_profile (id, nickname, role, status, is_active, profile_complete, suit_size, club_place_id, joined_at) VALUES
  ('m-anna-k',      'anna-kowalska',     'user', 'approved', 1, 1, 'R1',  'f59eb8aa-d487-45fa-a480-33c4581881e7', '2025-11-05'),
  ('m-tomek-n',     'tomek-nowak',       'user', 'approved', 1, 1, 'R2',  'f59eb8aa-d487-45fa-a480-33c4581881e7', '2025-10-12'),
  ('m-kasia-w',     'kasia-wisniewska',  'user', 'approved', 1, 1, 'RW2', 'f59eb8aa-d487-45fa-a480-33c4581881e7', '2025-12-01'),
  ('m-pawel-z',     'pawel-zielinski',   'user', 'approved', 1, 1, 'R3',  'club-poznan-centrum', '2025-09-15'),
  ('m-marta-d',     'marta-dabrowska',   'user', 'approved', 1, 1, 'R0',  'club-poznan-centrum', '2025-11-20'),
  ('m-jan-k',       'jan-kaminski',      'user', 'approved', 1, 1, 'R2',  'club-poznan-centrum', '2026-01-08'),
  ('m-ola-l',       'ola-lewandowska',   'user', 'approved', 1, 1, 'R1',  'club-poznan-grunwald', '2025-10-01'),
  ('m-bartek-s',    'bartek-szymanski',  'user', 'approved', 1, 1, 'RW2', 'club-poznan-grunwald', '2025-11-10'),
  ('m-zuzia-c',     'zuzia-czekalska',   'user', 'approved', 1, 1, 'R4',  'club-poznan-grunwald', '2026-02-14'),
  ('m-adam-p',      'adam-piotrowski',   'user', 'approved', 1, 1, 'R2',  'club-warszawa-mokotow', '2025-08-20'),
  ('m-ewa-m',       'ewa-mazur',         'user', 'approved', 1, 1, 'R1',  'club-warszawa-mokotow', '2025-09-03'),
  ('m-marek-j',     'marek-jasinski',    'user', 'approved', 1, 1, 'R3',  'club-warszawa-mokotow', '2025-12-15'),
  ('m-natalia-b',   'natalia-borkowska', 'user', 'approved', 1, 1, 'RW2', 'club-warszawa-wola', '2025-10-22'),
  ('m-piotr-g',     'piotr-grabowski',   'user', 'approved', 1, 1, 'R0',  'club-warszawa-wola', '2025-11-30'),
  ('m-agata-r',     'agata-rutkowska',   'user', 'approved', 1, 1, 'R2',  'club-krakow-kazimierz', '2025-09-25'),
  ('m-lukasz-w',    'lukasz-walczak',    'user', 'approved', 1, 1, 'R1',  'club-krakow-kazimierz', '2025-10-15'),
  ('m-karolina-s',  'karolina-sikora',   'user', 'approved', 1, 1, 'R5',  'club-krakow-kazimierz', '2026-01-20'),
  ('m-michal-t',    'michal-tomczak',    'user', 'approved', 1, 1, 'R4',  'home', '2026-03-01'),
  ('m-dominika-p',  'dominika-pawlak',   'user', 'approved', 1, 1, 'R2',  'home', '2026-02-10');

-- ═══════════════════════════════════════════════════
-- Assign existing users to clubs
-- ═══════════════════════════════════════════════════
UPDATE member_profile SET club_place_id = 'f59eb8aa-d487-45fa-a480-33c4581881e7' WHERE id = 'ICt52HuRSCIEYwQbx50tXBL4zg8YdlDG' AND club_place_id IS NULL;
UPDATE member_profile SET club_place_id = 'f59eb8aa-d487-45fa-a480-33c4581881e7' WHERE id = 'trainer_test_86506fb95da36841' AND club_place_id IS NULL;

-- ═══════════════════════════════════════════════════
-- TRAINING SESSIONS
-- Spread over Dec 2025 – Apr 2026
-- corrected_points = raw_points * multiplier
-- R0=1.2, R1=1.2, RW2=1.1, R2=1.0, R3=0.9, R4=0.8, R5=0.7
-- ═══════════════════════════════════════════════════

-- anna-kowalska (R1=1.2) — consistent, 2-3x/week
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-anna-01', 'm-anna-k', '2025-12-02', 'R1', 85, 102.0, 'approved', 'system', '2025-12-02'),
  ('s-anna-02', 'm-anna-k', '2025-12-05', 'R1', 90, 108.0, 'approved', 'system', '2025-12-05'),
  ('s-anna-03', 'm-anna-k', '2025-12-09', 'R1', 88, 105.6, 'approved', 'system', '2025-12-09'),
  ('s-anna-04', 'm-anna-k', '2025-12-12', 'R1', 92, 110.4, 'approved', 'system', '2025-12-12'),
  ('s-anna-05', 'm-anna-k', '2025-12-16', 'R1', 87, 104.4, 'approved', 'system', '2025-12-16'),
  ('s-anna-06', 'm-anna-k', '2025-12-19', 'R1', 95, 114.0, 'approved', 'system', '2025-12-19'),
  ('s-anna-07', 'm-anna-k', '2026-01-06', 'R1', 91, 109.2, 'approved', 'system', '2026-01-06'),
  ('s-anna-08', 'm-anna-k', '2026-01-09', 'R1', 89, 106.8, 'approved', 'system', '2026-01-09'),
  ('s-anna-09', 'm-anna-k', '2026-01-13', 'R1', 93, 111.6, 'approved', 'system', '2026-01-13'),
  ('s-anna-10', 'm-anna-k', '2026-01-16', 'R1', 96, 115.2, 'approved', 'system', '2026-01-16'),
  ('s-anna-11', 'm-anna-k', '2026-01-20', 'R1', 88, 105.6, 'approved', 'system', '2026-01-20'),
  ('s-anna-12', 'm-anna-k', '2026-02-03', 'R1', 94, 112.8, 'approved', 'system', '2026-02-03'),
  ('s-anna-13', 'm-anna-k', '2026-02-06', 'R1', 90, 108.0, 'approved', 'system', '2026-02-06'),
  ('s-anna-14', 'm-anna-k', '2026-02-10', 'R1', 97, 116.4, 'approved', 'system', '2026-02-10'),
  ('s-anna-15', 'm-anna-k', '2026-02-13', 'R1', 91, 109.2, 'approved', 'system', '2026-02-13'),
  ('s-anna-16', 'm-anna-k', '2026-03-03', 'R1', 93, 111.6, 'approved', 'system', '2026-03-03'),
  ('s-anna-17', 'm-anna-k', '2026-03-06', 'R1', 95, 114.0, 'approved', 'system', '2026-03-06'),
  ('s-anna-18', 'm-anna-k', '2026-03-10', 'R1', 89, 106.8, 'approved', 'system', '2026-03-10'),
  ('s-anna-19', 'm-anna-k', '2026-03-13', 'R1', 98, 117.6, 'approved', 'system', '2026-03-13'),
  ('s-anna-20', 'm-anna-k', '2026-04-07', 'R1', 92, 110.4, 'approved', 'system', '2026-04-07'),
  ('s-anna-21', 'm-anna-k', '2026-04-10', 'R1', 96, 115.2, 'approved', 'system', '2026-04-10');

-- tomek-nowak (R2=1.0) — very active, top performer
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-tomek-01', 'm-tomek-n', '2025-12-01', 'R2', 110, 110.0, 'approved', 'system', '2025-12-01'),
  ('s-tomek-02', 'm-tomek-n', '2025-12-03', 'R2', 115, 115.0, 'approved', 'system', '2025-12-03'),
  ('s-tomek-03', 'm-tomek-n', '2025-12-05', 'R2', 108, 108.0, 'approved', 'system', '2025-12-05'),
  ('s-tomek-04', 'm-tomek-n', '2025-12-08', 'R2', 120, 120.0, 'approved', 'system', '2025-12-08'),
  ('s-tomek-05', 'm-tomek-n', '2025-12-10', 'R2', 112, 112.0, 'approved', 'system', '2025-12-10'),
  ('s-tomek-06', 'm-tomek-n', '2025-12-15', 'R2', 118, 118.0, 'approved', 'system', '2025-12-15'),
  ('s-tomek-07', 'm-tomek-n', '2025-12-17', 'R2', 105, 105.0, 'approved', 'system', '2025-12-17'),
  ('s-tomek-08', 'm-tomek-n', '2026-01-07', 'R2', 122, 122.0, 'approved', 'system', '2026-01-07'),
  ('s-tomek-09', 'm-tomek-n', '2026-01-09', 'R2', 116, 116.0, 'approved', 'system', '2026-01-09'),
  ('s-tomek-10', 'm-tomek-n', '2026-01-14', 'R2', 119, 119.0, 'approved', 'system', '2026-01-14'),
  ('s-tomek-11', 'm-tomek-n', '2026-01-16', 'R2', 125, 125.0, 'approved', 'system', '2026-01-16'),
  ('s-tomek-12', 'm-tomek-n', '2026-01-21', 'R2', 113, 113.0, 'approved', 'system', '2026-01-21'),
  ('s-tomek-13', 'm-tomek-n', '2026-02-04', 'R2', 121, 121.0, 'approved', 'system', '2026-02-04'),
  ('s-tomek-14', 'm-tomek-n', '2026-02-06', 'R2', 117, 117.0, 'approved', 'system', '2026-02-06'),
  ('s-tomek-15', 'm-tomek-n', '2026-02-11', 'R2', 124, 124.0, 'approved', 'system', '2026-02-11'),
  ('s-tomek-16', 'm-tomek-n', '2026-02-13', 'R2', 110, 110.0, 'approved', 'system', '2026-02-13'),
  ('s-tomek-17', 'm-tomek-n', '2026-03-03', 'R2', 128, 128.0, 'approved', 'system', '2026-03-03'),
  ('s-tomek-18', 'm-tomek-n', '2026-03-05', 'R2', 115, 115.0, 'approved', 'system', '2026-03-05'),
  ('s-tomek-19', 'm-tomek-n', '2026-03-10', 'R2', 130, 130.0, 'approved', 'system', '2026-03-10'),
  ('s-tomek-20', 'm-tomek-n', '2026-03-12', 'R2', 118, 118.0, 'approved', 'system', '2026-03-12'),
  ('s-tomek-21', 'm-tomek-n', '2026-04-07', 'R2', 126, 126.0, 'approved', 'system', '2026-04-07'),
  ('s-tomek-22', 'm-tomek-n', '2026-04-09', 'R2', 132, 132.0, 'approved', 'system', '2026-04-09'),
  ('s-tomek-23', 'm-tomek-n', '2026-04-11', 'R2', 120, 120.0, 'approved', 'system', '2026-04-11');

-- kasia-wisniewska (RW2=1.1)
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-kasia-01', 'm-kasia-w', '2025-12-04', 'RW2', 78, 85.8, 'approved', 'system', '2025-12-04'),
  ('s-kasia-02', 'm-kasia-w', '2025-12-11', 'RW2', 82, 90.2, 'approved', 'system', '2025-12-11'),
  ('s-kasia-03', 'm-kasia-w', '2025-12-18', 'RW2', 85, 93.5, 'approved', 'system', '2025-12-18'),
  ('s-kasia-04', 'm-kasia-w', '2026-01-08', 'RW2', 80, 88.0, 'approved', 'system', '2026-01-08'),
  ('s-kasia-05', 'm-kasia-w', '2026-01-15', 'RW2', 88, 96.8, 'approved', 'system', '2026-01-15'),
  ('s-kasia-06', 'm-kasia-w', '2026-01-22', 'RW2', 83, 91.3, 'approved', 'system', '2026-01-22'),
  ('s-kasia-07', 'm-kasia-w', '2026-02-05', 'RW2', 86, 94.6, 'approved', 'system', '2026-02-05'),
  ('s-kasia-08', 'm-kasia-w', '2026-02-12', 'RW2', 90, 99.0, 'approved', 'system', '2026-02-12'),
  ('s-kasia-09', 'm-kasia-w', '2026-03-05', 'RW2', 84, 92.4, 'approved', 'system', '2026-03-05'),
  ('s-kasia-10', 'm-kasia-w', '2026-03-12', 'RW2', 91, 100.1, 'approved', 'system', '2026-03-12'),
  ('s-kasia-11', 'm-kasia-w', '2026-04-09', 'RW2', 87, 95.7, 'approved', 'system', '2026-04-09');

-- pawel-zielinski (R3=0.9) — moderate
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-pawel-01', 'm-pawel-z', '2025-12-03', 'R3', 95, 85.5, 'approved', 'system', '2025-12-03'),
  ('s-pawel-02', 'm-pawel-z', '2025-12-10', 'R3', 100, 90.0, 'approved', 'system', '2025-12-10'),
  ('s-pawel-03', 'm-pawel-z', '2025-12-17', 'R3', 92, 82.8, 'approved', 'system', '2025-12-17'),
  ('s-pawel-04', 'm-pawel-z', '2026-01-07', 'R3', 98, 88.2, 'approved', 'system', '2026-01-07'),
  ('s-pawel-05', 'm-pawel-z', '2026-01-14', 'R3', 105, 94.5, 'approved', 'system', '2026-01-14'),
  ('s-pawel-06', 'm-pawel-z', '2026-02-04', 'R3', 97, 87.3, 'approved', 'system', '2026-02-04'),
  ('s-pawel-07', 'm-pawel-z', '2026-02-11', 'R3', 103, 92.7, 'approved', 'system', '2026-02-11'),
  ('s-pawel-08', 'm-pawel-z', '2026-03-04', 'R3', 99, 89.1, 'approved', 'system', '2026-03-04'),
  ('s-pawel-09', 'm-pawel-z', '2026-03-11', 'R3', 108, 97.2, 'approved', 'system', '2026-03-11'),
  ('s-pawel-10', 'm-pawel-z', '2026-04-08', 'R3', 101, 90.9, 'approved', 'system', '2026-04-08');

-- marta-dabrowska (R0=1.2) — strong performer
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-marta-01', 'm-marta-d', '2025-12-02', 'R0', 100, 120.0, 'approved', 'system', '2025-12-02'),
  ('s-marta-02', 'm-marta-d', '2025-12-04', 'R0', 105, 126.0, 'approved', 'system', '2025-12-04'),
  ('s-marta-03', 'm-marta-d', '2025-12-09', 'R0', 98, 117.6, 'approved', 'system', '2025-12-09'),
  ('s-marta-04', 'm-marta-d', '2025-12-11', 'R0', 110, 132.0, 'approved', 'system', '2025-12-11'),
  ('s-marta-05', 'm-marta-d', '2025-12-16', 'R0', 103, 123.6, 'approved', 'system', '2025-12-16'),
  ('s-marta-06', 'm-marta-d', '2026-01-06', 'R0', 108, 129.6, 'approved', 'system', '2026-01-06'),
  ('s-marta-07', 'm-marta-d', '2026-01-08', 'R0', 112, 134.4, 'approved', 'system', '2026-01-08'),
  ('s-marta-08', 'm-marta-d', '2026-01-13', 'R0', 99, 118.8, 'approved', 'system', '2026-01-13'),
  ('s-marta-09', 'm-marta-d', '2026-01-15', 'R0', 115, 138.0, 'approved', 'system', '2026-01-15'),
  ('s-marta-10', 'm-marta-d', '2026-02-03', 'R0', 107, 128.4, 'approved', 'system', '2026-02-03'),
  ('s-marta-11', 'm-marta-d', '2026-02-05', 'R0', 111, 133.2, 'approved', 'system', '2026-02-05'),
  ('s-marta-12', 'm-marta-d', '2026-02-10', 'R0', 104, 124.8, 'approved', 'system', '2026-02-10'),
  ('s-marta-13', 'm-marta-d', '2026-03-03', 'R0', 113, 135.6, 'approved', 'system', '2026-03-03'),
  ('s-marta-14', 'm-marta-d', '2026-03-05', 'R0', 109, 130.8, 'approved', 'system', '2026-03-05'),
  ('s-marta-15', 'm-marta-d', '2026-03-10', 'R0', 116, 139.2, 'approved', 'system', '2026-03-10'),
  ('s-marta-16', 'm-marta-d', '2026-04-07', 'R0', 118, 141.6, 'approved', 'system', '2026-04-07'),
  ('s-marta-17', 'm-marta-d', '2026-04-09', 'R0', 106, 127.2, 'approved', 'system', '2026-04-09');

-- adam-piotrowski (R2=1.0) — Warsaw top
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-adam-01', 'm-adam-p', '2025-12-01', 'R2', 95, 95.0, 'approved', 'system', '2025-12-01'),
  ('s-adam-02', 'm-adam-p', '2025-12-08', 'R2', 102, 102.0, 'approved', 'system', '2025-12-08'),
  ('s-adam-03', 'm-adam-p', '2025-12-15', 'R2', 98, 98.0, 'approved', 'system', '2025-12-15'),
  ('s-adam-04', 'm-adam-p', '2026-01-05', 'R2', 105, 105.0, 'approved', 'system', '2026-01-05'),
  ('s-adam-05', 'm-adam-p', '2026-01-12', 'R2', 100, 100.0, 'approved', 'system', '2026-01-12'),
  ('s-adam-06', 'm-adam-p', '2026-01-19', 'R2', 108, 108.0, 'approved', 'system', '2026-01-19'),
  ('s-adam-07', 'm-adam-p', '2026-02-02', 'R2', 103, 103.0, 'approved', 'system', '2026-02-02'),
  ('s-adam-08', 'm-adam-p', '2026-02-09', 'R2', 110, 110.0, 'approved', 'system', '2026-02-09'),
  ('s-adam-09', 'm-adam-p', '2026-02-16', 'R2', 97, 97.0, 'approved', 'system', '2026-02-16'),
  ('s-adam-10', 'm-adam-p', '2026-03-02', 'R2', 112, 112.0, 'approved', 'system', '2026-03-02'),
  ('s-adam-11', 'm-adam-p', '2026-03-09', 'R2', 106, 106.0, 'approved', 'system', '2026-03-09'),
  ('s-adam-12', 'm-adam-p', '2026-03-16', 'R2', 115, 115.0, 'approved', 'system', '2026-03-16'),
  ('s-adam-13', 'm-adam-p', '2026-04-06', 'R2', 109, 109.0, 'approved', 'system', '2026-04-06'),
  ('s-adam-14', 'm-adam-p', '2026-04-10', 'R2', 118, 118.0, 'approved', 'system', '2026-04-10');

-- ewa-mazur (R1=1.2) — Warsaw
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-ewa-01', 'm-ewa-m', '2025-12-02', 'R1', 75, 90.0, 'approved', 'system', '2025-12-02'),
  ('s-ewa-02', 'm-ewa-m', '2025-12-09', 'R1', 80, 96.0, 'approved', 'system', '2025-12-09'),
  ('s-ewa-03', 'm-ewa-m', '2025-12-16', 'R1', 78, 93.6, 'approved', 'system', '2025-12-16'),
  ('s-ewa-04', 'm-ewa-m', '2026-01-06', 'R1', 82, 98.4, 'approved', 'system', '2026-01-06'),
  ('s-ewa-05', 'm-ewa-m', '2026-01-13', 'R1', 85, 102.0, 'approved', 'system', '2026-01-13'),
  ('s-ewa-06', 'm-ewa-m', '2026-02-03', 'R1', 79, 94.8, 'approved', 'system', '2026-02-03'),
  ('s-ewa-07', 'm-ewa-m', '2026-02-10', 'R1', 88, 105.6, 'approved', 'system', '2026-02-10'),
  ('s-ewa-08', 'm-ewa-m', '2026-03-03', 'R1', 83, 99.6, 'approved', 'system', '2026-03-03'),
  ('s-ewa-09', 'm-ewa-m', '2026-03-10', 'R1', 86, 103.2, 'approved', 'system', '2026-03-10'),
  ('s-ewa-10', 'm-ewa-m', '2026-04-07', 'R1', 90, 108.0, 'approved', 'system', '2026-04-07');

-- ola-lewandowska (R1=1.2) — Grunwald
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-ola-01', 'm-ola-l', '2025-12-03', 'R1', 88, 105.6, 'approved', 'system', '2025-12-03'),
  ('s-ola-02', 'm-ola-l', '2025-12-10', 'R1', 92, 110.4, 'approved', 'system', '2025-12-10'),
  ('s-ola-03', 'm-ola-l', '2025-12-17', 'R1', 85, 102.0, 'approved', 'system', '2025-12-17'),
  ('s-ola-04', 'm-ola-l', '2026-01-07', 'R1', 90, 108.0, 'approved', 'system', '2026-01-07'),
  ('s-ola-05', 'm-ola-l', '2026-01-14', 'R1', 94, 112.8, 'approved', 'system', '2026-01-14'),
  ('s-ola-06', 'm-ola-l', '2026-01-21', 'R1', 87, 104.4, 'approved', 'system', '2026-01-21'),
  ('s-ola-07', 'm-ola-l', '2026-02-04', 'R1', 96, 115.2, 'approved', 'system', '2026-02-04'),
  ('s-ola-08', 'm-ola-l', '2026-02-11', 'R1', 89, 106.8, 'approved', 'system', '2026-02-11'),
  ('s-ola-09', 'm-ola-l', '2026-03-04', 'R1', 93, 111.6, 'approved', 'system', '2026-03-04'),
  ('s-ola-10', 'm-ola-l', '2026-03-11', 'R1', 97, 116.4, 'approved', 'system', '2026-03-11'),
  ('s-ola-11', 'm-ola-l', '2026-04-08', 'R1', 91, 109.2, 'approved', 'system', '2026-04-08'),
  ('s-ola-12', 'm-ola-l', '2026-04-10', 'R1', 95, 114.0, 'approved', 'system', '2026-04-10');

-- piotr-grabowski (R0=1.2) — Warsaw Wola, beast mode
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-piotr-01', 'm-piotr-g', '2025-12-01', 'R0', 115, 138.0, 'approved', 'system', '2025-12-01'),
  ('s-piotr-02', 'm-piotr-g', '2025-12-04', 'R0', 120, 144.0, 'approved', 'system', '2025-12-04'),
  ('s-piotr-03', 'm-piotr-g', '2025-12-08', 'R0', 118, 141.6, 'approved', 'system', '2025-12-08'),
  ('s-piotr-04', 'm-piotr-g', '2025-12-11', 'R0', 125, 150.0, 'approved', 'system', '2025-12-11'),
  ('s-piotr-05', 'm-piotr-g', '2025-12-15', 'R0', 112, 134.4, 'approved', 'system', '2025-12-15'),
  ('s-piotr-06', 'm-piotr-g', '2025-12-18', 'R0', 128, 153.6, 'approved', 'system', '2025-12-18'),
  ('s-piotr-07', 'm-piotr-g', '2026-01-05', 'R0', 122, 146.4, 'approved', 'system', '2026-01-05'),
  ('s-piotr-08', 'm-piotr-g', '2026-01-08', 'R0', 130, 156.0, 'approved', 'system', '2026-01-08'),
  ('s-piotr-09', 'm-piotr-g', '2026-01-12', 'R0', 118, 141.6, 'approved', 'system', '2026-01-12'),
  ('s-piotr-10', 'm-piotr-g', '2026-01-15', 'R0', 135, 162.0, 'approved', 'system', '2026-01-15'),
  ('s-piotr-11', 'm-piotr-g', '2026-01-19', 'R0', 121, 145.2, 'approved', 'system', '2026-01-19'),
  ('s-piotr-12', 'm-piotr-g', '2026-02-02', 'R0', 126, 151.2, 'approved', 'system', '2026-02-02'),
  ('s-piotr-13', 'm-piotr-g', '2026-02-05', 'R0', 132, 158.4, 'approved', 'system', '2026-02-05'),
  ('s-piotr-14', 'm-piotr-g', '2026-02-09', 'R0', 119, 142.8, 'approved', 'system', '2026-02-09'),
  ('s-piotr-15', 'm-piotr-g', '2026-02-12', 'R0', 138, 165.6, 'approved', 'system', '2026-02-12'),
  ('s-piotr-16', 'm-piotr-g', '2026-03-02', 'R0', 129, 154.8, 'approved', 'system', '2026-03-02'),
  ('s-piotr-17', 'm-piotr-g', '2026-03-05', 'R0', 134, 160.8, 'approved', 'system', '2026-03-05'),
  ('s-piotr-18', 'm-piotr-g', '2026-03-09', 'R0', 140, 168.0, 'approved', 'system', '2026-03-09'),
  ('s-piotr-19', 'm-piotr-g', '2026-03-12', 'R0', 125, 150.0, 'approved', 'system', '2026-03-12'),
  ('s-piotr-20', 'm-piotr-g', '2026-04-07', 'R0', 136, 163.2, 'approved', 'system', '2026-04-07'),
  ('s-piotr-21', 'm-piotr-g', '2026-04-10', 'R0', 142, 170.4, 'approved', 'system', '2026-04-10');

-- agata-rutkowska (R2=1.0) — Kraków
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-agata-01', 'm-agata-r', '2025-12-04', 'R2', 88, 88.0, 'approved', 'system', '2025-12-04'),
  ('s-agata-02', 'm-agata-r', '2025-12-11', 'R2', 92, 92.0, 'approved', 'system', '2025-12-11'),
  ('s-agata-03', 'm-agata-r', '2025-12-18', 'R2', 85, 85.0, 'approved', 'system', '2025-12-18'),
  ('s-agata-04', 'm-agata-r', '2026-01-08', 'R2', 95, 95.0, 'approved', 'system', '2026-01-08'),
  ('s-agata-05', 'm-agata-r', '2026-01-15', 'R2', 90, 90.0, 'approved', 'system', '2026-01-15'),
  ('s-agata-06', 'm-agata-r', '2026-02-05', 'R2', 93, 93.0, 'approved', 'system', '2026-02-05'),
  ('s-agata-07', 'm-agata-r', '2026-02-12', 'R2', 98, 98.0, 'approved', 'system', '2026-02-12'),
  ('s-agata-08', 'm-agata-r', '2026-03-05', 'R2', 91, 91.0, 'approved', 'system', '2026-03-05'),
  ('s-agata-09', 'm-agata-r', '2026-03-12', 'R2', 96, 96.0, 'approved', 'system', '2026-03-12'),
  ('s-agata-10', 'm-agata-r', '2026-04-09', 'R2', 100, 100.0, 'approved', 'system', '2026-04-09');

-- lukasz-walczak (R1=1.2) — Kraków
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-lukasz-01', 'm-lukasz-w', '2025-12-02', 'R1', 82, 98.4, 'approved', 'system', '2025-12-02'),
  ('s-lukasz-02', 'm-lukasz-w', '2025-12-09', 'R1', 86, 103.2, 'approved', 'system', '2025-12-09'),
  ('s-lukasz-03', 'm-lukasz-w', '2025-12-16', 'R1', 79, 94.8, 'approved', 'system', '2025-12-16'),
  ('s-lukasz-04', 'm-lukasz-w', '2026-01-06', 'R1', 90, 108.0, 'approved', 'system', '2026-01-06'),
  ('s-lukasz-05', 'm-lukasz-w', '2026-01-13', 'R1', 84, 100.8, 'approved', 'system', '2026-01-13'),
  ('s-lukasz-06', 'm-lukasz-w', '2026-02-03', 'R1', 88, 105.6, 'approved', 'system', '2026-02-03'),
  ('s-lukasz-07', 'm-lukasz-w', '2026-02-10', 'R1', 91, 109.2, 'approved', 'system', '2026-02-10'),
  ('s-lukasz-08', 'm-lukasz-w', '2026-03-03', 'R1', 85, 102.0, 'approved', 'system', '2026-03-03'),
  ('s-lukasz-09', 'm-lukasz-w', '2026-03-10', 'R1', 93, 111.6, 'approved', 'system', '2026-03-10'),
  ('s-lukasz-10', 'm-lukasz-w', '2026-04-07', 'R1', 87, 104.4, 'approved', 'system', '2026-04-07');

-- bartek-szymanski (RW2=1.1) — Grunwald
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-bartek-01', 'm-bartek-s', '2025-12-05', 'RW2', 90, 99.0, 'approved', 'system', '2025-12-05'),
  ('s-bartek-02', 'm-bartek-s', '2025-12-12', 'RW2', 95, 104.5, 'approved', 'system', '2025-12-12'),
  ('s-bartek-03', 'm-bartek-s', '2025-12-19', 'RW2', 88, 96.8, 'approved', 'system', '2025-12-19'),
  ('s-bartek-04', 'm-bartek-s', '2026-01-09', 'RW2', 93, 102.3, 'approved', 'system', '2026-01-09'),
  ('s-bartek-05', 'm-bartek-s', '2026-01-16', 'RW2', 98, 107.8, 'approved', 'system', '2026-01-16'),
  ('s-bartek-06', 'm-bartek-s', '2026-02-06', 'RW2', 91, 100.1, 'approved', 'system', '2026-02-06'),
  ('s-bartek-07', 'm-bartek-s', '2026-02-13', 'RW2', 96, 105.6, 'approved', 'system', '2026-02-13'),
  ('s-bartek-08', 'm-bartek-s', '2026-03-06', 'RW2', 100, 110.0, 'approved', 'system', '2026-03-06'),
  ('s-bartek-09', 'm-bartek-s', '2026-03-13', 'RW2', 94, 103.4, 'approved', 'system', '2026-03-13'),
  ('s-bartek-10', 'm-bartek-s', '2026-04-10', 'RW2', 97, 106.7, 'approved', 'system', '2026-04-10');

-- natalia-borkowska (RW2=1.1) — Warsaw Wola
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-natalia-01', 'm-natalia-b', '2025-12-03', 'RW2', 76, 83.6, 'approved', 'system', '2025-12-03'),
  ('s-natalia-02', 'm-natalia-b', '2025-12-10', 'RW2', 80, 88.0, 'approved', 'system', '2025-12-10'),
  ('s-natalia-03', 'm-natalia-b', '2025-12-17', 'RW2', 83, 91.3, 'approved', 'system', '2025-12-17'),
  ('s-natalia-04', 'm-natalia-b', '2026-01-07', 'RW2', 78, 85.8, 'approved', 'system', '2026-01-07'),
  ('s-natalia-05', 'm-natalia-b', '2026-01-14', 'RW2', 85, 93.5, 'approved', 'system', '2026-01-14'),
  ('s-natalia-06', 'm-natalia-b', '2026-02-04', 'RW2', 81, 89.1, 'approved', 'system', '2026-02-04'),
  ('s-natalia-07', 'm-natalia-b', '2026-02-11', 'RW2', 87, 95.7, 'approved', 'system', '2026-02-11'),
  ('s-natalia-08', 'm-natalia-b', '2026-03-04', 'RW2', 84, 92.4, 'approved', 'system', '2026-03-04'),
  ('s-natalia-09', 'm-natalia-b', '2026-04-08', 'RW2', 89, 97.9, 'approved', 'system', '2026-04-08');

-- jan-kaminski (R2=1.0) — Centrum, newer member
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-jan-01', 'm-jan-k', '2026-01-12', 'R2', 70, 70.0, 'approved', 'system', '2026-01-12'),
  ('s-jan-02', 'm-jan-k', '2026-01-19', 'R2', 75, 75.0, 'approved', 'system', '2026-01-19'),
  ('s-jan-03', 'm-jan-k', '2026-02-02', 'R2', 78, 78.0, 'approved', 'system', '2026-02-02'),
  ('s-jan-04', 'm-jan-k', '2026-02-09', 'R2', 82, 82.0, 'approved', 'system', '2026-02-09'),
  ('s-jan-05', 'm-jan-k', '2026-03-02', 'R2', 85, 85.0, 'approved', 'system', '2026-03-02'),
  ('s-jan-06', 'm-jan-k', '2026-03-09', 'R2', 88, 88.0, 'approved', 'system', '2026-03-09'),
  ('s-jan-07', 'm-jan-k', '2026-04-06', 'R2', 90, 90.0, 'approved', 'system', '2026-04-06');

-- marek-jasinski (R3=0.9) — Warsaw Mokotów
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-marek-01', 'm-marek-j', '2026-01-06', 'R3', 88, 79.2, 'approved', 'system', '2026-01-06'),
  ('s-marek-02', 'm-marek-j', '2026-01-13', 'R3', 92, 82.8, 'approved', 'system', '2026-01-13'),
  ('s-marek-03', 'm-marek-j', '2026-02-03', 'R3', 95, 85.5, 'approved', 'system', '2026-02-03'),
  ('s-marek-04', 'm-marek-j', '2026-02-10', 'R3', 90, 81.0, 'approved', 'system', '2026-02-10'),
  ('s-marek-05', 'm-marek-j', '2026-03-03', 'R3', 98, 88.2, 'approved', 'system', '2026-03-03'),
  ('s-marek-06', 'm-marek-j', '2026-03-10', 'R3', 93, 83.7, 'approved', 'system', '2026-03-10'),
  ('s-marek-07', 'm-marek-j', '2026-04-07', 'R3', 100, 90.0, 'approved', 'system', '2026-04-07');

-- karolina-sikora (R5=0.7) — Kraków, smaller suit
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-karolina-01', 'm-karolina-s', '2026-02-03', 'R5', 110, 77.0, 'approved', 'system', '2026-02-03'),
  ('s-karolina-02', 'm-karolina-s', '2026-02-10', 'R5', 115, 80.5, 'approved', 'system', '2026-02-10'),
  ('s-karolina-03', 'm-karolina-s', '2026-03-03', 'R5', 120, 84.0, 'approved', 'system', '2026-03-03'),
  ('s-karolina-04', 'm-karolina-s', '2026-03-10', 'R5', 118, 82.6, 'approved', 'system', '2026-03-10'),
  ('s-karolina-05', 'm-karolina-s', '2026-04-07', 'R5', 125, 87.5, 'approved', 'system', '2026-04-07');

-- michal-tomczak (R4=0.8) — home training
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-michal-01', 'm-michal-t', '2026-03-05', 'R4', 85, 68.0, 'approved', 'system', '2026-03-05'),
  ('s-michal-02', 'm-michal-t', '2026-03-12', 'R4', 90, 72.0, 'approved', 'system', '2026-03-12'),
  ('s-michal-03', 'm-michal-t', '2026-04-07', 'R4', 88, 70.4, 'approved', 'system', '2026-04-07'),
  ('s-michal-04', 'm-michal-t', '2026-04-10', 'R4', 92, 73.6, 'approved', 'system', '2026-04-10');

-- dominika-pawlak (R2=1.0) — home training
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-dominika-01', 'm-dominika-p', '2026-02-12', 'R2', 72, 72.0, 'approved', 'system', '2026-02-12'),
  ('s-dominika-02', 'm-dominika-p', '2026-02-19', 'R2', 76, 76.0, 'approved', 'system', '2026-02-19'),
  ('s-dominika-03', 'm-dominika-p', '2026-03-05', 'R2', 80, 80.0, 'approved', 'system', '2026-03-05'),
  ('s-dominika-04', 'm-dominika-p', '2026-03-12', 'R2', 78, 78.0, 'approved', 'system', '2026-03-12'),
  ('s-dominika-05', 'm-dominika-p', '2026-04-09', 'R2', 83, 83.0, 'approved', 'system', '2026-04-09');

-- zuzia-czekalska (R4=0.8) — Grunwald, newer
INSERT INTO training_session (id, member_id, session_date, suit_size, raw_points, corrected_points, status, created_by, created_at) VALUES
  ('s-zuzia-01', 'm-zuzia-c', '2026-03-04', 'R4', 75, 60.0, 'approved', 'system', '2026-03-04'),
  ('s-zuzia-02', 'm-zuzia-c', '2026-03-11', 'R4', 80, 64.0, 'approved', 'system', '2026-03-11'),
  ('s-zuzia-03', 'm-zuzia-c', '2026-04-08', 'R4', 82, 65.6, 'approved', 'system', '2026-04-08');
