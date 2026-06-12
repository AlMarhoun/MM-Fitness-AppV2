import { activitiesForDate } from "./activities.js?v=19";
import { bestExercisePerformance, detectExercisePrs, summarizeWorkoutSession } from "./performance.js?v=18";
import { activeNutritionEntries } from "./nutritionEngine.js?v=26";

function dateFrom(str) {
  return new Date(`${str}T12:00:00`);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayKey() {
  return dateKey(new Date());
}

export function monthCalendar(selectedDate, data) {
  const selected = dateFrom(selectedDate);
  const first = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    return {
      date: key,
      dayNumber: date.getDate(),
      inMonth: date.getMonth() === selected.getMonth(),
      isToday: key === todayKey(),
      isSelected: key === selectedDate,
      status: dayStatus(key, data)
    };
  });
}

export function dayStatus(date, { workoutLogs = {}, nutritionLogs = {}, nutritionEntries = {}, padelLogs = {}, activityLogs = {}, plan }) {
  const workout = workoutLogs[date];
  const nutrition = nutritionLogs[date];
  const entries = activeNutritionEntries(nutritionEntries[date] || []);
  const padel = padelLogs[date];
  const activities = activitiesForDate(activityLogs, date, padelLogs);
  const day = plan?.days?.[dateFrom(date).getDay()];
  const scheduledWorkout = !!day?.exercises?.length;
  const pastOrToday = date <= todayKey();

  return {
    workoutCompleted: !!workout?.completed,
    nutritionAdhered: nutrition?.adhered === "yes" || entries.length > 0,
    padelCompleted: activities.some((activity) => activity.completed && activity.type === "padel") || !!padel?.completed,
    swimmingCompleted: activities.some((activity) => activity.completed && activity.type === "swimming"),
    padelScheduled: !!day?.hasPadel,
    missed: pastOrToday && scheduledWorkout && !workout?.completed,
    hasAnyData: !!workout || !!nutrition || !!padel || activities.length > 0
  };
}

export function dayHistory(date, data) {
  const { workoutLogs = {}, dailyLogs = {}, nutritionLogs = {}, nutritionEntries = {}, padelLogs = {}, activityLogs = {}, plan } = data;
  const workout = workoutLogs[date] || null;
  const workoutSummary = workout?.completed ? summarizeWorkoutSession({ ...workout, date: workout.date || date }, plan) : null;
  const prs = [];

  if (workoutSummary) {
    for (const exercise of workoutSummary.exercises) {
      const previousBest = bestExercisePerformance(exercise.exerciseName, workoutLogs, plan, { beforeDate: date });
      const exercisePrs = detectExercisePrs(exercise, previousBest)
        .filter((pr) => pr.type !== "first_record")
        .map((pr) => ({ ...pr, exerciseName: exercise.exerciseName }));
      prs.push(...exercisePrs);
    }
  }

  return {
    date,
    status: dayStatus(date, data),
    workout,
    workoutSummary,
    prs,
    dailyLog: dailyLogs[date] || null,
    nutrition: nutritionLogs[date] || null,
    nutritionEntries: activeNutritionEntries(nutritionEntries[date] || []),
    padel: padelLogs[date] || null,
    activities: activitiesForDate(activityLogs, date, padelLogs)
  };
}
