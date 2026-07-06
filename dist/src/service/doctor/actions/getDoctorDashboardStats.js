"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../../db");
const getDoctorDashboardStats = async () => {
    const [totalPatientsResult, genderResult, ageResult, ageGroupResult, locationResult, cataractResult, spectacleResult, spectacleTotalResult, operationTypeResult, operationStatusResult, nerveTotalResult, nerveSelectedResult,] = await Promise.all([
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM patients`),
        db_1.pool.query(`SELECT gender, COUNT(*)::int AS count FROM patients GROUP BY gender`),
        db_1.pool.query(`SELECT ROUND(AVG(age))::int AS average_age FROM patients WHERE age IS NOT NULL`),
        db_1.pool.query(`
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
      `),
        db_1.pool.query(`
      SELECT l.location, COUNT(*)::int AS count
      FROM patients p
      INNER JOIN location l ON l.id = p.location_id
      GROUP BY l.location
      ORDER BY count DESC
      `),
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM slit_lamp_checkups WHERE cataract_present = true`),
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM spectacle_corrections WHERE spectacle_required = true`),
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM spectacle_corrections`),
        db_1.pool.query(`
      SELECT operation_type, COUNT(*)::int AS count
      FROM operation_recommendations
      WHERE operation_type IS NOT NULL
      GROUP BY operation_type
      ORDER BY count DESC
      `),
        db_1.pool.query(`
      SELECT operation_status, COUNT(*)::int AS count
      FROM operation_recommendations
      GROUP BY operation_status
      `),
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM nerve_assessments`),
        db_1.pool.query(`SELECT COUNT(*)::int AS count FROM nerve_assessments WHERE selected_for_operation = true`),
    ]);
    const affectedEyeResult = await db_1.pool.query(`
    SELECT affected_eye, COUNT(*)::int AS count
    FROM slit_lamp_checkups
    WHERE affected_eye IS NOT NULL
    GROUP BY affected_eye
    `);
    const operationsSelected = operationStatusResult.rows.find((row) => row.operation_status === "Approved")
        ?.count ?? 0;
    const spectacleTotal = spectacleTotalResult.rows[0]?.count ?? 0;
    const spectaclesRequired = spectacleResult.rows[0]?.count ?? 0;
    const nerveTotal = nerveTotalResult.rows[0]?.count ?? 0;
    const nerveSelected = nerveSelectedResult.rows[0]?.count ?? 0;
    return {
        total_patients: totalPatientsResult.rows[0]?.count ?? 0,
        operations_selected: operationsSelected,
        spectacles_recommended: spectaclesRequired,
        cataract_cases: cataractResult.rows[0]?.count ?? 0,
        average_age: ageResult.rows[0]?.average_age ?? null,
        gender: genderResult.rows,
        age_groups: ageGroupResult.rows,
        location_distribution: locationResult.rows,
        operation_types: operationTypeResult.rows,
        affected_eye: affectedEyeResult.rows,
        final_assessment: operationStatusResult.rows,
        operation_selection_rate: nerveTotal > 0 ? Math.round((nerveSelected / nerveTotal) * 100) : 0,
        spectacle_recommendation_rate: spectacleTotal > 0
            ? Math.round((spectaclesRequired / spectacleTotal) * 100)
            : 0,
    };
};
exports.default = getDoctorDashboardStats;
