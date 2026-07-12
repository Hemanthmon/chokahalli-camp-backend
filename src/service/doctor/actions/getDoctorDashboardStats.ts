import { SPECTACLE_STATUS } from "../../../common/constants";
import { pool } from "../../../db";

const getDoctorDashboardStats = async () => {
  const [
    totalPatientsResult,
    genderResult,
    ageResult,
    ageGroupResult,
    locationResult,
    cataractResult,
    spectacleStatusResult,
    spectacleTotalResult,
    operationTypeResult,
    operationStatusResult,
    nerveTotalResult,
    nerveSelectedResult,
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM patients`),

    pool.query(
      `SELECT gender, COUNT(*)::int AS count FROM patients GROUP BY gender`
    ),

    pool.query(
      `SELECT ROUND(AVG(age))::int AS average_age FROM patients WHERE age IS NOT NULL`
    ),

    pool.query(
      `
      SELECT
          CASE
              WHEN age BETWEEN 0 AND 10 THEN '0-10'
              WHEN age BETWEEN 11 AND 20 THEN '11-20'
              WHEN age BETWEEN 21 AND 30 THEN '21-30'
              WHEN age BETWEEN 31 AND 40 THEN '31-40'
              WHEN age BETWEEN 41 AND 50 THEN '41-50'
              WHEN age BETWEEN 51 AND 60 THEN '51-60'
              WHEN age BETWEEN 61 AND 70 THEN '61-70'
              WHEN age BETWEEN 71 AND 80 THEN '71-80'
              ELSE '80+'
          END AS range,
          COUNT(*)::int AS count
      FROM patients
      WHERE age IS NOT NULL
      GROUP BY range
      ORDER BY MIN(age)
      `
    ),

    pool.query(
      `
      SELECT l.location, COUNT(*)::int AS count
      FROM patients p
      INNER JOIN location l ON l.id = p.location_id
      GROUP BY l.location
      ORDER BY count DESC
      `
    ),

    pool.query(
      `SELECT COUNT(*)::int AS count FROM slit_lamp_checkups WHERE cataract_present = true`
    ),

    pool.query(
      `
      SELECT spectacle_status, COUNT(*)::int AS count
      FROM spectacle_corrections
      WHERE spectacle_status IS NOT NULL
      GROUP BY spectacle_status
      `
    ),

    pool.query(`SELECT COUNT(*)::int AS count FROM spectacle_corrections`),

    pool.query(
      `
      SELECT operation_type, COUNT(*)::int AS count
      FROM operation_recommendations
      WHERE operation_type IS NOT NULL
      GROUP BY operation_type
      ORDER BY count DESC
      `
    ),

    pool.query(
      `
      SELECT operation_status, COUNT(*)::int AS count
      FROM operation_recommendations
      GROUP BY operation_status
      `
    ),

    pool.query(`SELECT COUNT(*)::int AS count FROM nerve_assessments`),

    pool.query(
      `SELECT COUNT(*)::int AS count FROM nerve_assessments WHERE selected_for_operation = true`
    ),
  ]);

  const affectedEyeResult = await pool.query(
    `
    SELECT affected_eye, COUNT(*)::int AS count
    FROM slit_lamp_checkups
    WHERE affected_eye IS NOT NULL
    GROUP BY affected_eye
    `
  );

  const operationsSelected =
    operationStatusResult.rows.find((row) => row.operation_status === "Approved")
      ?.count ?? 0;

  // Single source of truth for every spectacle-distribution number on the
  // dashboard and in the PDF export — derived from the standardized
  // spectacle_status vocabulary, never hardcoded or computed differently
  // in more than one place.
  const getSpectacleStatusCount = (status: string) =>
    spectacleStatusResult.rows.find((row) => row.spectacle_status === status)
      ?.count ?? 0;

  const spectaclesRecommendedOnly = getSpectacleStatusCount(
    SPECTACLE_STATUS.RECOMMENDED
  );
  const spectaclesReceivedOnly = getSpectacleStatusCount(SPECTACLE_STATUS.RECEIVED);
  const spectaclesCollected = getSpectacleStatusCount(SPECTACLE_STATUS.COLLECTED);

  const spectaclesTotalRecommendations =
    spectaclesRecommendedOnly + spectaclesReceivedOnly + spectaclesCollected;
  const spectaclesPending = spectaclesRecommendedOnly;
  const spectaclesReceived = spectaclesReceivedOnly + spectaclesCollected;

  const spectacleTotal = spectacleTotalResult.rows[0]?.count ?? 0;
  const nerveTotal = nerveTotalResult.rows[0]?.count ?? 0;
  const nerveSelected = nerveSelectedResult.rows[0]?.count ?? 0;

  return {
    total_patients: totalPatientsResult.rows[0]?.count ?? 0,
    operations_selected: operationsSelected,
    spectacles_recommended: spectaclesTotalRecommendations,
    cataract_cases: cataractResult.rows[0]?.count ?? 0,
    average_age: ageResult.rows[0]?.average_age ?? null,
    gender: genderResult.rows,
    age_groups: ageGroupResult.rows,
    location_distribution: locationResult.rows,
    operation_types: operationTypeResult.rows,
    affected_eye: affectedEyeResult.rows,
    final_assessment: operationStatusResult.rows,
    operation_selection_rate:
      nerveTotal > 0 ? Math.round((nerveSelected / nerveTotal) * 100) : 0,
    spectacle_recommendation_rate:
      spectacleTotal > 0
        ? Math.round((spectaclesTotalRecommendations / spectacleTotal) * 100)
        : 0,
    spectacle_distribution: {
      pending: spectaclesPending,
      received: spectaclesReceived,
      collected: spectaclesCollected,
      received_rate:
        spectaclesTotalRecommendations > 0
          ? Math.round(
              (spectaclesReceived / spectaclesTotalRecommendations) * 100
            )
          : 0,
    },
  };
};

export default getDoctorDashboardStats;
