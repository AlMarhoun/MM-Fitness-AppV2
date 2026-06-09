import { supabase } from "./supabase.js";

function mapObjectByDate(rows = {}, mapper) {
  return Object.entries(rows || {}).map(([date, value]) => mapper(date, value || {}));
}

function normalizeDate(date) {
  return String(date || "").slice(0, 10);
}

function planFromRow(planRow) {
  if (!planRow) return null;
  const days = [...(planRow.plan_days || [])]
    .sort((a, b) => a.day_index - b.day_index)
    .map((day) => ({
      day: day.day_name,
      dayIndex: day.day_index,
      workoutName: day.workout_name || day.category,
      category: day.category,
      duration: day.duration,
      goal: day.goal,
      nutritionType: day.nutrition_type,
      calories: day.calories,
      protein: day.protein,
      carbs: day.carbs,
      fats: day.fats,
      hasPadel: day.has_padel,
      padelTime: day.padel_time,
      padelDuration: day.padel_duration,
      exercises: [...(day.plan_exercises || [])]
        .sort((a, b) => a.exercise_index - b.exercise_index)
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          weightTarget: exercise.weight_target || "",
          intensity: exercise.intensity,
          rest: exercise.rest_seconds,
          notes: exercise.notes || ""
        }))
    }));

  return {
    title: planRow.title,
    startWeight: Number(planRow.start_weight || 0),
    targetWeight: Number(planRow.target_weight || 0),
    weeks: planRow.weeks,
    days
  };
}

function workoutLogsFromRows(rows = []) {
  const logs = {};
  for (const row of rows) {
    const date = normalizeDate(row.date);
    const snapshots = [...(row.exercise_snapshots || [])]
      .sort((a, b) => a.exercise_index - b.exercise_index)
      .map((exercise) => ({
        exerciseId: exercise.exercise_id,
        exerciseIndex: exercise.exercise_index,
        exerciseName: exercise.exercise_name,
        setsPrescription: exercise.sets_prescription,
        repsPrescription: exercise.reps_prescription,
        intensity: exercise.intensity,
        rest: exercise.rest_seconds,
        notes: exercise.notes || "",
        completedSets: exercise.completed_sets,
        totalVolume: Number(exercise.total_volume || 0),
        bestEstimatedOneRepMax: exercise.best_estimated_1rm ? Number(exercise.best_estimated_1rm) : null,
        loggedSets: [...(exercise.workout_sets || [])]
          .sort((a, b) => a.set_index - b.set_index)
          .map((set) => ({
            exerciseIndex: set.exercise_index,
            setIndex: set.set_index,
            weight: set.weight === null ? null : Number(set.weight),
            reps: set.reps === null ? null : Number(set.reps),
            done: set.completed,
            volume: set.set_volume === null ? null : Number(set.set_volume),
            estimatedOneRepMax: set.estimated_1rm === null ? null : Number(set.estimated_1rm)
          }))
      }));

    logs[date] = {
      id: row.client_session_id || row.id,
      date,
      dayIndex: row.day_index,
      workoutName: row.workout_name,
      category: row.category,
      duration: row.duration_minutes,
      completed: row.completed,
      totalVolume: Number(row.total_volume || 0),
      completedSets: row.completed_sets,
      exerciseSnapshots: snapshots,
      notes: row.notes || ""
    };
  }
  return logs;
}

