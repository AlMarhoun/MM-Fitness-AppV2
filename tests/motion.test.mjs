import assert from "node:assert/strict";
import {
  MOTION,
  motionDelay,
  normalizeProgress,
  shouldAnimateScreen
} from "../src/motion.js";

assert.equal(MOTION.fast, 160, "Fast feedback should remain gym-friendly");
assert.equal(MOTION.standard, 200, "Standard motion should use the approved timing");
assert.equal(MOTION.emphasis, 240, "Emphasis motion must remain below 250ms");

assert.equal(motionDelay(0), "0ms");
assert.equal(motionDelay(2), "110ms");
assert.equal(motionDelay(99), "280ms", "Staggers must be capped");
assert.equal(motionDelay(-2), "0ms");

assert.equal(normalizeProgress(42), 42);
assert.equal(normalizeProgress(200), 100);
assert.equal(normalizeProgress(-4), 0);
assert.equal(normalizeProgress("not-a-number"), 0);

assert.equal(shouldAnimateScreen(null, "home", false), true);
assert.equal(shouldAnimateScreen("home", "progress", false), true);
assert.equal(shouldAnimateScreen("active", "active", false), false, "Workout logging rerenders must not replay screen entrances");
assert.equal(shouldAnimateScreen("home", "progress", true), false, "Reduced motion must suppress screen entrances");

console.log("Performance Rhythm motion helpers are stable.");
