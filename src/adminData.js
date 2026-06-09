import { fetchCloudDataset } from "./db.js";
import { cloudDatasetToSnapshot } from "./sync.js";

function normalizeRole(profile) {
  return profile?.roles?.name || profile?.role || "athlete";
}

function normalizeDate(date) {
  return String(date || "").slice(0, 10);
}

function dateFrom(str) {
  return new Date(`${str}T12:00:00`);
}

function weekStart(str) {
  const d = dateFrom(str);
  d.setDate(d.getDate() - d.getDay());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekDates(str) {
  const start = dateFrom(weekStart(str));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
}

export async function loadAdminDirectory(supabase) {
  const [profiles, athletes, assignments] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name,is_active,created_at,roles(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("athletes")
      .select("id,owner_user_id,display_name,status,created_at,updated_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("athlete_user_assignments")
      .select("athlete_id,user_id,relationship_type,created_at")
      .order("created_at", { ascending: false })
  ]);

  for (const result of [profiles, athletes, assignments]) {
    if (result.error) throw result.error;
  }

  const userMap = new Map((profiles.data || []).map((profile) => [profile.id, {
    ...profile,
    role: normalizeRole(profile),
    assignments: []
  }]));
  const athleteMap = new Map((athletes.data || []).map((athlete) => [athlete.id, {
    ...athlete,
    users: []
  }]));

  for (const assignment of assignments.data || []) {
    const user = userMap.get(assignment.user_id);
    const athlete = athleteMap.get(assignment.athlete_id);
    if (user) user.assignments.push(assignment);
    if (athlete) athlete.users.push({
      ...assignment,
      user: user ? {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        is_active: user.is_active
      } : null
    });
  }

  return {
    users: [...userMap.values()],
    athletes: [...athleteMap.values()],
    assignments: assignments.data || []
  };
}

export async function loadAdminAthleteSnapshot(athleteId, fallbackSnapshot) {
  const dataset = await fetchCloudDataset(athleteId);
  return cloudDatasetToSnapshot(dataset, fallbackSnapshot);
}

export function summarizeAthleteSnapshot(snapshot, date = new Date().toISOString().slice(0, 10)) {
  const data = snapshot?.data || {};
  const workoutLogs = data["mm-workout-logs"] || {};
  const nutritionLogs = data["mm-nutrition-logs"] || {};
  const dailyLogs = data["mm-daily-logs"] || {};
  const padelLogs = data["mm-padel-logs"] || {};
  const dates = weekDates(date);
  const workoutsThisWeek = dates.filter((day) => workoutLogs[day]?.completed).length;
  const nutritionThisWeek = dates.filter((day) => nutritionLogs[day]?.adhered === "yes").length;
  const padelThisWeek = dates.filter((day) => padelLogs[day]?.completed).length;
  const completedSessions = Object.entries(workoutLogs)
    .filter(([, session]) => session?.completed)
    .sort(([a], [b]) => b.localeCompare(a));
  const lastWorkout = completedSessions[0]
    ? { date: normalizeDate(completedSessions[0][0]), ...completedSessions[0][1] }
    : null;
  const totalVolume = completedSessions.reduce((sum, [, session]) => sum + Number(session.totalVolume || 0), 0);
  const latestDaily = Object.entries(dailyLogs)
    .filter(([, log]) => log && Object.keys(log).length)
    .sort(([a], [b]) => b.localeCompare(a))[0];

  return {
    workoutsThisWeek,
    nutritionThisWeek,
    padelThisWeek,
    lastWorkout,
    totalVolume,
    latestDaily: latestDaily ? { date: latestDaily[0], ...latestDaily[1] } : null,
    workoutCount: completedSessions.length
  };
}
