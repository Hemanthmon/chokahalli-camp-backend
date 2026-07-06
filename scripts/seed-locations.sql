-- One-time migration: replace the location master data with the camp's
-- canonical village list, without breaking any existing patient's address.
--
-- Rules:
--   1. Never touch patients.location_id.
--   2. Case-insensitive matches reuse the existing row (fixing its casing
--      to the canonical spelling) instead of inserting a duplicate.
--   3. Canonical names missing entirely are inserted.
--   4. Old rows are only removed if they are NOT one of the canonical
--      names AND NOT referenced by any patient.
BEGIN;

CREATE TEMP TABLE canonical_locations (name VARCHAR(150)) ON COMMIT DROP;

INSERT INTO canonical_locations (name) VALUES
  ('Chintamani'),
  ('Nayanahalli'),
  ('Chokkahalli'),
  ('Thimsandra'),
  ('Konapalli'),
  ('Dhanmetinahalli'),
  ('Venkatapura'),
  ('Janaghata'),
  ('Siddlaghatta'),
  ('Lakshmipura'),
  ('Chandarahalli'),
  ('Gunkuntte'),
  ('Yeldur'),
  ('Kolar'),
  ('Gutturu'),
  ('Bachorahalli'),
  ('Bobekall'),
  ('Banahalli'),
  ('Kanapura'),
  ('Diburahalli'),
  ('Hongasandra');

-- Fix casing on existing rows that match a canonical name case-insensitively.
UPDATE location l
SET location = c.name, updated_at = now()
FROM canonical_locations c
WHERE lower(l.location) = lower(c.name)
  AND l.location <> c.name;

-- Insert canonical names that don't exist yet in any casing.
INSERT INTO location (location)
SELECT c.name
FROM canonical_locations c
WHERE NOT EXISTS (
  SELECT 1 FROM location l WHERE lower(l.location) = lower(c.name)
);

-- Remove old locations that are neither canonical nor referenced by a patient.
DELETE FROM location l
WHERE NOT EXISTS (
    SELECT 1 FROM canonical_locations c WHERE lower(c.name) = lower(l.location)
  )
  AND NOT EXISTS (
    SELECT 1 FROM patients p WHERE p.location_id = l.id
  );

COMMIT;
