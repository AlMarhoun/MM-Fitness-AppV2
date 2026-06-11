import assert from "node:assert/strict";
import { buildProgressCockpitModel } from "../src/progressCockpit.js";
import { summarizeProgress } from "../src/performance.js";

const empty = buildProgressCockpitModel({
  performance: { sessions: [], totalVolume: 0, bestByExercise: [], prList: [] },
  workoutLogs: {},
  dailyLogs: {},
  nutritionLogs: {},
  activityLogs: {},
  padelLogs: {},
  nowDate: "2026-06-12",
  startWeight: 102.5,
  targetWeight: 90,
  planWeek: 10,
  planWeeks: 36
});

assert.equal(empty.insight.tone, "empty");
assert.equal(empty.latestWorkoutVolume, 0);
assert.equal(empty.nextFocus, "Complete two weighted workouts to build your first strength trend.");
assert.equal(empty.body.hasData, false);

const partial = buildProgressCockpitModel({
  performance: { sessions: [{ date: "2026-06-11", workoutName: "Upper", totalVolume: 3000, exercises: [] }], totalVolume: 3000, bestByExercise: [], prList: [] },
  workoutLogs: { "2026-06-11": { completed: true } },
  dailyLogs: {}, nutritionLogs: {}, activityLogs: {}, padelLogs: {},
  nowDate: "2026-06-12", startWeight: 102.5, targetWeight: 90, planWeek: 10, planWeeks: 36
});
assert.equal(partial.nextFocus, "Complete one more weighted workout to build your first strength trend.");

const performance = {
  sessions: [
    {
      date: "2026-06-08",
      workoutName: "Upper",
      totalVolume: 4000,
      completedSets: 8,
      exercises: [{ exerciseName: "Bench Press", bestWeight: 70, bestReps: 8, bestEstimatedOneRepMax: 88.7, totalVolume: 1680 }]
    },
    {
      date: "2026-06-11",
      workoutName: "Upper",
      totalVolume: 4600,
      completedSets: 9,
      exercises: [{ exerciseName: "Bench Press", bestWeight: 72.5, bestReps: 8, bestEstimatedOneRepMax: 91.8, totalVolume: 1740 }]
    }
  ],
  totalVolume: 8600,
  bestByExercise: [{ exerciseName: "Bench Press", bestWeight: 72.5, bestReps: 8, bestEstimatedOneRepMax: 91.8, totalVolume: 1740 }],
  prList: [{ date: "2026-06-11", exerciseName: "Bench Press", label: "New estimated 1RM", type: "estimated_1rm" }]
};

const model = buildProgressCockpitModel({
  performance,
  workoutLogs: {
    "2026-06-08": { completed: true },
    "2026-06-11": { completed: true }
  },
  dailyLogs: {
    "2026-06-10": { bodyWeight: 99.4, waist: 94, sleepScore: 4, energyScore: 4, sorenessScore: 2, achillesScore: 1 },
    "2026-06-12": { bodyWeight: 99.1, waist: 93.5, sleepScore: 5, energyScore: 4, sorenessScore: 2, achillesScore: 1 }
  },
  nutritionLogs: {
    "2026-06-08": { adhered: "yes" },
    "2026-06-09": { adhered: "yes" }
  },
  activityLogs: {
    "2026-06-09": [{ type: "padel", completed: true }],
    "2026-06-10": [{ type: "swimming", completed: true }]
  },
  padelLogs: {},
  nowDate: "2026-06-12",
  startWeight: 102.5,
  targetWeight: 90,
  planWeek: 10,
  planWeeks: 36
});

assert.equal(model.latestWorkoutVolume, 4600);
assert.equal(model.volume.latestDeltaPercent, 15);
assert.equal(model.insight.tone, "positive");
assert.equal(model.strength.top[0].exerciseName, "Bench Press");
assert.equal(model.prs[0].newValue, 91.8);
assert.equal(model.prs[0].oldValue, 88.7);
assert.equal(model.consistency.swimming, 1);
assert.equal(model.body.latestWeight, 99.1);
assert.equal(model.body.weightDelta, -0.3);
assert.equal(model.recovery.hasData, true);

const plan = {
  days: [{ category: "Upper", exercises: [{ name: "Bench Press", sets: 1, reps: "8" }] }]
};
const mixedLogs = {
  "2026-06-01": { completed: true, dayIndex: 0, sets: { "0-0": { done: true, weight: 70, reps: 8 } } },
  "2026-06-08": {
    completed: true,
    dayIndex: 0,
    exerciseSnapshots: [{
      exerciseIndex: 0,
      exerciseName: "Incline Bench Press",
      completedSets: 1,
      totalVolume: 600,
      bestEstimatedOneRepMax: 100,
      loggedSets: [{ key: "0-0", setIndex: 0, done: true, weight: 75, reps: 8, volume: 600, estimatedOneRepMax: 95 }]
    }]
  }
};
const mixed = summarizeProgress(mixedLogs, plan);
assert.equal(mixed.sessions.length, 2);
assert.equal(mixed.sessions[0].exercises[0].exerciseName, "Bench Press");
assert.equal(mixed.sessions[1].exercises[0].exerciseName, "Incline Bench Press");

console.log("Progress cockpit model and snapshot fallback tests passed.");
