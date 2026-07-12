-- One-time, additive schema change for Spectacle Distribution v2:
--   1. Village Volunteer master, FK'd to the existing location table.
--      location_id is intentionally a plain (non-unique) foreign key, not a
--      1:1 relationship, so a village can carry more than one volunteer
--      without a future migration. "Only one PRIMARY volunteer per village"
--      is enforced in application code (see createVillageVolunteer /
--      updateVillageVolunteer), consistent with how this codebase already
--      enforces business rules in the service layer rather than via DB
--      constraints (e.g. spectacle_corrections has no CHECK constraint on
--      spectacle_status either — validation lives in saveSpectacleCorrection).
--   2. Two columns on spectacle_corrections for the first-version
--      notification tracking: last channel + last timestamp only, no
--      separate history table, per current requirements.
BEGIN;

CREATE TABLE village_volunteers (
    id BIGSERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES location(id),
    volunteer_name VARCHAR(150) NOT NULL,
    primary_phone VARCHAR(15) NOT NULL,
    secondary_phone VARCHAR(15),
    is_primary BOOLEAN NOT NULL DEFAULT true,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_village_volunteers_location_id ON village_volunteers(location_id);

ALTER TABLE spectacle_corrections
    ADD COLUMN last_notification_type VARCHAR(20),
    ADD COLUMN last_notification_at TIMESTAMP;

COMMIT;
