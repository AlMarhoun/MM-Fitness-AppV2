function toNumber(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseSetKey(key) {
  const [exerciseIndex, setIndex] = String(key).split("-").map(Number);
  if (!Number.isInteger(exerciseIndex) || !Number.isInteger(setIndex)) return null;
  return { exerciseIndex, setIndex };
}

function sessionExercises(session = {}, plan) {
  const snapshot = session.exerciseSnapshots || session.exercisesSnapshot || session.exercisesPerformed;
  if (Array.isArray(snapshot) && snapshot.length) {
    return snapshot.map((exercise, index) => ({
      exerciseId: exercise.exerciseId || exercise.id || null,
      name: exercise.exerciseName || exercise.name || `Exercise ${index + 1}`,
      sets: exercise.setsPrescription ?? exercise.sets,
      reps: exercise.repsPrescription ?? exercise.reps,
      intensity: exercise.intensity,
      rest: exercise.rest,
      notes: exercise.notes,
      loggedSets: Array.isArray(exercise.loggedSets) ? exercise.loggedSets : null
    }));
  }
  return plan?.days?.[session.dayIndex]?.exercises || [];
}

export function createWorkoutSessionSnapshot(activeWorkout = {}, plan, elapsedSeconds = 0) {
  const day = plan?.days?.[activeWorkout.dayIndex];
  const exercises = day?.exercises || [];
  const exerciseSnapshots = exercises.map((exercise, exerciseIndex) => {
    const loggedSets = Array.from({ length: Number(exercise.sets || 0) }, (_, setIndex) => {
      const key = `${exerciseIndex}-${setIndex}`;
      const raw = activeWorkout.sets?.[key] || {};
      const completed = normalizeCompletedSet(raw, {
        key,
        exerciseIndex,
        setIndex,
        exerciseName: exercise.name
      });
      return {
        key,
        setIndex,
        done: !!raw.done,
        weight: raw.weight ?? "",
        reps: raw.reps ?? "",
        volume: completed?.volume || null,
        estimatedOneRepMax: completed?.estimatedOneRepMax || null
      };
    });
    const completed = loggedSets
      .map((set) => normalizeCompletedSet(set, {
        key: set.key,
        exerciseIndex,
        setIndex: set.setIndex,
        exerciseName: exercise.name
      }))
      .filter(Boolean);
    const summary = summarizeExerciseSets(exercise.name, completed);
    return {
      exerciseId: exercise.id || null,
      exerciseIndex,
      exerciseName: exercise.name,
      setsPrescription: exercise.sets ?? null,
      repsPrescription: exercise.reps ?? null,
      intensity: exercise.intensity ?? "",
      rest: exercise.rest ?? null,
      notes: exercise.notes ?? "",
      loggedSets,
      completedSets: summary.completedSets,
      totalVolume: summary.totalVolume,
      bestEstimatedOneRepMax: summary.bestEstimatedOneRepMax
    };
  });

  return {
    completed: true,
    date: null,
    dayIndex: activeWorkout.dayIndex,
    workoutName: day?.workoutName || day?.category || "Workout",
    duration: Math.max(1, Math.round(elapsedSeconds / 60)),
    sets: activeWorkout.sets || {},
    exerciseSnapshots
  };
}

export function estimateOneRepMax(weight, reps) {
  const w = toNumber(weight);
  const r = toNumber(reps);
  if (!w || !r) return null;
  return round(w * (1 + r / 30), 1);
}

export function setVolume(set = {}) {
  if (!set.done) return null;
  const w = toNumber(set.weight);
  const r = toNumber(set.reps);
  if (!w || !r) return null;
  return round(w * r, 1);
}

export function normalizeCompletedSet(set = {}, meta = {}) {
  if (!set.done) return null;
  const weight = toNumber(set.weight);
  const reps = toNumber(set.reps);
  if (!weight || !reps) return null;
  const volume = setVolume(set);
  return {
    ...meta,
    weight,
    reps,
    volume,
    estimatedOneRepMax: estimateOneRepMax(weight, reps)
  };
}

export function summarizeExerciseSets(exerciseName, sets = []) {
  const completedSets = sets.filter(Boolean);
  const summary = {
    exerciseName,
    exerciseIndex: completedSets[0]?.exerciseIndex ?? null,
    completedSets: completedSets.length,
    totalVolume: round(completedSets.reduce((sum, set) => sum + (set.volume || 0), 0), 1),
    bestWeight: null,
    bestReps: null,
    bestEstimatedOneRepMax: null,
    bestSetVolume: null,
    bestSet: null
  };

  for (const set of completedSets) {
    if (!summary.bestWeight || set.weight > summary.bestWeight) summary.bestWeight = set.weight;
    if (!summary.bestReps || set.reps > summary.bestReps) summary.bestReps = set.reps;
    if (!summary.bestEstimatedOneRepMax || set.estimatedOneRepMax > summary.bestEstimatedOneRepMax) {
      summary.bestEstimatedOneRepMax = set.estimatedOneRepMax;
    }
    if (!summary.bestSetVolume || set.volume > summary.bestSetVolume) {
      summary.bestSetVolume = set.volume;
      summary.bestSet = set;
    }
  }

  return summary;
}

export function summarizeWorkoutSession(session = {}, plan) {
  const day = plan?.days?.[session.dayIndex];
  const exercisesSource = sessionExercises(session, plan);
  const exerciseMap = new Map();
  const sets = session.sets || {};

  if (Array.isArray(session.exerciseSnapshots) && session.exerciseSnapshots.length) {
    const exercises = session.exerciseSnapshots.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      exerciseIndex: exercise.exerciseIndex,
      completedSets: exercise.completedSets || 0,
      totalVolume: round(exercise.totalVolume || 0, 1),
      bestWeight: null,
      bestReps: null,
      bestEstimatedOneRepMax: exercise.bestEstimatedOneRepMax || null,
      bestSetVolume: null,
      bestSet: null,
      loggedSets: exercise.loggedSets || []
    }));
    for (const exercise of exercises) {
      for (const rawSet of exercise.loggedSets || []) {
        const completed = normalizeCompletedSet(rawSet, {
          key: rawSet.key,
          date: session.date,
          dayIndex: session.dayIndex,
          exerciseIndex: exercise.exerciseIndex,
          setIndex: rawSet.setIndex,
          exerciseName: exercise.exerciseName
        });
        if (!completed) continue;
        if (!exercise.bestWeight || completed.weight > exercise.bestWeight) exercise.bestWeight = completed.weight;
        if (!exercise.bestReps || completed.reps > exercise.bestReps) exercise.bestReps = completed.reps;
        if (!exercise.bestEstimatedOneRepMax || completed.estimatedOneRepMax > exercise.bestEstimatedOneRepMax) {
          exercise.bestEstimatedOneRepMax = completed.estimatedOneRepMax;
        }
        if (!exercise.bestSetVolume || completed.volume > exercise.bestSetVolume) {
          exercise.bestSetVolume = completed.volume;
          exercise.bestSet = completed;
        }
      }
    }
    return {
      date: session.date,
      dayIndex: session.dayIndex,
      workoutName: session.workoutName || day?.workoutName || day?.category || "Workout",
      duration: session.duration || 0,
      completedSets: exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0),
      totalVolume: round(exercises.reduce((sum, exercise) => sum + (exercise.totalVolume || 0), 0), 1),
      exercises,
      bestOneRepMaxHighlights: exercises
        .filter((exercise) => exercise.bestEstimatedOneRepMax)
        .sort((a, b) => b.bestEstimatedOneRepMax - a.bestEstimatedOneRepMax)
        .slice(0, 3),
      usesSnapshot: true
    };
  }

  for (const [key, rawSet] of Object.entries(sets)) {
    const parsed = parseSetKey(key);
    if (!parsed) continue;
    const exercise = exercisesSource?.[parsed.exerciseIndex];
    const exerciseName = exercise?.name || `Exercise ${parsed.exerciseIndex + 1}`;
    const normalized = normalizeCompletedSet(rawSet, {
      key,
      date: session.date,
      dayIndex: session.dayIndex,
      exerciseIndex: parsed.exerciseIndex,
      setIndex: parsed.setIndex,
      exerciseName
    });
    if (!normalized) continue;
    if (!exerciseMap.has(exerciseName)) exerciseMap.set(exerciseName, []);
    exerciseMap.get(exerciseName).push(normalized);
  }

  const exercises = Array.from(exerciseMap.entries()).map(([exerciseName, exerciseSets]) =>
    summarizeExerciseSets(exerciseName, exerciseSets)
  );

  return {
    date: session.date,
    dayIndex: session.dayIndex,
    workoutName: day?.workoutName || day?.category || "Workout",
    duration: session.duration || 0,
    completedSets: exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0),
    totalVolume: round(exercises.reduce((sum, exercise) => sum + (exercise.totalVolume || 0), 0), 1),
    exercises,
    bestOneRepMaxHighlights: exercises
      .filter((exercise) => exercise.bestEstimatedOneRepMax)
      .sort((a, b) => b.bestEstimatedOneRepMax - a.bestEstimatedOneRepMax)
      .slice(0, 3),
    usesSnapshot: false
  };
}