export function cloudDatasetToSnapshot(dataset, fallback = {}) {
  const dailyLogs = {};
  for (const row of dataset.dailyLogs || []) {
    dailyLogs[normalizeDate(row.date)] = {
      bodyWeight: row.body_weight,
      waist: row.waist,
      energyScore: row.energy_score,
      sorenessScore: row.soreness_score,
      sleepScore: row.sleep_score,
      achillesScore: row.achilles_score,
      dietAdherence: row.diet_adherence,
      notes: row.notes || ""
    };
  }

  const nutritionLogs = {};
  for (const row of dataset.nutritionLogs || []) {
    nutritionLogs[normalizeDate(row.date)] = {
      actualCalories: row.actual_calories,
      actualProtein: row.actual_protein,
      actualCarbs: row.actual_carbs,
      actualFats: row.actual_fats,
      adhered: row.adhered,
      notes: row.notes || ""
    };
  }

  const padelLogs = {};
  for (const row of dataset.padelSessions || []) {
    padelLogs[normalizeDate(row.date)] = {
      completed: row.completed,
      scheduled: row.scheduled,
      time: row.time,
      duration: row.duration,
      intensity: row.intensity,
      energyBefore: row.energy_before,
      energyAfter: row.energy_after,
      achillesAfter: row.achilles_after,
      notes: row.notes || ""
    };
  }

  const settings = Object.fromEntries((dataset.settings || []).map((row) => [row.setting_key, row.setting_value]));
  const plan = planFromRow(dataset.plan) || fallback.data?.["mm-plan"] || null;

  return {
    app: "MM Fitness App",
    version: 2,
    exportedAt: new Date().toISOString(),
    source: "supabase_normalized",
    data: {
      "mm-theme": settings.theme || fallback.data?.["mm-theme"] || "dark",
      "mm-daily-logs": dailyLogs,
      "mm-workout-logs": workoutLogsFromRows(dataset.workoutSessions),
      "mm-nutrition-logs": nutritionLogs,
      "mm-padel-logs": padelLogs,
      "mm-plan": plan,
      "mm-active-workout": fallback.data?.["mm-active-workout"] || null,
      "mm-session-ui": fallback.data?.["mm-session-ui"] || null
    }
  };
}

