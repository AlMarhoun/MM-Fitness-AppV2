import assert from "node:assert/strict";
import { activityCount, activitiesForDate, addActivity, removeActivity } from "../src/activities.js";

const initial = {};
const withPadel = addActivity(initial, {
  date: "2026-06-12",
  type: "padel",
  duration: 90,
  intensity: "moderate",
  completed: true
}, "activity-1");
const withBoth = addActivity(withPadel, {
  date: "2026-06-12",
  type: "swimming",
  duration: 35,
  intensity: "easy",
  completed: true
}, "activity-2");

assert.equal(activitiesForDate(withBoth, "2026-06-12").length, 2);
assert.equal(activityCount(withBoth, "padel"), 1);
assert.equal(activityCount(withBoth, "swimming"), 1);
assert.equal(removeActivity(withBoth, "2026-06-12", "activity-1")["2026-06-12"].length, 1);

const legacy = activitiesForDate({}, "2026-06-13", {
  "2026-06-13": { completed: true, duration: 60, time: "7:00 PM" }
});
assert.equal(legacy.length, 1);
assert.equal(legacy[0].type, "padel");
assert.equal(legacy[0].source, "legacy");

console.log("Activity logging tests passed.");