export function workoutVolume(session = {}, plan) {
  return summarizeWorkoutSession(session, plan).totalVolume || 0;
}

function workoutEntries(workoutLogs = {}) {
  return Object.entries(workoutLogs)
    .filter(([, session]) => session?.completed)
    .sort(([a], [b]) => a.localeCompare(b));
}

function utcDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function weekStart(date) {
  const parsed = utcDate(date);
  if (!parsed) return date;
  parsed.setUTCDate(parsed.getUTCDate() - parsed.getUTCDay());
  return parsed.toISOString().slice(0, 10);
}

function trendLabel(key, period) {
  const parsed = utcDate(period === "monthly" ? `${key}-01` : key);
  if (!parsed) return key;
  if (period === "monthly") return parsed.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  if (period === "weekly") return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function aggregateVolumeTrend(sessions = [], period = "daily") {
  const safePeriod = ["daily", "weekly", "monthly"].includes(period) ? period : "daily";
  const grouped = new Map();
  for (const session of sessions) {
    const date = session?.date;
    const volume = Number(session?.totalVolume || 0);
    if (!date || !Number.isFinite(volume) || volume <= 0) continue;
    const key = safePeriod === "monthly" ? date.slice(0, 7) : safePeriod === "weekly" ? weekStart(date) : date;
    const current = grouped.get(key) || { key, totalVolume: 0, sessions: 0, workoutNames: [] };
    current.totalVolume = round(current.totalVolume + volume, 1);
    current.sessions += 1;
    if (session.workoutName) current.workoutNames.push(session.workoutName);
    grouped.set(key, current);
  }
  const limit = safePeriod === "daily" ? 14 : 12;
  return Array.from(grouped.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-limit)
    .map((item) => ({
      ...item,
      label: trendLabel(item.key, safePeriod),
      title: `${item.sessions} session${item.sessions === 1 ? "" : "s"}`
    }));
}

export function exerciseHistory(exerciseName, workoutLogs = {}, plan, options = {}) {
  const beforeDate = options.beforeDate || null;
  const history = [];

  for (const [date, session] of workoutEntries(workoutLogs)) {
    if (beforeDate && date >= beforeDate) continue;
    const summary = summarizeWorkoutSession({ ...session, date: session.date || date }, plan);
    const exercise = summary.exercises.find((item) => item.exerciseName === exerciseName);
    if (!exercise) continue;
    history.push({
      date,
      workoutName: summary.workoutName,
      duration: summary.duration,
      ...exercise
    });
  }

  return history;
}

export function bestExercisePerformance(exerciseName, workoutLogs = {}, plan, options = {}) {
  const history = exerciseHistory(exerciseName, workoutLogs, plan, options);
  if (!history.length) return null;
  return history.reduce((best, item) => ({
    exerciseName,
    completedSets: Math.max(best.completedSets || 0, item.completedSets || 0),
    totalVolume: Math.max(best.totalVolume || 0, item.totalVolume || 0),
    bestWeight: Math.max(best.bestWeight || 0, item.bestWeight || 0) || null,
    bestReps: Math.max(best.bestReps || 0, item.bestReps || 0) || null,
    bestEstimatedOneRepMax: Math.max(best.bestEstimatedOneRepMax || 0, item.bestEstimatedOneRepMax || 0) || null,
    bestSetVolume: Math.max(best.bestSetVolume || 0, item.bestSetVolume || 0) || null,
    lastDate: item.date
  }), { exerciseName });
}

export function lastExercisePerformance(exerciseName, workoutLogs = {}, plan, options = {}) {
  const history = exerciseHistory(exerciseName, workoutLogs, plan, options);
  return history.length ? history[history.length - 1] : null;
}

export function detectExercisePrs(currentSummary, previousBest) {
  if (!currentSummary || !previousBest) {
    return currentSummary?.completedSets ? [{ type: "first_record", label: "First recorded performance" }] : [];
  }

  const prs = [];
  if (currentSummary.bestWeight && currentSummary.bestWeight > (previousBest.bestWeight || 0)) {
    prs.push({ type: "best_weight", label: "New best weight" });
  }
  if (currentSummary.bestReps && currentSummary.bestReps > (previousBest.bestReps || 0)) {
    prs.push({ type: "best_reps", label: "New rep record" });
  }
  if (currentSummary.bestEstimatedOneRepMax && currentSummary.bestEstimatedOneRepMax > (previousBest.bestEstimatedOneRepMax || 0)) {
    prs.push({ type: "estimated_1rm", label: "New estimated 1RM" });
  }
  if (currentSummary.bestSetVolume && currentSummary.bestSetVolume > (previousBest.bestSetVolume || 0)) {
    prs.push({ type: "set_volume", label: "New set volume" });
  }
  if (currentSummary.totalVolume && currentSummary.totalVolume > (previousBest.totalVolume || 0)) {
    prs.push({ type: "exercise_volume", label: "New exercise volume" });
  }
  return prs;
}

export function currentExercisePerformance(exerciseName, activeWorkout = {}) {
  const exerciseIndex = activeWorkout.exerciseIndex;
  const sets = Object.entries(activeWorkout.sets || {})
    .map(([key, set]) => {
      const parsed = parseSetKey(key);
      if (!parsed || parsed.exerciseIndex !== exerciseIndex) return null;
      return normalizeCompletedSet(set, { key, exerciseName, exerciseIndex, setIndex: parsed.setIndex });
    })
    .filter(Boolean);
  return summarizeExerciseSets(exerciseName, sets);
}

export function summarizeCurrentExercise(exerciseName, exerciseIndex, activeWorkout = {}, workoutLogs = {}, plan) {
  const current = currentExercisePerformance(exerciseName, { ...activeWorkout, exerciseIndex });
  const previousBest = bestExercisePerformance(exerciseName, workoutLogs, plan);
  const last = lastExercisePerformance(exerciseName, workoutLogs, plan);
  return {
    current,
    previousBest,
    last,
    prs: detectExercisePrs(current, previousBest)
  };
}

export function summarizeProgress(workoutLogs = {}, plan) {
  const sessions = workoutEntries(workoutLogs).map(([date, session]) =>
    summarizeWorkoutSession({ ...session, date: session.date || date }, plan)
  );
  const totalVolume = round(sessions.reduce((sum, session) => sum + (session.totalVolume || 0), 0), 1);
  const exerciseNames = new Set();
  for (const day of plan?.days || []) {
    for (const exercise of day.exercises || []) exerciseNames.add(exercise.name);
  }

  const bestByExercise = Array.from(exerciseNames)
    .map((name) => bestExercisePerformance(name, workoutLogs, plan))
    .filter((item) => item?.bestEstimatedOneRepMax)
    .sort((a, b) => b.bestEstimatedOneRepMax - a.bestEstimatedOneRepMax)
    .slice(0, 5);

  const prList = [];
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      const previousBest = bestExercisePerformance(exercise.exerciseName, workoutLogs, plan, { beforeDate: session.date });
      const prs = detectExercisePrs(exercise, previousBest);
      for (const pr of prs) {
        if (pr.type === "first_record") continue;
        prList.push({ date: session.date, exerciseName: exercise.exerciseName, label: pr.label });
      }
    }
  }

  return {
    sessions,
    totalVolume,
    bestByExercise,
    prList: prList.slice(-8).reverse(),
    volumeTrend: sessions.slice(-8).map((session) => ({
      date: session.date,
      workoutName: session.workoutName,
      totalVolume: session.totalVolume
    }))
  };
}
