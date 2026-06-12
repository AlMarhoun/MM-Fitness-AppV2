import assert from "node:assert/strict";
import { buildReadinessModel } from "../src/readiness.js";

const missing = buildReadinessModel({ energyScore: 4, sleepScore: 5 });
assert.equal(missing.hasScore, false);
assert.equal(missing.score, null);
assert.deepEqual(missing.missing, ["soreness", "Achilles"]);
assert.equal(missing.label, "Recovery Check");

const complete = buildReadinessModel({
  energyScore: 4,
  sleepScore: 5,
  sorenessScore: 2,
  achillesScore: 1
});
assert.equal(complete.hasScore, true);
assert.equal(complete.score, 90);
assert.equal(complete.label, "Today's Readiness");
assert.equal(complete.status, "Ready");

const moderate = buildReadinessModel({
  energyScore: 3,
  sleepScore: 3,
  sorenessScore: 3,
  achillesScore: 3
});
assert.equal(moderate.score, 60);
assert.equal(moderate.status, "Moderate");

const reduced = buildReadinessModel({
  energyScore: 1,
  sleepScore: 2,
  sorenessScore: 5,
  achillesScore: 5
});
assert.equal(reduced.score, 25);
assert.equal(reduced.status, "Reduce intensity");

console.log("Readiness model tests passed.");
