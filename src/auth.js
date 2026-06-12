import { supabase } from "./supabase.js";
import { getOrCreateAthlete, getProfile, upsertDefaultProfile } from "./db.js";
import { signedAvatarUrl } from "./profile.js";

export const authState = {
  loading: true,
  user: null,
  profile: null,
  athlete: null,
  error: ""
};

async function hydrateSession(session) {
  const user = session?.user || null;
  authState.user = user;
  authState.profile = null;
  authState.athlete = null;
  authState.error = "";

  if (!user) return authState;

  try {
    let profile = await getProfile(user.id);
    if (!profile) profile = await upsertDefaultProfile(user);
    profile.avatar_url = await signedAvatarUrl(profile.avatar_path);
    const athlete = await getOrCreateAthlete(user, profile);
    authState.profile = profile;
    authState.athlete = athlete;
  } catch (error) {
    authState.error = error.message || "Could not load profile";
  }

  return authState;
}

export async function initAuth(onChange) {
  const { data, error } = await supabase.auth.getSession();
  if (error) authState.error = error.message;
  await hydrateSession(data?.session);
  authState.loading = false;
  await onChange?.({ ...authState });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    authState.loading = true;
    await onChange?.({ ...authState });
    await hydrateSession(session);
    authState.loading = false;
    await onChange?.({ ...authState });
  });
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function currentAthleteId() {
  return authState.athlete?.id || null;
}

export function currentUserId() {
  return authState.user?.id || null;
}
