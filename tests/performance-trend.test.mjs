import assert from "node:assert/strict";
import { aggregateVolumeTrend } from "../src/performance.js";

const sessions = [
  { date: "2026-05-31", workoutName: "Upper", totalVolume: 1000 },
  { date: "2026-06-01", workoutName: "Lower", totalVolume: 2000 },
  { date: "2026-06-06", workoutName: "Padel Strength", totalVolume: 500 },
  { date: "2026-06-07", workoutName: "Upper", totalVolume: 3000 }
];

assert.deepEqual(
  aggregateVolumeTrend(sessions, "daily").map(({ key, totalVolume }) => ({ key, totalVolume })),
  [
    { key: "2026-05-31", totalVolume: 1000 },
    { key: "2026-06-01", totalVolume: 2000 },
    { key: "2026-06-06", totalVolume: 500 },
    { key: "2026-06-07", totalVolume: 3000 }
  ]
);

assert.deepEqual(
  aggregateVolumeTrend(sessions, "weekly").map(({ key, totalVolume, sessions: count }) => ({ key, totalVolume, count })),
  [
    { key: "2026-05-31", totalVolume: 3500, count: 3 },
    { key: "2026-06-07", totalVolume: 3000, count: 1 }
  ]
);

assert.deepEqual(
  aggregateVolumeTrend(sessions, "monthly").map(({ key, totalVolume, sessions: count }) => ({ key, totalVolume, count })),
  [
    { key: "2026-05", totalVolume: 1000, count: 1 },
    { key: "2026-06", totalVolume: 5500, count: 3 }
  ]
);

assert.deepEqual(aggregateVolumeTrend([], "weekly"), []);
assert.equal(aggregateVolumeTrend(sessions, "unknown").length, 4);

console.log("Performance trend aggregation tests passed.");
