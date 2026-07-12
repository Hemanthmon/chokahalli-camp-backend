-- One-time, additive schema change: adds password support for staff
-- accounts, starting with ADMIN.
--
-- NULL is a meaningful state here, not a placeholder to backfill — it
-- means "this account hasn't set a password yet" and drives the
-- first-time password setup step in the login flow. No existing row
-- needs a value written into it by this script.
BEGIN;

ALTER TABLE users
    ADD COLUMN password_hash TEXT;

COMMIT;
