import { pool } from "../../../db";

const searchLocation = async (search: string) => {
  const locations = await pool.query(
    `
    SELECT
        id,
        location
    FROM location
    WHERE (
        $1 = ''
        OR location ILIKE '%' || $1 || '%'
    )
    ORDER BY location
    LIMIT 20
    `,
    [search]
  );

  return locations.rows;
};

export default searchLocation;