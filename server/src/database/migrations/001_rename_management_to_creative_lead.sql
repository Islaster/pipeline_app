BEGIN;

ALTER TABLE users   DROP CONSTRAINT users_role_check;
ALTER TABLE invites DROP CONSTRAINT invites_role_check;

UPDATE users   SET role = 'creative_lead' WHERE role = 'management';
UPDATE invites SET role = 'creative_lead' WHERE role = 'management';

ALTER TABLE users   ADD CONSTRAINT users_role_check   CHECK (role IN ('creative_lead', 'lead', 'artist'));
ALTER TABLE invites ADD CONSTRAINT invites_role_check CHECK (role IN ('creative_lead', 'lead', 'artist'));

COMMIT;