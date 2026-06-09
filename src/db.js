import { supabase } from "./supabase.js";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDefaultProfile(user) {
  const email = user.email || "";
  const displayName = user.user_metadata?.display_name || email.split("@")[0] || "Athlete";
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email,
      display_name: displayName,
      role: "player",
      is_active: true
    }, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateAthlete(user, profile) {
  const { data: existing, error: readError } = await supabase
    .from("athletes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) throw readError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("athletes")
    .insert({
      user_id: user.id,
      display_name: profile?.display_name || user.email?.split("@")[0] || "Athlete",
      created_by: user.id
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function listAccessibleAthletes() {
  const { data, error } = await supabase
    .from("athletes")
    .select("id,user_id,display_name,is_active,assigned_admin_id,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAppSetting(athleteId, key) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("setting_value,updated_at")
    .eq("athlete_id", athleteId)
    .eq("setting_key", key)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertAppSetting(athleteId, key, value) {
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({
      athlete_id: athleteId,
      setting_key: key,
      setting_value: value
    }, { onConflict: "athlete_id,setting_key" })
    .select("updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function insertBackupExport(userId, athleteId, metadata = {}) {
  const { data, error } = await supabase
    .from("backup_exports")
    .insert({
      user_id: userId,
      athlete_id: athleteId,
      export_type: "localStorage",
      metadata
    })
    .select("id,created_at")
    .single();
  if (error) throw error;
  return data;
}

