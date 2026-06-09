import { bestExercisePerformance, detectExercisePrs, summarizeWorkoutSession } from "./performance.js";

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

export function dayStatus(date, { workoutLogs = {}, nutritionLogs = {}, padelLogs = {}, plan }) {
  const workout = workoutLogs[date];
  const nutrition = nutritionLogs[date];
  const padel = padelLogs[date];
  const day = plan?.days?.[dateFrom(date).getDay()];
  const scheduledWorkout = !!day?.exercises?.length;
  const pastOrToday = date <= todayKey();

  return {
    workoutCompleted: !!workout?.completed,
    nutritionAdhered: nutrition?.adhered === "yes",
    padelCompleted: !!padel?.completed,
    padelScheduled: !!day?.hasPadel,
    missed: pastOrToday && scheduledWorkout && !workout?.completed,
    hasAnyData: !!workout || !!nutrition || !!padel
  };
}

export function dayHistory(date, data) {
  const { workoutLogs = {}, dailyLogs = {}, nutritionLogs = {}, padelLogs = {}, plan } = data;
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
    padel: padelLogs[date] || null
  };
}
