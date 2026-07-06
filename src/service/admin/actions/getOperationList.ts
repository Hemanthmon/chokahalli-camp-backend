import { CHECKUPS } from "../../../common/constants";
import { pool } from "../../../db";

const getOperationList = async () => {
  const result = await pool.query(
    `
    SELECT
        p.id,
        p.token_number,
        p.name,
        p.mobile,
        l.location AS address,
        slc.affected_eye,
        slc.remarks AS slit_lamp_remarks,
        orec.operation_type,
        orec.operation_status
    FROM operation_recommendations orec

    INNER JOIN patient_checkups pc_op
        ON pc_op.id = orec.patient_checkup_id

    INNER JOIN patients p
        ON p.id = pc_op.patient_id

    LEFT JOIN location l
        ON l.id = p.location_id

    LEFT JOIN patient_checkups pc_slit
        ON pc_slit.patient_id = p.id
        AND pc_slit.checkup_id = $1

    LEFT JOIN slit_lamp_checkups slc
        ON slc.patient_checkup_id = pc_slit.id

    ORDER BY CAST(p.token_number AS INTEGER) ASC
    `,
    [CHECKUPS.SLIT_LAMP_CHECKUP]
  );

  return result.rows;
};

export default getOperationList;
