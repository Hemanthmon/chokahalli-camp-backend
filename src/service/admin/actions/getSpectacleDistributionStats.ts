import { SPECTACLE_STATUS } from "../../../common/constants";
import { pool } from "../../../db";

interface VillageBucket {
  pending: number;
  receivedOnly: number;
  collected: number;
}

// One grouped query feeds both the village breakdown and the camp-wide
// totals (by summing the village rows) — avoids running the same
// aggregation twice, and keeps this in sync with the same
// RECOMMENDED / RECEIVED+COLLECTED / COLLECTED logic used on the doctor
// dashboard, rather than recomputing it a third way.
const getSpectacleDistributionStats = async () => {
  const result = await pool.query(
    `
    SELECT
        COALESCE(l.location, 'Unknown') AS village,
        sc.spectacle_status,
        COUNT(*)::int AS count
    FROM spectacle_corrections sc
    INNER JOIN patient_checkups pc ON pc.id = sc.patient_checkup_id
    INNER JOIN patients p ON p.id = pc.patient_id
    LEFT JOIN location l ON l.id = p.location_id
    WHERE sc.spectacle_status = ANY($1)
    GROUP BY village, sc.spectacle_status
    `,
    [
      [
        SPECTACLE_STATUS.RECOMMENDED,
        SPECTACLE_STATUS.RECEIVED,
        SPECTACLE_STATUS.COLLECTED,
      ],
    ]
  );

  const villageMap = new Map<string, VillageBucket>();

  for (const row of result.rows) {
    const bucket = villageMap.get(row.village) ?? {
      pending: 0,
      receivedOnly: 0,
      collected: 0,
    };

    if (row.spectacle_status === SPECTACLE_STATUS.RECOMMENDED) {
      bucket.pending = row.count;
    } else if (row.spectacle_status === SPECTACLE_STATUS.RECEIVED) {
      bucket.receivedOnly = row.count;
    } else if (row.spectacle_status === SPECTACLE_STATUS.COLLECTED) {
      bucket.collected = row.count;
    }

    villageMap.set(row.village, bucket);
  }

  const villageDistribution = Array.from(villageMap.entries())
    .map(([village, bucket]) => {
      const received = bucket.receivedOnly + bucket.collected;
      const total = bucket.pending + received;

      return {
        village,
        pending: bucket.pending,
        received,
        collected: bucket.collected,
        awaiting_collection: total - bucket.collected,
        total,
      };
    })
    .sort((a, b) => b.awaiting_collection - a.awaiting_collection);

  const totals = villageDistribution.reduce(
    (acc, row) => ({
      pending: acc.pending + row.pending,
      received: acc.received + row.received,
      collected: acc.collected + row.collected,
      total: acc.total + row.total,
    }),
    { pending: 0, received: 0, collected: 0, total: 0 }
  );

  return {
    total_recommendations: totals.total,
    pending: totals.pending,
    received: totals.received,
    collected: totals.collected,
    received_rate:
      totals.total > 0 ? Math.round((totals.received / totals.total) * 100) : 0,
    collected_rate:
      totals.total > 0 ? Math.round((totals.collected / totals.total) * 100) : 0,
    village_distribution: villageDistribution,
  };
};

export default getSpectacleDistributionStats;
