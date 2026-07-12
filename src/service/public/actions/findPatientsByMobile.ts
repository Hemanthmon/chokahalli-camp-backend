import { pool } from "../../../db";

// Intentionally minimal projection — this powers the public disambiguation
// screen when one mobile number matches several family members, and must
// never leak address/status/etc. at this step (only the final, re-scoped
// lookup by mobile + token does that).
const findPatientsByMobile = async (mobile: string) => {
  const result = await pool.query(
    `
    SELECT token_number, name
    FROM patients
    WHERE mobile = $1
    ORDER BY CAST(token_number AS INTEGER) ASC
    `,
    [mobile]
  );

  return result.rows;
};

export default findPatientsByMobile;
