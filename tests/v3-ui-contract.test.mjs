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
  ,"history-intelligence"
  ,"history-calendar-instrument"
  ,"selected-day-intelligence"
  ,"activity-timeline"
  ,"nutrition-cockpit"
  ,"macro-instrument-grid"
  ,"daily-log-cockpit"
  ,"log-section"
  ,"profile-cockpit"
  ,"admin-workspace-tabs"
  ,"admin-workspace-panel"
  ,"admin-exercise-disclosure"
  ,"liquid-bottom-nav"
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
  ,".history-intelligence"
  ,".nutrition-cockpit"
  ,".daily-log-cockpit"
  ,".profile-cockpit"
  ,".admin-workspace-tabs"
  ,".liquid-bottom-nav"
  ,"@keyframes screenIn"
];

for (const contract of requiredCssContracts) {
  assert.ok(css.includes(contract), `src/styles.css must define the V3 contract: ${contract}`);
}

assert.ok(app.includes('"start-today"'), "Home must preserve the Start Workout action contract");
assert.match(app, /data-action="pause-workout"/, "Active Workout must preserve pause");
assert.match(app, /data-action="resume-workout"/, "Active Workout must preserve resume");
assert.match(app, /data-action="cancel-workout"/, "Active Workout must preserve safe cancellation");
assert.match(app, /data-action="finish-workout"/, "Active Workout must preserve finish confirmation");
assert.match(app, /data-action="admin-create-user"/, "Admin Workspace must preserve secure user creation");
assert.doesNotMatch(app, /signUp\(/, "Public signup must remain absent from the UI implementation");
assert.ok(app.includes("Object.values(state.workoutLogs"), "Profile metrics must support the keyed workout-log storage model");
assert.match(css, /\.admin-user-row\s*\{\s*display:\s*grid;/, "Admin user rows must use a shrink-safe grid at 320px");
assert.match(app, /buildReadinessModel/, "Home readiness must come from the tested presentation model");
assert.match(app, /data-action="open-recovery"/, "Readiness must open the recovery log instead of changing theme");
assert.doesNotMatch(app, /function readinessScore\(/, "The fabricated default readiness helper must be removed");
assert.match(app, /avatar-editor-stage/, "Profile upload must open the position and zoom editor");
assert.match(css, /\.avatar-editor-stage/, "The avatar editor must define a stable crop frame");

console.log("Performance Instrument V3 UI contracts are present.");
