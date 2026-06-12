import { supabase } from "./supabase.js";
import { OWNER_EMAIL, ROLES, isOwnerEmail } from "./roles.js";

function normalizeProfile(row) {
  if (!row) return null;
  const roleName = row.roles?.name || row.role || (isOwnerEmail(row.email) ? ROLES.OWNER : ROLES.ATHLETE);
  return { ...row, role: roleName };
}

export async function getRoleId(roleName) {
  const { data, error } = await supabase
    .from("roles")
    .select("id,name")
    .eq("name", roleName)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*,roles(name)")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return normalizeProfile(data);
}

export async function upsertDefaultProfile(user) {
  const email = user.email || "";
  const displayName = user.user_metadata?.display_name || email.split("@")[0] || "Athlete";
  const roleName = isOwnerEmail(email) ? ROLES.OWNER : ROLES.ATHLETE;
  const roleId = await getRoleId(roleName);
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email,
      display_name: displayName,
      role_id: roleId,
      is_active: true
    }, { onConflict: "id" })
    .select("*,roles(name)")
    .single();
  if (error) throw error;
  return normalizeProfile(data);
}

export async function getOrCreateAthlete(user, profile) {
  const { data: existing, error: readError } = await supabase
    .from("athlete_user_assignments")
    .select("athletes(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;
  if (existing?.athletes) return existing.athletes;

  // Admins and viewers require an explicit athlete assignment. They must not
  // silently create a private athlete profile during authentication.
  if (profile?.role === ROLES.ADMIN || profile?.role === ROLES.VIEWER) return null;

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .insert({
      owner_user_id: user.id,
      display_name: profile?.display_name || user.email?.split("@")[0] || "Athlete",
      status: "active"
    })
    .select("*")
    .single();
  if (athleteError) throw athleteError;

  const { error: assignmentError } = await supabase
    .from("athlete_user_assignments")
    .insert({
      athlete_id: athlete.id,
      user_id: user.id,
      relationship_type: isOwnerEmail(user.email) ? "owner" : "self",
      created_by: user.id
    });
  if (assignmentError) throw assignmentError;
  return athlete;
}

export async function listAccessibleAthletes() {
  const { data, error } = await supabase
    .from("athletes")
    .select("id,owner_user_id,display_name,status,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAppSetting(athleteId, key, userId) {
  let query = supabase
    .from("app_settings")
    .select("setting_value,updated_at")
    .eq("setting_key", key)
    .limit(1);
  if (athleteId) query = query.eq("athlete_id", athleteId);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertAppSetting(athleteId, userId, key, value) {
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({
      athlete_id: athleteId,
      user_id: userId,
      setting_key: key,
      setting_value: value
    }, { onConflict: "athlete_id,user_id,setting_key" })
    .select("updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function insertAuditLog(action, metadata = {}, target = {}) {
  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      actor_user_id: target.actorUserId,
      athlete_id: target.athleteId || null,
      action,
      target_table: target.table || null,
      target_id: target.id || null,
      metadata
    })
    .select("id,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function insertBackupExport(userId, athleteId, metadata = {}) {
  return insertAuditLog("backup.exported", metadata, { actorUserId: userId, athleteId, table: "backup_exports" });
}

export async function fetchCloudDataset(athleteId) {
  const [
    plans,
    sessions,
    dailyLogs,
    nutritionLogs,
    nutritionEntries,
    savedMeals,
    padelSessions,
    settings
  ] = await Promise.all([
    supabase.from("workout_plans").select("*,plan_days(*,plan_exercises(*))").eq("athlete_id", athleteId).eq("is_active", true).limit(1).maybeSingle(),
    supabase.from("workout_sessions").select("*,exercise_snapshots(*,workout_sets(*))").eq("athlete_id", athleteId).order("date", { ascending: false }),
    supabase.from("daily_logs").select("*").eq("athlete_id", athleteId),
    supabase.from("nutrition_logs").select("*").eq("athlete_id", athleteId),
    supabase.from("nutrition_entries").select("*").eq("athlete_id", athleteId),
    supabase.from("nutrition_saved_meals").select("*").eq("athlete_id", athleteId),
    supabase.from("padel_sessions").select("*").eq("athlete_id", athleteId),
    supabase.from("app_settings").select("setting_key,setting_value").eq("athlete_id", athleteId)
  ]);

  for (const result of [plans, sessions, dailyLogs, nutritionLogs, padelSessions, settings]) {
    if (result.error) throw result.error;
  }
  const optionalData = (result) => {
    if (!result.error) return result.data || [];
    if (["42P01", "PGRST205"].includes(result.error.code)) return undefined;
    throw result.error;
  };

  return {
    plan: plans.data,
    workoutSessions: sessions.data || [],
    dailyLogs: dailyLogs.data || [],
    nutritionLogs: nutritionLogs.data || [],
    nutritionEntries: optionalData(nutritionEntries),
    savedMeals: optionalData(savedMeals),
    padelSessions: padelSessions.data || [],
    settings: settings.data || []
  };
}
