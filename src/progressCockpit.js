function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseDate(key) {
  const date = new Date(`${key}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekDates(nowDate) {
  const date = parseDate(nowDate);
  if (!date) return [];
  date.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const item = new Date(date);
    item.setDate(date.getDate() + index);
    return dateKey(item);
  });
}

function monthDates(nowDate) {
  const date = parseDate(nowDate);
  if (!date) return [];
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0, 12).getDate();
  return Array.from({ length: lastDay }, (_, index) => dateKey(new Date(year, month, index + 1, 12)))
    .filter((key) => key <= nowDate);
}

function countActivities(activityLogs = {}, legacyPadelLogs = {}, dates, type) {
  return dates.reduce((total, date) => {
    const current = (activityLogs[date] || []).filter((activity) => activity?.completed !== false && activity.type === type).length;
    const legacy = type === "padel" && !current && legacyPadelLogs[date]?.completed ? 1 : 0;
    return total + current + legacy;
  }, 0);
}

function exerciseMetric(pr) {
  const type = pr.type || "";
  const label = String(pr.label || "").toLowerCase();
  if (type === "best_weight" || label.includes("weight")) return { type: "Weight", key: "bestWeight", unit: "kg" };
  if (type === "best_reps" || label.includes("rep")) return { type: "Reps", key: "bestReps", unit: "reps" };
  if (type === "estimated_1rm" || label.includes("1rm")) return { type: "Estimated 1RM", key: "bestEstimatedOneRepMax", unit: "kg" };
  if (type === "set_volume" || label.includes("set volume")) return { type: "Set volume", key: "bestSetVolume", unit: "kg" };
  return { type: "Exercise volume", key: "totalVolume", unit: "kg" };
}

function enrichPr(pr, sessions) {
  const metric = exerciseMetric(pr);
  const currentSession = sessions.find((session) => session.date === pr.date);
  const currentExercise = currentSession?.exercises?.find((exercise) => exercise.exerciseName === pr.exerciseName);
  const previousValues = sessions
    .filter((session) => session.date < pr.date)
    .flatMap((session) => session.exercises || [])
    .filter((exercise) => exercise.exerciseName === pr.exerciseName)
    .map((exercise) => Number(exercise[metric.key] || 0))
    .filter((value) => value > 0);
  const newValue = Number(currentExercise?.[metric.key] || 0) || null;
  const oldValue = previousValues.length ? Math.max(...previousValues) : null;
  return { ...pr, typeLabel: metric.type, unit: metric.unit, oldValue, newValue };
}

function average(values) {
  const valid = values.map(Number).filter((value) => Number.isFinite(value) && value > 0);
  return valid.length ? round(valid.reduce((sum, value) => sum + value, 0) / valid.length, 1) : null;
}

function bodyModel(dailyLogs = {}, startWeight, targetWeight) {
  const entries = Object.entries(dailyLogs)
    .filter(([, log]) => Number(log?.bodyWeight) > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  const latest = entries.at(-1);
  const previous = entries.at(-2);
  const latestWeight = latest ? Number(latest[1].bodyWeight) : null;
  const previousWeight = previous ? Number(previous[1].bodyWeight) : null;
  const latestWaistEntry = Object.entries(dailyLogs)
    .filter(([, log]) => Number(log?.waist) > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .at(-1);
  return {
    hasData: !!latest,
    latestWeight,
    latestDate: latest?.[0] || null,
    latestWaist: latestWaistEntry ? Number(latestWaistEntry[1].waist) : null,
    weightDelta: latestWeight && previousWeight ? round(latestWeight - previousWeight, 1) : null,
    changeFromStart: latestWeight ? round(latestWeight - Number(startWeight || latestWeight), 1) : null,
    targetDistance: latestWeight ? round(latestWeight - Number(targetWeight || latestWeight), 1) : null,
    trend: entries.slice(-8).map(([date, log]) => ({ date, value: Number(log.bodyWeight) }))
  };
}

function recoveryModel(dailyLogs = {}, nowDate) {
  const cutoff = parseDate(nowDate);
  if (!cutoff) return { hasData: false };
  cutoff.setDate(cutoff.getDate() - 6);
  const entries = Object.entries(dailyLogs).filter(([date]) => date >= dateKey(cutoff) && date <= nowDate).map(([, log]) => log);
  const sleep = average(entries.map((log) => log.sleepScore));
  const energy = average(entries.map((log) => log.energyScore));
  const soreness = average(entries.map((log) => log.sorenessScore));
  const achilles = average(entries.map((log) => log.achillesScore));
  return { hasData: [sleep, energy, soreness, achilles].some((value) => value !== null), sleep, energy, soreness, achilles };
}

export function buildProgressCockpitModel({
  performance = {}, workoutLogs = {}, dailyLogs = {}, nutritionLogs = {}, activityLogs = {}, padelLogs = {},
  nowDate, startWeight, targetWeight, planWeek, planWeeks, weeklyWorkoutTarget = 5
} = {}) {
  const sessions = [...(performance.sessions || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const latest = sessions.at(-1) || null;
  const previous = sessions.at(-2) || null;
  const weeklyDates = weekDates(nowDate);
  const monthlyDates = monthDates(nowDate);
  const weeklyVolume = sessions.filter((session) => weeklyDates.includes(session.date)).reduce((sum, session) => sum + Number(session.totalVolume || 0), 0);
  const monthlyVolume = sessions.filter((session) => monthlyDates.includes(session.date)).reduce((sum, session) => sum + Number(session.totalVolume || 0), 0);
  const latestDeltaPercent = latest?.totalVolume && previous?.totalVolume
    ? round(((latest.totalVolume - previous.totalVolume) / previous.totalVolume) * 100, 1)
    : null;
  const prs = (performance.prList || []).map((pr) => enrichPr(pr, sessions));
  const weekPrs = prs.filter((pr) => weeklyDates.includes(pr.date));
  const weeklyWorkouts = weeklyDates.filter((date) => workoutLogs[date]?.completed).length;
  const monthlyWorkouts = monthlyDates.filter((date) => workoutLogs[date]?.completed).length;
  const elapsedWeeks = Math.max(1, Math.ceil(monthlyDates.length / 7));
  const nutrition = weeklyDates.filter((date) => nutritionLogs[date]?.adhered === "yes").length;
  const consistency = {
    workouts: weeklyWorkouts,
    padel: countActivities(activityLogs, padelLogs, weeklyDates, "padel"),
    swimming: countActivities(activityLogs, padelLogs, weeklyDates, "swimming"),
    nutrition,
    weeklyPercent: Math.min(100, Math.round((weeklyWorkouts / weeklyWorkoutTarget) * 100)),
    monthlyWorkouts,
    monthlyPercent: Math.min(100, Math.round((monthlyWorkouts / (weeklyWorkoutTarget * elapsedWeeks)) * 100))
  };
  const strengthTop = (performance.bestByExercise || []).slice(0, 3).map((best) => {
    const latestExercise = [...sessions].reverse()
      .flatMap((session) => (session.exercises || []).map((exercise) => ({ ...exercise, date: session.date })))
      .find((exercise) => exercise.exerciseName === best.exerciseName);
    return {
      ...best,
      latestEstimatedOneRepMax: latestExercise?.bestEstimatedOneRepMax || null,
      latestWeight: latestExercise?.bestWeight || null,
      latestReps: latestExercise?.bestReps || null,
      latestDate: latestExercise?.date || best.lastDate || null
    };
  });

  let insight = { tone: "empty", eyebrow: "Building baseline", title: "Not enough performance data yet", detail: "Complete two weighted workouts to unlock a reliable strength and volume signal." };
  if (weekPrs.length) {
    insight = { tone: "positive", eyebrow: "Strongest signal", title: `${weekPrs.length} new PR${weekPrs.length === 1 ? "" : "s"} this week`, detail: `${weekPrs[0].exerciseName} produced your latest performance breakthrough.` };
  } else if (latestDeltaPercent !== null && latestDeltaPercent > 0) {
    insight = { tone: "positive", eyebrow: "Strongest signal", title: "Strength volume is trending up", detail: `Your latest session volume increased ${latestDeltaPercent}% versus the previous session.` };
  } else if (consistency.weeklyPercent >= 60) {
    insight = { tone: "steady", eyebrow: "Strongest signal", title: "Workout consistency is building", detail: `${weeklyWorkouts} of ${weeklyWorkoutTarget} planned sessions are complete this week.` };
  } else if (sessions.length) {
    insight = { tone: "steady", eyebrow: "Current signal", title: "Performance baseline in progress", detail: "Keep logging complete weighted sets to reveal a trustworthy strength direction." };
  }

  let nextFocus = sessions.length === 1
    ? "Complete one more weighted workout to build your first strength trend."
    : "Complete two weighted workouts to build your first strength trend.";
  if (sessions.length >= 2 && nutrition < 4) nextFocus = "Nutrition adherence is light this week. Log the next meal day to complete the picture.";
  else if (sessions.length >= 2 && weeklyWorkouts < weeklyWorkoutTarget) nextFocus = `Complete ${weeklyWorkoutTarget - weeklyWorkouts} more workout${weeklyWorkoutTarget - weeklyWorkouts === 1 ? "" : "s"} to reach this week's training target.`;
  else if (weekPrs.length) nextFocus = `Protect the new ${weekPrs[0].exerciseName} benchmark and progress with controlled form.`;

  return {
    latestWorkoutVolume: Number(latest?.totalVolume || 0),
    latestPrCount: weekPrs.length,
    planProgress: planWeeks ? Math.min(100, Math.round((Number(planWeek || 0) / planWeeks) * 100)) : 0,
    insight,
    nextFocus,
    volume: { total: Number(performance.totalVolume || 0), weekly: round(weeklyVolume, 1) || 0, monthly: round(monthlyVolume, 1) || 0, latest: Number(latest?.totalVolume || 0), previous: Number(previous?.totalVolume || 0), latestDeltaPercent },
    strength: { top: strengthTop },
    prs,
    consistency,
    body: bodyModel(dailyLogs, startWeight, targetWeight),
    recovery: recoveryModel(dailyLogs, nowDate)
  };
}
