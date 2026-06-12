import assert from "node:assert/strict";
import {
  calculateCaloriesFromMacros,
  calculateDailyNutritionTotals,
  calculateEntryCalories,
  calculateMacroCalories,
  calculateMacroPercentages,
  calculateRemainingNutrition,
  validateNutritionEntry
} from "../src/nutritionEngine.js";

assert.equal(calculateCaloriesFromMacros(10, 10, 10), 170);
assert.deepEqual(calculateMacroCalories(10, 10, 10), { protein: 40, carbs: 40, fat: 90, total: 170 });

const automatic = { protein: 40, carbs: 60, fat: 15, calorieMode: "auto" };
assert.equal(calculateEntryCalories(automatic), 535);
assert.equal(calculateEntryCalories({ ...automatic, calorieMode: "manual", manualCalories: 500 }), 500);

const entries = [
  { id: "meal", protein: 40, carbs: 60, fat: 15, calorieMode: "auto" },
  { id: "snack", protein: 20, carbs: 15, fat: 3, calorieMode: "auto" },
  { id: "deleted", protein: 100, carbs: 100, fat: 100, isDeleted: true }
];
assert.deepEqual(calculateDailyNutritionTotals(entries, {}), {
  calories: 702,
  protein: 60,
  carbs: 75,
  fat: 18,
  source: "entries",
  entryCount: 2
});

assert.deepEqual(calculateDailyNutritionTotals([], {
  actualCalories: 900,
  actualProtein: 80,
  actualCarbs: 90,
  actualFats: 25
}), { calories: 900, protein: 80, carbs: 90, fat: 25, source: "legacy", entryCount: 0 });

assert.deepEqual(calculateDailyNutritionTotals([], {
  targetCalories: 2200,
  targetProtein: 190,
  targetCarbs: 200,
  targetFats: 71
}), { calories: 0, protein: 0, carbs: 0, fat: 0, source: "empty", entryCount: 0 });

assert.deepEqual(calculateRemainingNutrition(
  { calories: 2200, protein: 190, carbs: 200, fat: 71 },
  { calories: 2300, protein: 190, carbs: 155, fat: 79 }
), { calories: -100, protein: 0, carbs: 45, fat: -8 });

assert.deepEqual(calculateMacroPercentages({ protein: 10, carbs: 10, fat: 10 }), {
  protein: 24,
  carbs: 24,
  fat: 52,
  calories: { protein: 40, carbs: 40, fat: 90, total: 170 }
});

assert.deepEqual(validateNutritionEntry({ type: "meal", name: "Breakfast", protein: 10, carbs: 20, fat: 5 }), { valid: true, errors: [] });
assert.equal(validateNutritionEntry({ type: "invalid", name: "", protein: -1 }).valid, false);

console.log("Nutrition engine calculations and compatibility behavior passed.");
