-- One-time migration: normalize spectacle_corrections.spectacle_status onto
-- the canonical vocabulary (NOT_REQUIRED / RECOMMENDED / RECEIVED /
-- COLLECTED) and keep spectacle_required in sync with it.
--
-- Mapping decisions (confirmed with the camp team):
--   'Not Required'      (doctor intake form)   -> NOT_REQUIRED
--   'Will Collect Later' (doctor intake form)  -> RECOMMENDED
--   'PENDING'           (admin distribution)   -> RECOMMENDED
--   'Issued'            (doctor intake form)   -> COLLECTED
--       Historically "Issued" meant the patient was handed spectacles and
--       left with them at camp, which is what COLLECTED means going forward.
--   'RECEIVED'          (admin distribution)   -> RECEIVED (already matches)
--
-- Any row already holding one of the four canonical values, or a NULL
-- status, is left untouched.
BEGIN;

UPDATE spectacle_corrections
SET spectacle_status = 'NOT_REQUIRED', spectacle_required = false
WHERE spectacle_status = 'Not Required';

UPDATE spectacle_corrections
SET spectacle_status = 'RECOMMENDED', spectacle_required = true
WHERE spectacle_status IN ('Will Collect Later', 'PENDING');

UPDATE spectacle_corrections
SET spectacle_status = 'COLLECTED', spectacle_required = true
WHERE spectacle_status = 'Issued';

UPDATE spectacle_corrections
SET spectacle_required = true
WHERE spectacle_status = 'RECEIVED';

-- Safety net: anything left over that still isn't one of the four
-- canonical values (and isn't NULL) is surfaced here rather than silently
-- migrated, since it means a value this script didn't anticipate.
SELECT id, patient_checkup_id, spectacle_status
FROM spectacle_corrections
WHERE spectacle_status IS NOT NULL
  AND spectacle_status NOT IN ('NOT_REQUIRED', 'RECOMMENDED', 'RECEIVED', 'COLLECTED');

COMMIT;
