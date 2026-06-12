const ENTRY_TYPES = new Set(["meal", "snack", "beverage"]);

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function round(value) {
  return Math.round((Number(value) || 0) * 10) / 10;
}

export function calculateMacroCalories(protein = 0, carbs = 0, fat = 0) {
  const calories = {
    protein: round(number(protein) * 4),
    carbs: round(number(carbs) * 4),
    fat: round(number(fat) * 9)
  };
  return { ...calories, total: round(calories.protein + calories.carbs + calories.fat) };
}

export function calculateCaloriesFromMacros(protein = 0, carbs = 0, fat = 0) {
  return calculateMacroCalories(protein, carbs, fat).total;
}

export function calculateEntryCalories(entry = {}) {
  if (entry.calorieMode === "manual" && entry.manualCalories !== "" && entry.manualCalories !== null && typeof entry.manualCalories !== "undefined") {
    return round(number(entry.manualCalories));
  }
  return calculateCaloriesFromMacros(entry.protein, entry.carbs, entry.fat);
}

export function activeNutritionEntries(entries = []) {
  return (Array.isArray(entries) ? entries : []).filter((entry) => entry && !entry.isDeleted);
}

export function calculateDailyNutritionTotals(entries = [], fallbackLog = {}) {
  const active = activeNutritionEntries(entries);
  if (!active.length) {
    const hasLegacyActuals = [
      fallbackLog.actualCalories,
      fallbackLog.actualProtein,
      fallbackLog.actualCarbs,
      fallbackLog.actualFats
    ].some((value) => value !== null && value !== "" && typeof value !== "undefined");
    return {
      calories: round(number(fallbackLog.actualCalories)),
      protein: round(number(fallbackLog.actualProtein)),
      carbs: round(number(fallbackLog.actualCarbs)),
      fat: round(number(fallbackLog.actualFats)),
      source: hasLegacyActuals ? "legacy" : "empty",
      entryCount: 0
    };
  }
  return active.reduce((totals, entry) => ({
    ...totals,
    calories: round(totals.calories + calculateEntryCalories(entry)),
    protein: round(totals.protein + number(entry.protein)),
    carbs: round(totals.carbs + number(entry.carbs)),
    fat: round(totals.fat + number(entry.fat))
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, source: "entries", entryCount: active.length });
}

export function calculateRemainingNutrition(targets = {}, totals = {}) {
  return {
    calories: round(number(targets.calories) - number(totals.calories)),
    protein: round(number(targets.protein) - number(totals.protein)),
    carbs: round(number(targets.carbs) - number(totals.carbs)),
    fat: round(number(targets.fat) - number(totals.fat))
  };
}

export function calculateNutritionCompletion(targets = {}, totals = {}) {
  const percentage = (actual, target) => target > 0 ? Math.round((number(actual) / number(target)) * 100) : 0;
  return {
    calories: percentage(totals.calories, targets.calories),
    protein: percentage(totals.protein, targets.protein),
    carbs: percentage(totals.carbs, targets.carbs),
    fat: percentage(totals.fat, targets.fat)
  };
}

export function calculateMacroPercentages(totals = {}) {
  const calories = calculateMacroCalories(totals.protein, totals.carbs, totals.fat);
  if (!calories.total) return { protein: 0, carbs: 0, fat: 0, calories };
  const protein = Math.round(calories.protein / calories.total * 100);
  const carbs = Math.round(calories.carbs / calories.total * 100);
  return { protein, carbs, fat: Math.max(0, 100 - protein - carbs), calories };
}

export function validateNutritionEntry(entry = {}) {
  const errors = [];
  if (!ENTRY_TYPES.has(entry.type)) errors.push("Choose meal, snack, or beverage");
  if (!String(entry.name || "").trim()) errors.push("Add a name");
  for (const field of ["protein", "carbs", "fat"]) {
    const value = Number(entry[field] ?? 0);
    if (!Number.isFinite(value) || value < 0) errors.push(`${field} must be zero or more`);
  }
  if (entry.calorieMode === "manual" && (!Number.isFinite(Number(entry.manualCalories)) || Number(entry.manualCalories) < 0)) {
    errors.push("Manual calories must be zero or more");
  }
  return { valid: errors.length === 0, errors };
}

export function nutritionTargets(day = {}, log = {}) {
  return {
    calories: number(log.targetCalories ?? day.calories),
    protein: number(log.targetProtein ?? day.protein),
    carbs: number(log.targetCarbs ?? day.carbs),
    fat: number(log.targetFat ?? log.targetFats ?? day.fats)
  };
}

export function createNutritionEntry(input = {}, id = `nutrition-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`) {
  const now = new Date().toISOString();
  return {
    id,
    type: ENTRY_TYPES.has(input.type) ? input.type : "meal",
    name: String(input.name || "").trim(),
    time: input.time || "",
    protein: round(number(input.protein)),
    carbs: round(number(input.carbs)),
    fat: round(number(input.fat)),
    calorieMode: input.calorieMode === "manual" ? "manual" : "auto",
    manualCalories: input.calorieMode === "manual" ? round(number(input.manualCalories)) : null,
    notes: String(input.notes || "").trim(),
    createdAt: input.createdAt || now,
    updatedAt: now,
    isDeleted: false
  };
}

export function entryFromSavedMeal(savedMeal = {}) {
  return createNutritionEntry({
    type: savedMeal.type,
    name: savedMeal.name,
    protein: savedMeal.protein,
    carbs: savedMeal.carbs,
    fat: savedMeal.fat,
    calorieMode: savedMeal.calorieMode,
    manualCalories: savedMeal.manualCalories,
    notes: savedMeal.notes
  });
}