async function upsertPlan(athleteId, userId, plan) {
  if (!plan?.days?.length) return null;
  const { data: existing, error: readError } = await supabase
    .from("workout_plans")
    .select("id")
    .eq("athlete_id", athleteId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;

  const payload = {
    athlete_id: athleteId,
    user_id: userId,
    title: plan.title || "MM Fitness Plan",
    start_weight: plan.startWeight || null,
    target_weight: plan.targetWeight || null,
    weeks: plan.weeks || 36,
    is_active: true
  };

  const query = existing?.id
    ? supabase.from("workout_plans").update(payload).eq("id", existing.id).select("id").single()
    : supabase.from("workout_plans").insert(payload).select("id").single();
  const { data, error } = await query;
  if (error) throw error;
  const planId = data.id;

  for (const day of plan.days) {
    const { data: dayRow, error: dayError } = await supabase
      .from("plan_days")
      .upsert({
        plan_id: planId,
        athlete_id: athleteId,
        user_id: userId,
        day_index: day.dayIndex,
        day_name: day.day,
        workout_name: day.workoutName || day.category,
        category: day.category,
        duration: day.duration || 0,
        goal: day.goal || "",
        nutrition_type: day.nutritionType,
        calories: day.calories,
        protein: day.protein,
        carbs: day.carbs,
        fats: day.fats,
        has_padel: !!day.hasPadel,
        padel_time: day.padelTime || null,
        padel_duration: day.padelDuration || null
      }, { onConflict: "plan_id,day_index" })
      .select("id")
      .single();
    if (dayError) throw dayError;

    for (const [exerciseIndex, exercise] of (day.exercises || []).entries()) {
      const { error: exerciseError } = await supabase
        .from("plan_exercises")
        .upsert({
          plan_day_id: dayRow.id,
          athlete_id: athleteId,
          user_id: userId,
          exercise_index: exerciseIndex,
          exercise_name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight_target: exercise.weightTarget || null,
          intensity: exercise.intensity,
          rest_seconds: exercise.rest,
          notes: exercise.notes || ""
        }, { onConflict: "plan_day_id,exercise_index" });
      if (exerciseError) throw exerciseError;
    }
  }
  return planId;
}

export async function savePlanToCloud(athleteId, userId, plan) {
  return upsertPlan(athleteId, userId, plan);
}

async function upsertWorkoutSession(athleteId, userId, date, session, planId) {
  if (!session?.completed) return;
  const clientSessionId = session.id || `${athleteId}-${date}`;
  const { data: row, error } = await supabase
    .from("workout_sessions")
    .upsert({
      client_session_id: clientSessionId,
      athlete_id: athleteId,
      user_id: userId,
      plan_id: planId,
      date,
      day_index: session.dayIndex,
      workout_name: session.workoutName || session.category || "Workout",
      category: session.category || null,
      duration_minutes: session.duration || null,
      completed: true,
      total_volume: session.totalVolume || 0,
      completed_sets: session.completedSets || 0,
      notes: session.notes || ""
    }, { onConflict: "client_session_id" })
    .select("id")
    .single();
  if (error) throw error;

  await supabase.from("workout_sets").delete().eq("workout_session_id", row.id);
  await supabase.from("exercise_snapshots").delete().eq("workout_session_id", row.id);

  for (const exercise of session.exerciseSnapshots || []) {
    const { data: snapshot, error: snapshotError } = await supabase
      .from("exercise_snapshots")
      .insert({
        workout_session_id: row.id,
        athlete_id: athleteId,
        user_id: userId,
        exercise_index: exercise.exerciseIndex,
        exercise_id: exercise.exerciseId || null,
        exercise_name: exercise.exerciseName,
        sets_prescription: exercise.setsPrescription || null,
        reps_prescription: exercise.repsPrescription || null,
        intensity: exercise.intensity || null,
        rest_seconds: exercise.rest || null,
        notes: exercise.notes || "",
        completed_sets: exercise.completedSets || 0,
        total_volume: exercise.totalVolume || 0,
        best_estimated_1rm: exercise.bestEstimatedOneRepMax || null
      })
      .select("id")
      .single();
    if (snapshotError) throw snapshotError;

    for (const set of exercise.loggedSets || []) {
      const { error: setError } = await supabase
        .from("workout_sets")
        .insert({
          workout_session_id: row.id,
          exercise_snapshot_id: snapshot.id,
          athlete_id: athleteId,
          user_id: userId,
          exercise_index: set.exerciseIndex ?? exercise.exerciseIndex,
          set_index: set.setIndex,
          weight: set.weight || null,
          reps: set.reps || null,
          completed: !!set.done,
          set_volume: set.volume || null,
          estimated_1rm: set.estimatedOneRepMax || null
        });
      if (setError) throw setError;
    }
  }
}

export async function syncSnapshotToCloud(athleteId, userId, snapshot) {
  const data = snapshot?.data || {};
  const planId = await upsertPlan(athleteId, userId, data["mm-plan"]);

  const dailyRows = mapObjectByDate(data["mm-daily-logs"], (date, log) => ({
    athlete_id: athleteId,
    user_id: userId,
    date,
    body_weight: log.bodyWeight || null,
    waist: log.waist || null,
    energy_score: log.energyScore || null,
    soreness_score: log.sorenessScore || null,
    sleep_score: log.sleepScore || null,
    achilles_score: log.achillesScore || null,
    diet_adherence: log.dietAdherence || null,
    notes: log.notes || ""
  }));
  if (dailyRows.length) {
    const { error } = await supabase.from("daily_logs").upsert(dailyRows, { onConflict: "athlete_id,date" });
    if (error) throw error;
  }

  const nutritionRows = mapObjectByDate(data["mm-nutrition-logs"], (date, log) => ({
    athlete_id: athleteId,
    user_id: userId,
    date,
    actual_calories: log.actualCalories || null,
    actual_protein: log.actualProtein || null,
    actual_carbs: log.actualCarbs || null,
    actual_fats: log.actualFats || null,
    adhered: log.adhered || null,
    notes: log.notes || ""
  }));
  if (nutritionRows.length) {
    const { error } = await supabase.from("nutrition_logs").upsert(nutritionRows, { onConflict: "athlete_id,date" });
    if (error) throw error;
  }

  const padelRows = mapObjectByDate(data["mm-padel-logs"], (date, log) => ({
    athlete_id: athleteId,
    user_id: userId,
    date,
    scheduled: !!log.scheduled,
    time: log.time || null,
    duration: log.duration || null,
    intensity: log.intensity || null,
    completed: !!log.completed,
    energy_before: log.energyBefore || null,
    energy_after: log.energyAfter || null,
    achilles_after: log.achillesAfter || null,
    notes: log.notes || ""
  }));
  if (padelRows.length) {
    const { error } = await supabase.from("padel_sessions").upsert(padelRows, { onConflict: "athlete_id,date" });
    if (error) throw error;
  }

  for (const [date, session] of Object.entries(data["mm-workout-logs"] || {})) {
    await upsertWorkoutSession(athleteId, userId, date, session, planId);
  }

  const { error: themeError } = await supabase
    .from("app_settings")
    .upsert({
      athlete_id: athleteId,
      user_id: userId,
      setting_key: "theme",
      setting_value: data["mm-theme"] || "dark"
    }, { onConflict: "athlete_id,user_id,setting_key" });
  if (themeError) throw themeError;

  return { planId };
}
