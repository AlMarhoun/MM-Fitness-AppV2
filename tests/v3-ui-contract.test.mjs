import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");

const requiredAppContracts = [
  "mission-stage",
  "mission-readiness",
  "mission-instruments",
  "workout-hud",
  "active-workout-shell",
  "active-set",
  "workout-finish-dock"
  ,"performance-cockpit"
  ,"primary-insight-card"
  ,"volume-intelligence"
  ,"strength-leaderboard"
  ,"pr-timeline"
  ,"consistency-strip"
  ,"body-metric-trend"
  ,"recovery-pattern"
];

for (const contract of requiredAppContracts) {
  assert.ok(app.includes(contract), `src/app.js must render the V3 contract: ${contract}`);
}

const requiredCssContracts = [
  "--v3-canvas",
  ".mission-stage",
  ".workout-hud",
  ".set-row.active-set",
  ".workout-finish-dock",
  "prefers-reduced-motion: reduce"
  ,".performance-cockpit"
  ,".primary-insight-card"
  ,".volume-intelligence"
  ,".strength-leaderboard"
  ,".pr-timeline"
];

for (const contract of requiredCssContracts) {
  assert.ok(css.includes(contract), `src/styles.css must define the V3 contract: ${contract}`);
}

assert.ok(app.includes('"start-today"'), "Home must preserve the Start Workout action contract");
assert.match(app, /data-action="pause-workout"/, "Active Workout must preserve pause");
assert.match(app, /data-action="resume-workout"/, "Active Workout must preserve resume");
assert.match(app, /data-action="cancel-workout"/, "Active Workout must preserve safe cancellation");
assert.match(app, /data-action="finish-workout"/, "Active Workout must preserve finish confirmation");

console.log("Performance Instrument V3 UI contracts are present.");
