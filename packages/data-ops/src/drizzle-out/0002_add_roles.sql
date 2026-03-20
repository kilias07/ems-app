-- Rename existing 'member' role to 'user'
UPDATE member_profile SET role = 'user' WHERE role = 'member';
