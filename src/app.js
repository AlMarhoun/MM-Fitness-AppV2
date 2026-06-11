import { authState, initAuth, isAdmin, signIn, signOut } from "./auth.js";
import { loadAdminAthleteSnapshot, loadAdminDirectory, summarizeAthleteSnapshot } from "./adminData.js";
import { activitiesForDate, activityCount, activityLabel, addActivity, removeActivity } from "./activities.js?v=19";
import { dayHistory, monthCalendar } from "./history.js?v=19";
import { aggregateVolumeTrend, createWorkoutSessionSnapshot, summarizeCurrentExercise, summarizeProgress, summarizeWorkoutSession } from "./performance.js?v=18";
import { ROLE_DEFINITIONS, ROLES, canOpenAdminPanel, isOwnerEmail, roleLabel } from "./roles.js";
import { PERMISSIONS } from "./permissions.js";
import { initials, signedAvatarUrl, updateOwnProfile, uploadOwnAvatar } from "./profile.js";
import { supabase } from "./supabase.js";
import { downloadLocalBackup, getSyncStatus, importLocalBackupFile, loadCloudSnapshot, localRead, localRemove, localWrite, queueCloudSnapshot, recordBackupExport, saveCloudSnapshot } from "./storage.js";
import { clearSessionUi, persistWorkoutUiState, readSessionUi, shouldResumeActiveWorkout } from "./sessionPersistence.js";
import { savePlanToCloud } from "./sync.js";

const PLAN = {
  title: "MM Hybrid: Fat Loss + Padel Performance + Athletic Physique",
  startWeight: 102.5,
  targetWeight: 90,
  weeks: 36,
  days: [
    {
      day: "Sunday", category: "Upper Moderate", duration: 45, hasPadel: false,
      goal: "Build pressing and pulling foundation with balanced upper-body volume.",
      nutritionType: "MED", calories: 2050, protein: 190, carbs: 150, fats: 77,
      exercises: [
        ["Incline Dumbbell Press", 3, "6-10", "Moderate", 90, "Control the negative; full stretch at bottom"],
        ["Chest Supported Row", 3, "8-12", "Moderate", 90, "Squeeze shoulder blades; no momentum"],
        ["Machine Shoulder Press", 2, "8-10", "Moderate", 90, "Keep core braced"],
        ["Lat Pulldown", 3, "8-12", "Moderate", 90, "Pull to upper chest; pause"],
        ["Cable Lateral Raise", 2, "12-15", "Light-Mod", 60, "Controlled tempo"],
        ["Face Pull", 2, "12-15", "Light", 60, "Shoulder health"],
        ["Biceps Curl", 2, "10-12", "Moderate", 60, "Full ROM"],
        ["Triceps Pressdown", 2, "10-12", "Moderate", 60, "Squeeze at bottom"],
        ["Dead Bug or Pallof Press", 2, "8-10 ea", "Bodyweight", 60, "Anti-rotation core"]
      ]
    },
    {
      day: "Monday", category: "Lower Light", duration: 40, hasPadel: true, padelTime: "6:00 PM", padelDuration: 90,
      goal: "Prime legs, protect Achilles, and preserve energy for padel tonight.",
      nutritionType: "HIGH", calories: 2200, protein: 190, carbs: 200, fats: 71,
      exercises: [
        ["Leg Press", 3, "8-10", "Moderate", 90, "Controlled tempo; do not lock knees"],
        ["Romanian Deadlift (light-mod)", 3, "6-8", "Light-Mod", 90, "Hinge cleanly; protect lower back"],
        ["Seated Leg Curl", 2, "10-12", "Moderate", 60, "Slow eccentric"],
        ["Step-Up or Split Squat", 2, "8 ea leg", "Light-Mod", 60, "Low box; control balance"],
        ["Standing Calf Isometric Hold", 3, "20-30 sec", "Bodyweight", 60, "Achilles prehab"],
        ["Tibialis Raise", 2, "12-15", "Light", 60, "Shin/ankle balance"],
        ["Side Plank", 2, "20-30 sec", "Bodyweight", 60, "Lateral stability"]
      ]
    },
    {
      day: "Tuesday", category: "Upper Strong", duration: 45, hasPadel: false,
      goal: "Primary upper-body strength day with heavier compounds.",
      nutritionType: "MED", calories: 2050, protein: 190, carbs: 150, fats: 77,
      exercises: [
        ["Bench Press or Chest Press Machine", 4, "5-8", "Heavy", 150, "Strength focus"],
        ["Pull-Ups or Heavy Lat Pulldown", 4, "6-8", "Heavy", 150, "Full ROM"],
        ["Seated Cable Row", 3, "8-10", "Mod-Heavy", 90, "Drive elbows back"],
        ["Overhead Press or Machine Shoulder Press", 3, "6-8", "Heavy", 120, "Brace core"],
        ["Incline Dumbbell Press", 2, "8-10", "Moderate", 90, "Secondary pressing volume"],
        ["Lateral Raise", 2, "12-15", "Light", 60, "Controlled shoulder cap work"],
        ["Biceps Curl", 2, "8-12", "Moderate", 60, ""],
        ["Triceps Extension", 2, "8-12", "Moderate", 60, ""],
        ["Hanging Knee Raise", 3, "10-15", "Bodyweight", 60, "No swinging"]
      ]
    },
    {
      day: "Wednesday", category: "Upper Pump", duration: 35, hasPadel: true, padelTime: "6:00 PM", padelDuration: 90,
      goal: "Light upper pump and mobility without fatigue before padel.",
      nutritionType: "HIGH", calories: 2200, protein: 190, carbs: 200, fats: 71,
      exercises: [
        ["Cable Chest Press or Push-Ups", 2, "10-12", "Light", 60, "Activation only"],
        ["Cable Row", 2, "10-12", "Light", 60, "Upper back pump"],
        ["Machine Lateral Raise", 2, "12-15", "Light", 60, "Shoulder maintenance"],
        ["Rear Delt Fly", 2, "12-15", "Light", 60, "Posture"],
        ["Cable Rotation", 2, "8-10 ea", "Light", 60, "Rotational core"],
        ["Farmer Carry", 2, "30-40m", "Moderate", 60, "Grip and stability"],
        ["Hip + Ankle Mobility", 1, "5 min", "N/A", 0, "Pre-padel mobility"],
        ["Seated Calf Raise", 2, "10-12", "Light", 60, "Slow tempo"]
      ]
    },
    {
      day: "Thursday", category: "Heavy Lower", duration: 45, hasPadel: false,
      goal: "Primary leg strength day with full recovery into Friday.",
      nutritionType: "HIGH", calories: 2200, protein: 190, carbs: 200, fats: 71,
      exercises: [
        ["Hack Squat or Comfortable Squat", 4, "5-8", "Heavy", 150, "Main leg strength lift"],
        ["Romanian Deadlift", 3, "6-8", "Heavy", 120, "Full hip hinge"],
        ["Leg Press", 3, "10-12", "Moderate", 90, "Pump work after squats"],
        ["Walking Lunge or Split Squat", 2, "8 ea leg", "Moderate", 90, "Controlled"],
        ["Seated Leg Curl", 3, "10-12", "Moderate", 60, "Full squeeze"],
        ["Standing Calf Raise", 3, "10-15", "Moderate", 60, "Full ROM"],
        ["Plank or Ab Wheel", 2, "30-45 sec", "Bodyweight", 60, "Brace hard"]
      ]
    },
    {
      day: "Friday", category: "Recovery", duration: 30, hasPadel: false,
      goal: "Zone 2 cardio, mobility, and light movement.",
      nutritionType: "LOW", calories: 1850, protein: 190, carbs: 80, fats: 86,
      exercises: [
        ["Zone 2 Cardio", 1, "20-30 min", "Light", 0, "Bike or elliptical preferred"],
        ["Hip Mobility Circuit", 1, "5 min", "N/A", 0, "90/90 and hip circles"],
        ["Ankle Mobility + Achilles Work", 1, "5 min", "N/A", 0, "Eccentric heel drops"],
        ["Foam Roll / Stretch", 1, "10 min", "N/A", 0, "Full body"]
      ]
    },
    {
      day: "Saturday", category: "Off", duration: 0, hasPadel: false,
      goal: "Rest day. Walk 20-30 minutes and keep light activity only.",
      nutritionType: "LOW", calories: 1850, protein: 190, carbs: 80, fats: 86,
      exercises: []
    }
  ].map((day, dayIndex) => ({
    ...day,
    dayIndex,
    exercises: day.exercises.map(([name, sets, reps, intensity, rest, notes]) => ({ name, sets, reps, intensity, rest, notes }))
  }))
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const $ = (sel) => document.querySelector(sel);
const app = $("#app");
const forceSplash = new URLSearchParams(location.search).has("splash");
const initialActiveWorkout = read("mm-active-workout", null);
const initialSessionUi = readSessionUi({});
const resumeActiveWorkout = shouldResumeActiveWorkout(initialSessionUi, initialActiveWorkout);

const state = {
  screen: resumeActiveWorkout ? "active" : (initialSessionUi.screen || "home"),
  selectedDay: Number.isInteger(initialSessionUi.selectedDay) ? initialSessionUi.selectedDay : null,
  theme: read("mm-theme", "dark"),
  logs: read("mm-daily-logs", {}),
  workoutLogs: read("mm-workout-logs", {}),
  nutritionLogs: read("mm-nutrition-logs", {}),
  padelLogs: read("mm-padel-logs", {}),
  activityLogs: read("mm-activity-logs", {}),
  plan: read("mm-plan", PLAN),
  activeWorkout: initialActiveWorkout,
  activeCursor: initialSessionUi.activeCursor || null,
  lastWorkoutSummary: null,
  historySelectedDate: initialSessionUi.historySelectedDate || todayStr(),
  strengthPeriod: read("mm-strength-period", "daily"),
  adminPanelOpen: false,
  auth: { ...authState },
  syncStatus: getSyncStatus(),
  editingPlan: false,
  adminCreateStatus: "",
  adminLoadStatus: "",
  adminUsers: [],
  adminAthletes: [],
  adminSelectedAthleteId: "",
  adminPlayerSnapshot: null,
  adminPlanDraft: null,
  adminPlanDay: 0,
  adminPlanStatus: "",
  profileStatus: "",
  toast: "",
  modal: null,
  splashDone: resumeActiveWorkout || (!forceSplash && sessionStorage.getItem("mm-splash-done") === "1")
};

let timerTick = null;
let pendingScrollY = resumeActiveWorkout ? Number(initialSessionUi.scrollY || 0) : null;

function read(key, fallback) {
  return localRead(key, fallback);
}
function write(key, value) {
  localWrite(key, value);
}
function appSnapshot() {
  return {
    app: "MM Fitness App",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      "mm-theme": state.theme,
      "mm-daily-logs": state.logs,
      "mm-workout-logs": state.workoutLogs,
      "mm-nutrition-logs": state.nutritionLogs,
      "mm-padel-logs": state.padelLogs,
      "mm-activity-logs": state.activityLogs,
      "mm-plan": state.plan,
      "mm-active-workout": state.activeWorkout,
      "mm-session-ui": readSessionUi({})
    }
  };
}
function hydrateFromSnapshot(snapshot) {
  const data = snapshot?.data;
  if (!data) return false;
  state.theme = data["mm-theme"] || state.theme;
  state.logs = data["mm-daily-logs"] || state.logs;
  state.workoutLogs = data["mm-workout-logs"] || state.workoutLogs;
  state.nutritionLogs = data["mm-nutrition-logs"] || state.nutritionLogs;
  state.padelLogs = data["mm-padel-logs"] || state.padelLogs;
  state.activityLogs = data["mm-activity-logs"] || state.activityLogs;
  state.plan = data["mm-plan"] || state.plan;
  if (!state.activeWorkout) state.activeWorkout = data["mm-active-workout"] || state.activeWorkout;
  write("mm-theme", state.theme);
  write("mm-daily-logs", state.logs);
  write("mm-workout-logs", state.workoutLogs);
  write("mm-nutrition-logs", state.nutritionLogs);
  write("mm-padel-logs", state.padelLogs);
  write("mm-activity-logs", state.activityLogs);
  write("mm-plan", state.plan);
  if (state.activeWorkout) write("mm-active-workout", state.activeWorkout);
  else localRemove("mm-active-workout");
  if (state.activeWorkout) persistWorkoutUiState(state);
  return true;
}
function saveAll() {
  write("mm-theme", state.theme);
  write("mm-daily-logs", state.logs);
  write("mm-workout-logs", state.workoutLogs);
  write("mm-nutrition-logs", state.nutritionLogs);
  write("mm-padel-logs", state.padelLogs);
  write("mm-activity-logs", state.activityLogs);
  write("mm-plan", state.plan);
  if (state.activeWorkout) write("mm-active-workout", state.activeWorkout);
  else localRemove("mm-active-workout");
  if (state.activeWorkout) persistWorkoutUiState(state);
  queueCloudSnapshot(appSnapshot);
}
async function loadAdminCommandCenter(preferredAthleteId = state.adminSelectedAthleteId || currentAthleteId()) {
  if (!canOpenAdminPanel(state.auth.profile)) return;
  state.adminLoadStatus = "Loading player command center...";
  render();
  try {
    const directory = await loadAdminDirectory(supabase);
    state.adminUsers = directory.users;
    state.adminAthletes = directory.athletes;
    state.adminSelectedAthleteId = preferredAthleteId || directory.athletes[0]?.id || "";
    if (state.adminSelectedAthleteId) {
      await loadAdminPlayer(state.adminSelectedAthleteId, false);
    }
    state.adminLoadStatus = directory.athletes.length ? "Player command center loaded." : "No athlete profiles found yet.";
  } catch (error) {
    state.adminLoadStatus = error.message || "Could not load player command center.";
  }
  render();
}
async function loadAdminPlayer(athleteId, rerender = true) {
  if (!athleteId) return;
  state.adminSelectedAthleteId = athleteId;
  state.adminPlanStatus = "Loading player data...";
  if (rerender) render();
  const fallback = appSnapshot();
  const snapshot = await loadAdminAthleteSnapshot(athleteId, fallback);
  state.adminPlayerSnapshot = snapshot;
  state.adminPlanDraft = clone(snapshot?.data?.["mm-plan"] || state.plan);
  state.adminPlanDay = 0;
  state.adminPlanStatus = "Player data loaded.";
  if (rerender) render();
}
async function saveAdminPlayerPlan() {
  const athlete = selectedAdminAthlete();
  if (!athlete || !state.adminPlanDraft) {
    state.adminPlanStatus = "Select a player before saving.";
    render();
    return;
  }
  state.adminPlanStatus = "Saving player plan...";
  render();
  try {
    await savePlanToCloud(athlete.id, currentUserId(), state.adminPlanDraft);
    if (athlete.id === currentAthleteId()) {
      state.plan = clone(state.adminPlanDraft);
      saveAll();
    }
    const snapshot = await loadAdminAthleteSnapshot(athlete.id, appSnapshot());
    state.adminPlayerSnapshot = snapshot;
    state.adminPlanDraft = clone(snapshot?.data?.["mm-plan"] || state.adminPlanDraft);
    state.adminPlanStatus = `Saved plan for ${athlete.display_name}.`;
  } catch (error) {
    state.adminPlanStatus = error.message || "Could not save player plan.";
  }
  render();
}
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateFrom(str) { return new Date(`${str}T12:00:00`); }
function dayName(str) { return DAYS[dateFrom(str).getDay()]; }
function fmtDate(str = todayStr()) {
  return dateFrom(str).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}
function weekStart(str = todayStr()) {
  const d = dateFrom(str);
  d.setDate(d.getDate() - d.getDay());
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function weekDates(str = todayStr()) {
  const start = dateFrom(weekStart(str));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  });
}
function weekNumber() {
  const start = new Date("2026-04-05T12:00:00");
  const diff = Math.max(0, dateFrom(todayStr()) - start);
  return Math.min(36, Math.floor(diff / (7 * 86400000)) + 1);
}
function todayPlan() {
  return state.plan.days.find((d) => d.day === dayName(todayStr())) || state.plan.days[0];
}
function workoutName(d) {
  return d.workoutName || d.category;
}
function latestWeight() {
  const entries = Object.entries(state.logs).filter(([, v]) => v.bodyWeight).sort(([a], [b]) => b.localeCompare(a));
  return entries[0] ? { date: entries[0][0], weight: entries[0][1].bodyWeight } : null;
}
function weekStats() {
  const dates = weekDates();
  return {
    workouts: dates.filter((d) => state.workoutLogs[d]?.completed).length,
    padel: activityCount(state.activityLogs, "padel", dates, state.padelLogs),
    swimming: activityCount(state.activityLogs, "swimming", dates, state.padelLogs),
    nutrition: dates.filter((d) => state.nutritionLogs[d]?.adhered === "yes").length
  };
}
function setScreen(screen) {
  state.screen = screen;
  state.selectedDay = screen === "plan" ? null : state.selectedDay;
  state.editingPlan = false;
  if (state.activeWorkout) persistWorkoutUiState(state);
  render();
}
function toast(msg) {
  state.toast = msg;
  render();
  setTimeout(() => {
    if (state.toast === msg) {
      state.toast = "";
      render();
    }
  }, 1800);
}
function pct(n, d) { return d ? Math.min(100, Math.round((n / d) * 100)) : 0; }
function kg(value) { return Number.isFinite(value) ? `${value.toLocaleString("en-US", { maximumFractionDigits: 1 })} kg` : "Not enough data"; }
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
}
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function currentUserId() {
  return state.auth.user?.id || null;
}
function currentAthleteId() {
  return state.auth.athlete?.id || null;
}
function selectedAdminAthlete() {
  const selectedId = state.adminSelectedAthleteId || currentAthleteId();
  return state.adminAthletes.find((athlete) => athlete.id === selectedId) || state.adminAthletes[0] || null;
}
function selectedAdminUser() {
  const athlete = selectedAdminAthlete();
  const assignment = athlete?.users?.find((item) => item.relationship_type === "self") || athlete?.users?.[0];
  return assignment?.user || null;
}
function planForAdminEditor() {
  return state.adminPlanDraft || state.adminPlayerSnapshot?.data?.["mm-plan"] || state.plan;
}
function brandGlyph(cls = "brand-glyph") {
  const src = cls.includes("nav-signature")
    ? "./assets/brand/mm-logo-nav-reference.png?v=8"
    : "./assets/brand/mm-logo-signature-reference.png?v=8";
  return `<img class="${cls}" src="${src}" alt="MM Fitness App" />`;
}
function icon(name) {
  const paths = {
    home: '<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3v-9.5Z"/>',
    plan: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    logs: '<path d="M8 5h8M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z"/><path d="m8 14 2 2 5-5"/>',
    nutrition: '<path d="M12 21c4-3 7-7 7-11a5 5 0 0 0-9-3c-1 1-1 3 0 4-2-1-4-2-6-1 1 5 4 9 8 11Z"/>',
    progress: '<path d="M5 19V9M12 19V5M19 19v-7M4 19h16"/>',
    weight: '<path d="M7 9h10l2 11H5L7 9Z"/><path d="M9 9a3 3 0 0 1 6 0"/>',
    moon: '<path d="M20 15.5A8 8 0 1 1 8.5 4 6.5 6.5 0 0 0 20 15.5Z"/>',
    play: '<path d="M8 5v14l11-7L8 5Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    spark: '<path d="m13 2-2 8h7l-8 12 2-9H5l8-11Z"/>',
    settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M4 12h2m12 0h2M12 4v2m0 12v2m-5.6-2.4 1.4-1.4m8.4-8.4 1.4-1.4m0 11.2-1.4-1.4M7.8 7.8 6.4 6.4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function render() {
  const restoreActiveScroll = state.screen === "active" && state.activeWorkout;
  const scrollBeforeRender = restoreActiveScroll ? window.scrollY || 0 : null;
  app.dataset.theme = state.theme;
  app.innerHTML = `${!state.splashDone ? Splash() : ""}<main class="app-main">${route()}</main>${BottomNav()}${Modal()}${state.toast ? `<div class="toast">${state.toast}</div>` : ""}`;
  bind();
  if (restoreActiveScroll && pendingScrollY === null) pendingScrollY = scrollBeforeRender;
  restoreScrollAfterRender();
}
function Splash() {
  setTimeout(() => {
    state.splashDone = true;
    sessionStorage.setItem("mm-splash-done", "1");
    render();
  }, 2200);
  return `<section class="splash" aria-label="Loading MM Fitness App">
    <div class="splash-energy"></div>
    <div class="splash-inner">
      <img class="splash-mark" src="./assets/brand/mm-logo-splash-reference.png?v=8" alt="MM Fitness App" />
      <div class="splash-title">MM Fitness App</div>
      <div class="splash-sub">Performance Signature</div>
      <div class="splash-line"><span></span></div>
    </div>
  </section>`;
}
function route() {
  if (state.screen === "active" && state.activeWorkout) return ActiveWorkout();
  if (state.auth.loading) return BootScreen();
  if (!state.auth.user) return LoginScreen();
  if (state.screen === "plan") return state.selectedDay === null ? Plan() : WorkoutDetail();
  if (state.screen === "logs") return Logs();
  if (state.screen === "nutrition") return Nutrition();
  if (state.screen === "progress") return Progress();
  if (state.screen === "profile") return ProfileScreen();
  if (state.screen === "admin") return canOpenAdminPanel(state.auth.profile) ? AdminScreen() : Home();
  return Home();
}
function BootScreen() {
  return `<section class="auth-screen">
    ${brandGlyph("auth-signature")}
    <div class="eyebrow">Secure athlete system</div>
    <h1 class="h1">Loading MM Fitness App</h1>
    <p class="command-copy">Checking your secure session.</p>
  </section>`;
}
function LoginScreen() {
  return `<section class="auth-screen">
    ${brandGlyph("auth-signature")}
    <div class="eyebrow">Private athlete OS</div>
    <h1 class="h1">Sign In</h1>
    <p class="command-copy">Access is controlled by the owner. Use an invited MM Fitness App account.</p>
    ${state.auth.error ? `<div class="paused-banner" style="text-align:left">${esc(state.auth.error)}</div>` : ""}
    <section class="form-card section-gap">
      <div class="field"><label>Email</label><input class="input" type="email" autocomplete="email" data-auth="email" placeholder="name@example.com" /></div>
      <div class="field"><label>Password</label><input class="input" type="password" autocomplete="current-password" data-auth="password" placeholder="Password" /></div>
      <button class="btn btn-primary section-gap" style="width:100%" data-action="auth-signin">Sign In</button>
    </section>
    <section class="card metric-card section-gap">
      <div class="eyebrow">Controlled Access</div>
      <div class="metric-sub">New users must be invited or created by the owner/admin through a secure backend flow. Public account creation is disabled in this app.</div>
    </section>
  </section>`;
}
function Header(title, eyebrow, right = ProfileAvatarButton()) {
  return `<header class="screen-head"><div><div class="eyebrow">${eyebrow}</div><h1 class="h1">${title}</h1></div>${right}</header>`;
}
function Avatar(profile = state.auth.profile, className = "profile-avatar") {
  const name = profile?.display_name || profile?.email || "MM";
  return profile?.avatar_url
    ? `<img class="${className}" src="${esc(profile.avatar_url)}" alt="${esc(name)} profile" />`
    : `<span class="${className} avatar-fallback">${esc(initials(name))}</span>`;
}
function ProfileAvatarButton() {
  return `<button class="profile-avatar-btn" data-nav="profile" aria-label="Open profile">${Avatar()}</button>`;
}
function HomeHeader() {
  return `<header class="home-head">
    <div>
      ${brandGlyph("home-signature")}
      <div class="eyebrow" style="margin-top:12px">${fmtDate()} · Week ${weekNumber()} / 36</div>
      <h1 class="h1">Mohammad</h1>
      ${SyncBadge()}
    </div>
    <div class="home-head-actions">${ProfileAvatarButton()}<button class="readiness-orb" data-action="theme"><strong>${readinessScore()}</strong><span>Readiness</span></button></div>
  </header>`;
}
function SyncBadge() {
  const sync = state.syncStatus || getSyncStatus();
  return `<div class="sync-badge ${sync.state || "local"}">${sync.label}</div>`;
}
function Home() {
  const d = todayPlan();
  const today = todayStr();
  const wl = state.workoutLogs[today];
  const nl = state.nutritionLogs[today];
  const log = state.logs[today] || {};
  const ws = weekStats();
  const weight = latestWeight();
  const next = getNextAction(d, wl, nl, log);
  const complete = wl?.completed;
  return `${HomeHeader()}
    <section class="command-card">
      <div class="command-top">
        <div class="eyebrow">Today's Workout</div>
        <div class="command-title">${workoutName(d)}</div>
        <p class="command-copy">${d.goal}</p>
        <div class="chip-row">
          <span class="chip">${d.duration ? d.duration + " min" : "Rest"}</span>
          <span class="chip">${d.exercises.length} moves</span>
          <span class="chip warning">${d.nutritionType} · ${d.calories}</span>
          ${d.hasPadel ? `<span class="chip padel">Padel ${d.padelTime}</span>` : ""}
          ${complete ? `<span class="chip" style="color:var(--success)">Workout done</span>` : ""}
        </div>
      </div>
      <div class="command-actions">
        <button class="btn btn-primary" data-action="${complete ? "view-plan-today" : "start-today"}">${complete ? "View Plan" : "Start Workout"}</button>
        <button class="btn btn-secondary" data-action="view-plan-today">Plan</button>
      </div>
    </section>

    <section class="card metric-card section-gap">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
        <div>
          <div class="eyebrow" style="color:var(--warning)">Nutrition Target</div>
          <div class="metric-value">${d.calories}<span style="font-size:12px;color:var(--muted);font-weight:800"> kcal</span></div>
          <div class="metric-sub">${d.protein}P · ${d.carbs}C · ${d.fats}F</div>
        </div>
        <div style="min-width:92px">
          <div class="rail"><span style="--pct:${nl?.adhered ? 100 : 62}%;background:var(--warning)"></span></div>
          <div class="metric-sub" style="text-align:right">${nl?.adhered ? "Logged" : d.nutritionType + " day"}</div>
        </div>
      </div>
    </section>

    <div class="grid-2 section-gap">
      <section class="card metric-card">
        <div class="eyebrow">Recovery</div>
        <div class="metric-value">${recoveryLabel(log)}</div>
        <div class="metric-sub">Sleep ${log.sleepScore || "—"}/5 · Energy ${log.energyScore || "—"}/5</div>
      </section>
      <section class="card metric-card">
        <div class="eyebrow">Body</div>
        <div class="metric-value">${weight ? weight.weight : "—"}<span style="font-size:12px;color:var(--muted);font-weight:800"> kg</span></div>
        <div class="metric-sub">${weight ? `${(weight.weight - PLAN.startWeight).toFixed(1)} kg vs start` : "Log first weight"}</div>
      </section>
    </div>

    <section class="card weekly-card section-gap home-tail">
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="card-title">Weekly Progress</div><button class="btn btn-ghost" style="min-height:34px;padding:0 12px" data-nav="progress">Details</button></div>
      ${ProgressRow("Workouts", ws.workouts, 5, "var(--accent)")}
      ${ProgressRow("Padel", ws.padel, 2, "var(--padel)")}
      ${ProgressRow("Nutrition", ws.nutrition, 7, "var(--success)")}
    </section>

    <section class="card weekly-card section-gap">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px">
        <div><div class="eyebrow">Next Action</div><div class="card-title" style="margin-top:5px">${next.label}</div></div>
        <button class="btn btn-primary" style="min-height:42px;padding:0 14px" data-action="${next.action}">Open</button>
      </div>
      <div class="quick-grid">
        ${Quick("Log Weight", "weight", !!log.bodyWeight, "logs")}
        ${Quick("Nutrition", "nutrition", !!nl?.adhered, "nutrition")}
        ${Quick("Recovery", "moon", !!log.sleepScore, "logs")}
        ${Quick("Activity", "play", activitiesForDate(state.activityLogs, today, state.padelLogs).length > 0, "activity")}
      </div>
    </section>`;
}
function readinessScore() {
  const log = state.logs[todayStr()] || {};
  const scores = [log.energyScore || 4, log.sleepScore || 4, log.sorenessScore ? 6 - log.sorenessScore : 4, log.achillesScore ? 6 - log.achillesScore : 4];
  return Math.round(scores.reduce((a, b) => a + b, 0) / 20 * 100);
}
function recoveryLabel(log) {
  const avg = ((log.energyScore || 4) + (log.sleepScore || 4) + (log.sorenessScore ? 6 - log.sorenessScore : 4)) / 3;
  if (avg >= 4.3) return "Great";
  if (avg >= 3.3) return "Good";
  return "Watch";
}
function ProgressRow(label, value, target, color) {
  return `<div class="weekly-row"><span>${label}</span><div class="rail"><span style="--pct:${pct(value,target)}%;background:${color}"></span></div><strong>${value}/${target}</strong></div>`;
}
function Quick(label, iconName, done, target, disabled = false) {
  return `<button class="quick-btn ${done ? "done" : ""}" ${disabled ? "disabled" : ""} data-quick="${target}">${icon(iconName)}<span>${label}</span></button>`;
}
function getNextAction(d, wl, nl, log) {
  if (d.exercises.length && !wl?.completed) return { label: "Start Workout", action: "start-today" };
  if (!nl?.adhered) return { label: "Log Nutrition", action: "go-nutrition" };
  if (!log.sleepScore || !log.energyScore) return { label: "Log Recovery", action: "go-logs" };
  if (d.hasPadel && !activitiesForDate(state.activityLogs, todayStr(), state.padelLogs).some((activity) => activity.type === "padel" && activity.completed)) return { label: "Log Padel", action: "toggle-padel" };
  return { label: "Review Progress", action: "go-progress" };
}
function Plan() {
  const dates = weekDates();
  return `${Header("Training Week", `Sunday to Saturday · Week ${weekNumber()}`)}
    <div class="panel-list">
      ${state.plan.days.map((d, i) => {
        const done = state.workoutLogs[dates[i]]?.completed;
        return `<article class="day-card" data-day="${i}">
          <div>
            <div class="day-title">${d.day}</div>
            <div class="day-meta">${workoutName(d)} · ${d.duration ? d.duration + " min" : "Rest"} · ${d.nutritionType} ${d.calories}</div>
            ${d.hasPadel ? `<div class="day-meta" style="color:var(--padel);margin-top:4px">Padel ${d.padelTime} · ${d.padelDuration} min</div>` : ""}
          </div>
          <span class="pill" style="${done ? "color:var(--success);border-color:color-mix(in srgb,var(--success) 30%,transparent)" : ""}">${done ? "Done" : d.exercises.length + " moves"}</span>
        </article>`;
      }).join("")}
    </div>`;
}
function WorkoutDetail() {
  const idx = state.selectedDay ?? todayPlan().dayIndex;
  const d = state.plan.days[idx];
  if (state.editingPlan) return WorkoutEditor(d, idx);
  return `${Header(workoutName(d), `${d.day} · ${d.category} · ${d.duration ? d.duration + " min" : "Rest"}`, `<button class="btn btn-secondary" data-action="back-plan" style="min-height:40px">Back</button>`)}
    <section class="command-card" style="margin-bottom:14px">
      <div class="eyebrow">Session Goal</div>
      <p class="command-copy" style="margin-top:8px">${d.goal}</p>
      <div class="chip-row">
        <span class="chip warning">${d.nutritionType} · ${d.calories}</span>
        ${d.hasPadel ? `<span class="chip padel">Padel ${d.padelTime}</span>` : ""}
      </div>
      <div class="command-actions">
        ${d.exercises.length ? `<button class="btn btn-primary" data-action="start-selected">Start Workout</button>` : `<button class="btn btn-primary" data-action="edit-workout">Add Workout</button>`}
        <button class="btn btn-secondary" data-action="edit-workout">Edit</button>
      </div>
    </section>
    <div class="panel-list">${d.exercises.length ? d.exercises.map((ex, i) => ExerciseView(ex, i)).join("") : `<div class="empty card">Rest day. Keep movement light and recovery focused.</div>`}</div>`;
}
function WorkoutEditor(d, idx) {
  return `${Header("Edit Workout", `${d.day} · ${workoutName(d)}`, `<button class="btn btn-primary" data-action="done-edit" style="min-height:40px">Done</button>`)}
    <section class="form-card">
      <div class="card-title">Session Details</div>
      ${EditField("Workout Name", "workoutName", workoutName(d))}
      ${EditField("Training Category", "category", d.category)}
      ${EditField("Duration", "duration", d.duration, "number")}
      <div class="field"><label>Session Goal</label><textarea data-edit-day="${idx}" data-field="goal">${esc(d.goal)}</textarea></div>
      <div class="field"><label>Nutrition Day Type</label>
        <div class="segmented">${["HIGH","MED","LOW"].map((t) => `<button class="${d.nutritionType === t ? "active" : ""}" data-edit-nutrition="${idx}" data-type="${t}">${t}</button>`).join("")}</div>
      </div>
      <div class="field"><label>Padel Schedule</label>
        <div class="segmented"><button class="${d.hasPadel ? "active" : ""}" data-edit-padel="${idx}" data-value="true">On</button><button class="${!d.hasPadel ? "active" : ""}" data-edit-padel="${idx}" data-value="false">Off</button><button data-action="add-exercise">Add Exercise</button></div>
      </div>
      ${d.hasPadel ? `<div class="grid-2">${EditField("Padel Time", "padelTime", d.padelTime || "", "text", idx)}${EditField("Padel Duration", "padelDuration", d.padelDuration || 90, "number", idx)}</div>` : ""}
    </section>
    <section class="section-gap">
      <div class="panel-list">${d.exercises.map((ex, i) => ExerciseEditor(ex, i, idx)).join("")}</div>
      <button class="btn btn-primary section-gap" data-action="add-exercise" style="width:100%">Add Exercise</button>
    </section>`;
}
function EditField(label, field, value, type = "text", idx = state.selectedDay ?? todayPlan().dayIndex) {
  return `<div class="field"><label>${label}</label><input class="input" data-edit-day="${idx}" data-field="${field}" type="${type}" value="${esc(value)}" /></div>`;
}
function ExerciseEditor(ex, i, dayIdx) {
  return `<article class="exercise-card edit-exercise">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
      <div class="day-title">${i + 1}. Exercise</div>
      <div style="display:flex;gap:6px">
        <button class="mini-btn" data-move-ex="${i}" data-dir="-1">↑</button>
        <button class="mini-btn" data-move-ex="${i}" data-dir="1">↓</button>
        <button class="mini-btn danger" data-remove-ex="${i}">Remove</button>
      </div>
    </div>
    <div class="field"><label>Name</label><input class="input" data-edit-ex="${i}" data-field="name" value="${esc(ex.name)}" /></div>
    <div class="edit-grid">
      <div class="field"><label>Sets</label><input class="input" type="number" data-edit-ex="${i}" data-field="sets" value="${esc(ex.sets)}" /></div>
      <div class="field"><label>Reps</label><input class="input" data-edit-ex="${i}" data-field="reps" value="${esc(ex.reps)}" /></div>
      <div class="field"><label>Weight Target</label><input class="input" data-edit-ex="${i}" data-field="weightTarget" placeholder="optional" value="${esc(ex.weightTarget || "")}" /></div>
      <div class="field"><label>Rest</label><input class="input" type="number" data-edit-ex="${i}" data-field="rest" value="${esc(ex.rest || 0)}" /></div>
    </div>
    <div class="field"><label>Intensity</label><input class="input" data-edit-ex="${i}" data-field="intensity" value="${esc(ex.intensity)}" /></div>
    <div class="field"><label>Notes</label><textarea data-edit-ex="${i}" data-field="notes">${esc(ex.notes || "")}</textarea></div>
  </article>`;
}
function ExerciseView(ex, i) {
  return `<article class="exercise-card">
    <div class="day-title">${i + 1}. ${ex.name}</div>
    <div class="exercise-meta"><span>${ex.sets} × ${ex.reps}</span><span>${ex.intensity}</span>${ex.rest ? `<span>${ex.rest}s rest</span>` : ""}</div>
    ${ex.notes ? `<div class="day-meta">${ex.notes}</div>` : ""}
  </article>`;
}
function startWorkout(dayIndex) {
  const d = state.plan.days[dayIndex];
  if (!d.exercises.length) {
    toast("No workout scheduled today");
    return;
  }
  state.activeWorkout = {
    id: `workout-${Date.now()}`,
    dayIndex,
    startedAt: Date.now(),
    elapsedBeforePause: 0,
    pausedAt: null,
    paused: false,
    sets: {}
  };
  state.screen = "active";
  state.activeCursor = { exerciseIndex: 0, setIndex: 0 };
  pendingScrollY = 0;
  saveAll();
  render();
}
function ActiveWorkout() {
  if (!state.activeWorkout) startWorkout(todayPlan().dayIndex);
  const aw = state.activeWorkout;
  const d = state.plan.days[aw.dayIndex];
  const totalSets = d.exercises.reduce((sum, ex) => sum + Number(ex.sets || 0), 0);
  const doneSets = Object.values(aw.sets || {}).filter((s) => s.done).length;
  return `<section class="active-head">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div><div class="eyebrow">${d.day}</div><div class="h1" style="font-size:24px">${workoutName(d)}</div></div>
        <div style="text-align:right"><div class="timer">${formatElapsed(elapsed(aw))}</div><div class="day-meta">${doneSets}/${totalSets} sets</div></div>
      </div>
      <div class="rail" style="margin-top:12px"><span style="--pct:${pct(doneSets,totalSets)}%"></span></div>
      <div class="active-mini-actions">
        ${aw.paused ? `<button class="btn btn-primary" data-action="resume-workout">Resume</button>` : `<button class="btn btn-secondary" data-action="pause-workout">Pause</button>`}
        <button class="btn btn-danger" data-action="cancel-workout">Cancel</button>
      </div>
    </section>
    ${aw.paused ? `<div class="paused-banner">Workout paused. Timer stopped and your set data is preserved.</div>` : ""}
    <div class="panel-list">${d.exercises.map((ex, exIdx) => ActiveExercise(ex, exIdx)).join("")}</div>
    <div class="workout-controls">
      <button class="btn btn-primary" style="grid-column:1/-1" data-action="finish-workout">Finish Workout</button>
    </div>`;
}
function ActiveExercise(ex, exIdx) {
  const performance = summarizeCurrentExercise(ex.name, exIdx, state.activeWorkout, state.workoutLogs, state.plan);
  const allDone = Array.from({ length: Number(ex.sets) }, (_, i) => state.activeWorkout.sets[`${exIdx}-${i}`]?.done).every(Boolean);
  return `<article class="exercise-card" style="${allDone ? "border-color:color-mix(in srgb,var(--success) 32%,transparent)" : ""}">
    <div style="display:flex;justify-content:space-between;gap:10px">
      <div>
        <div class="day-title">${allDone ? "✓ " : ""}${ex.name}</div>
        <div class="exercise-meta"><span>${ex.sets} × ${ex.reps}</span><span>${ex.intensity}</span>${ex.rest ? `<span>${ex.rest}s rest</span>` : ""}</div>
      </div>
    </div>
    ${ex.notes ? `<div class="day-meta">${ex.notes}</div>` : ""}
    ${ExercisePerformanceCard(performance)}
    ${Array.from({ length: Number(ex.sets) }, (_, setIdx) => SetRow(exIdx, setIdx)).join("")}
  </article>`;
}
function ExercisePerformanceCard(performance) {
  const best = performance.previousBest;
  const last = performance.last;
  const currentPrs = performance.prs.filter((pr) => pr.type !== "first_record");
  if (!best && !last) {
    return `<div class="performance-strip empty">Not enough history yet. Complete this exercise once to unlock best and last-session context.</div>`;
  }
  return `<div class="performance-strip">
    <div>
      <span class="perf-label">Last</span>
      <strong>${last ? `${kg(last.bestWeight)} × ${last.bestReps || "-"} · ${last.completedSets || 0} sets · Vol ${kg(last.totalVolume)}` : "Not enough data"}</strong>
    </div>
    <div>
      <span class="perf-label">Best</span>
      <strong>${best ? `${kg(best.bestWeight)} × ${best.bestReps || "-"} · 1RM ${kg(best.bestEstimatedOneRepMax)} · Vol ${kg(best.totalVolume)}` : "Not enough data"}</strong>
    </div>
    ${currentPrs.length ? `<span class="pr-badge">New PR</span>` : ""}
  </div>`;
}
function SetRow(exIdx, setIdx) {
  const key = `${exIdx}-${setIdx}`;
  const s = state.activeWorkout.sets[key] || {};
  return `<div class="set-row ${s.done ? "done" : ""}">
    <strong class="day-meta">S${setIdx + 1}</strong>
    <input class="input" inputmode="decimal" type="number" placeholder="kg" value="${s.weight || ""}" data-set="${key}" data-field="weight" />
    <input class="input" inputmode="numeric" type="number" placeholder="reps" value="${s.reps || ""}" data-set="${key}" data-field="reps" />
    <button class="check-btn ${s.done ? "done" : ""}" data-set-done="${key}">${s.done ? "✓" : "○"}</button>
  </div>`;
}
function elapsed(aw) {
  if (!aw) return 0;
  if (aw.paused) return aw.elapsedBeforePause || 0;
  return (aw.elapsedBeforePause || 0) + Math.floor((Date.now() - aw.startedAt) / 1000);
}
function formatElapsed(s) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
function pauseWorkout() {
  const aw = state.activeWorkout;
  aw.elapsedBeforePause = elapsed(aw);
  aw.paused = true;
  aw.pausedAt = Date.now();
  saveAll();
  render();
}
function resumeWorkout() {
  const aw = state.activeWorkout;
  aw.startedAt = Date.now();
  aw.paused = false;
  aw.pausedAt = null;
  saveAll();
  render();
}
function Logs() {
  const log = state.logs[todayStr()] || {};
  return `${Header("Logs", "Daily review")}
    ${HistoryCalendar()}
    ${DailyActivities(state.historySelectedDate)}
    <section class="form-card">
      <div class="card-title">Body Metrics</div>
      ${Field("Weight (kg)", "bodyWeight", log.bodyWeight || "", "number", "e.g. 99.1")}
      ${Field("Waist (cm)", "waist", log.waist || "", "number", "optional")}
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Recovery</div>
      ${Score("Energy", "energyScore", log.energyScore)}
      ${Score("Soreness", "sorenessScore", log.sorenessScore)}
      ${Score("Sleep", "sleepScore", log.sleepScore)}
      ${Score("Achilles", "achillesScore", log.achillesScore)}
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Diet Adherence</div>
      ${Adherence("dietAdherence", log.dietAdherence)}
      <div class="field"><label>Notes</label><textarea data-log="notes" placeholder="How did today go?">${log.notes || ""}</textarea></div>
    </section>`;
}
function HistoryCalendar() {
  const history = dayHistory(state.historySelectedDate, {
    workoutLogs: state.workoutLogs,
    dailyLogs: state.logs,
    nutritionLogs: state.nutritionLogs,
    padelLogs: state.padelLogs,
    activityLogs: state.activityLogs,
    plan: state.plan
  });
  const cells = monthCalendar(state.historySelectedDate, {
    workoutLogs: state.workoutLogs,
    nutritionLogs: state.nutritionLogs,
    padelLogs: state.padelLogs,
    activityLogs: state.activityLogs,
    plan: state.plan
  });
  return `<section class="card weekly-card section-gap history-panel">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
      <div>
        <div class="card-title">History / Calendar</div>
        <div class="day-meta">${fmtDate(state.historySelectedDate)}</div>
      </div>
      <button class="mini-btn" data-action="history-today">Today</button>
    </div>
    <div class="calendar-grid section-gap">
      ${["S","M","T","W","T","F","S"].map((day) => `<div class="calendar-weekday">${day}</div>`).join("")}
      ${cells.map((cell) => CalendarCell(cell)).join("")}
    </div>
    ${HistoryDaySummary(history)}
  </section>`;
}
function CalendarCell(cell) {
  const s = cell.status;
  const classes = [
    "calendar-day",
    cell.inMonth ? "" : "muted",
    cell.isToday ? "today" : "",
    cell.isSelected ? "selected" : "",
    s.workoutCompleted ? "workout" : "",
    s.padelCompleted || s.padelScheduled ? "padel" : "",
    s.swimmingCompleted ? "swimming" : "",
    s.nutritionAdhered ? "nutrition" : "",
    s.missed ? "missed" : ""
  ].filter(Boolean).join(" ");
  return `<button class="${classes}" data-history-date="${cell.date}">
    <span>${cell.dayNumber}</span>
    <i class="calendar-markers">${s.workoutCompleted ? "<b class='workout'></b>" : ""}${s.padelCompleted || s.padelScheduled ? "<b class='padel'></b>" : ""}${s.swimmingCompleted ? "<b class='swimming'></b>" : ""}${s.nutritionAdhered ? "<b class='nutrition'></b>" : ""}${s.missed && !s.workoutCompleted ? "<b class='missed'></b>" : ""}</i>
  </button>`;
}
function HistoryDaySummary(history) {
  const summary = history.workoutSummary;
  const log = history.dailyLog || {};
  const nutrition = history.nutrition || {};
  const padel = history.padel || {};
  const activities = history.activities || [];
  return `<div class="history-summary">
    <div class="summary-line"><span>Workout</span><strong>${summary ? esc(summary.workoutName) : history.status.missed ? "Missed / not logged" : "No workout logged"}</strong></div>
    ${summary ? `
      <div class="summary-line"><span>Duration</span><strong>${summary.duration} min</strong></div>
      <div class="summary-line"><span>Completed Sets</span><strong>${summary.completedSets}</strong></div>
      <div class="summary-line"><span>Total Volume</span><strong>${kg(summary.totalVolume)}</strong></div>
      <div class="perf-label">Best estimated 1RM</div>
      ${summary.bestOneRepMaxHighlights.length ? summary.bestOneRepMaxHighlights.map((item) => `<div class="summary-line"><span>${esc(item.exerciseName)}</span><strong>${kg(item.bestEstimatedOneRepMax)}</strong></div>`).join("") : `<div class="empty small">Not enough weighted data.</div>`}
      <div class="perf-label">Exercises</div>
      ${summary.exercises.length ? summary.exercises.map((exercise) => HistoryExercise(exercise)).join("") : `<div class="empty small">No completed weighted sets.</div>`}
      <div class="perf-label">PRs</div>
      ${history.prs.length ? history.prs.map((pr) => `<span class="chip success">${esc(pr.exerciseName)} · ${esc(pr.label)}</span>`).join("") : `<div class="empty small">No PRs detected.</div>`}
    ` : ""}
    <div class="summary-divider"></div>
    <div class="summary-line"><span>Nutrition</span><strong>${nutrition.adhered ? esc(nutrition.adhered) : "No nutrition log"}</strong></div>
    <div class="perf-label">Activities</div>
    ${activities.length ? activities.map(ActivityHistoryRow).join("") : `<div class="empty small">No activity logged.</div>`}
    <div class="summary-line"><span>Body</span><strong>${log.bodyWeight ? `${log.bodyWeight} kg` : "No body metrics"}</strong></div>
    ${log.notes ? `<div class="day-meta history-note">${esc(log.notes)}</div>` : ""}
  </div>`;
}
function ActivityHistoryRow(activity) {
  return `<div class="summary-line"><span>${activityLabel(activity.type)}${activity.time ? ` · ${esc(activity.time)}` : ""}</span><strong>${activity.duration || 0} min · ${esc(activity.intensity || "moderate")}</strong></div>`;
}
function DailyActivities(date) {
  const activities = activitiesForDate(state.activityLogs, date, state.padelLogs);
  return `<section class="form-card section-gap activity-panel">
    <div class="activity-panel-head">
      <div><div class="card-title">Daily Activities</div><div class="day-meta">${fmtDate(date)} · Padel or swimming</div></div>
      <button class="btn btn-primary" data-action="add-activity" style="min-height:40px;padding:0 14px">Add Activity</button>
    </div>
    <div class="activity-list section-gap">
      ${activities.length ? activities.map(ActivityCard).join("") : `<div class="empty small">No padel or swimming logged for this day.</div>`}
    </div>
  </section>`;
}
function ActivityCard(activity) {
  return `<article class="activity-card ${activity.type}">
    <div class="activity-icon">${activity.type === "swimming" ? "≈" : "P"}</div>
    <div class="activity-info"><strong>${activityLabel(activity.type)}</strong><span>${activity.duration || 0} min · ${esc(activity.intensity || "moderate")}${activity.time ? ` · ${esc(activity.time)}` : ""}</span>${activity.notes ? `<small>${esc(activity.notes)}</small>` : ""}</div>
    ${activity.source === "legacy" ? `<span class="chip">Legacy</span>` : `<button class="icon-action" data-remove-activity="${esc(activity.id)}" data-activity-date="${esc(activity.date)}" aria-label="Remove ${activityLabel(activity.type)}">×</button>`}
  </article>`;
}
function HistoryExercise(exercise) {
  const sets = exercise.loggedSets || [];
  return `<article class="history-exercise">
    <div class="summary-line"><span>${esc(exercise.exerciseName)}</span><strong>${kg(exercise.totalVolume)}</strong></div>
    ${sets.length ? sets.map((set) => `<div class="day-meta">S${(set.setIndex ?? 0) + 1}: ${set.done ? `${set.weight || "-"} kg × ${set.reps || "-"} reps` : "not completed"}</div>`).join("") : `<div class="day-meta">${exercise.completedSets} completed sets</div>`}
  </article>`;
}
function Field(label, field, value, type, ph) {
  return `<div class="field"><label>${label}</label><input class="input" data-log="${field}" type="${type}" step="0.1" placeholder="${ph}" value="${value}" /></div>`;
}
function Score(label, field, value) {
  return `<div class="score-row"><span class="day-meta">${label}</span><div class="score-grid">${[1,2,3,4,5].map((n) => `<button class="score-btn ${value === n ? "active" : ""}" data-score="${field}" data-value="${n}">${n}</button>`).join("")}</div></div>`;
}
function Adherence(field, value) {
  return `<div class="segmented">${["yes", "partial", "no"].map((v) => `<button class="${value === v ? "active" : ""}" data-adherence="${field}" data-value="${v}">${v === "yes" ? "Yes" : v === "partial" ? "Partial" : "No"}</button>`).join("")}</div>`;
}
function Nutrition() {
  const d = todayPlan();
  const nl = state.nutritionLogs[todayStr()] || {};
  return `${Header("Nutrition", `${d.nutritionType} day · ${fmtDate()}`)}
    <section class="command-card">
      <div class="eyebrow">Today's Target</div>
      <div class="command-title">${d.calories}<span style="font-size:14px;color:var(--muted)"> kcal</span></div>
      <p class="command-copy">${d.protein}g protein · ${d.carbs}g carbs · ${d.fats}g fats</p>
      <div class="chip-row"><span class="chip warning">${d.nutritionType}</span><span class="chip">Fiber 30g+</span></div>
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Adherence</div>
      ${Adherence("nutrition", nl.adhered)}
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Actual Intake</div>
      <div class="grid-2">
        ${NutritionField("Calories", "actualCalories", nl.actualCalories)}
        ${NutritionField("Protein", "actualProtein", nl.actualProtein)}
        ${NutritionField("Carbs", "actualCarbs", nl.actualCarbs)}
        ${NutritionField("Fats", "actualFats", nl.actualFats)}
      </div>
      <div class="field"><label>Notes</label><textarea data-nutrition="notes" placeholder="Nutrition notes">${nl.notes || ""}</textarea></div>
    </section>`;
}
function NutritionField(label, field, value) {
  return `<div class="field"><label>${label}</label><input class="input" type="number" data-nutrition="${field}" placeholder="0" value="${value || ""}" /></div>`;
}
function Progress() {
  const ws = weekStats();
  const performance = summarizeProgress(state.workoutLogs, state.plan);
  const weight = latestWeight();
  const totalWorkouts = Object.values(state.workoutLogs).filter((w) => w.completed).length;
  const totalPadel = activityCount(state.activityLogs, "padel", null, state.padelLogs);
  const weights = Object.entries(state.logs).filter(([, v]) => v.bodyWeight).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
  const strengthTrend = aggregateVolumeTrend(performance.sessions, state.strengthPeriod);
  const strengthPeriodTotal = strengthTrend.reduce((sum, item) => sum + item.totalVolume, 0);
  return `${Header("Progress", "Performance review")}
    <div class="grid-2">
      <section class="card metric-card"><div class="eyebrow">Current Weight</div><div class="metric-value">${weight ? weight.weight : PLAN.startWeight}<span style="font-size:12px;color:var(--muted)"> kg</span></div><div class="metric-sub">Target ${PLAN.targetWeight} kg</div></section>
      <section class="card metric-card"><div class="eyebrow">Plan Progress</div><div class="metric-value">${weekNumber()}<span style="font-size:12px;color:var(--muted)"> /36</span></div><div class="metric-sub">Foundation phase</div></section>
      <section class="card metric-card"><div class="eyebrow">Workouts</div><div class="metric-value">${totalWorkouts}</div><div class="metric-sub">Completed sessions</div></section>
      <section class="card metric-card"><div class="eyebrow">Padel</div><div class="metric-value">${totalPadel}</div><div class="metric-sub">Completed sessions</div></section>
    </div>
    <section class="card weekly-card section-gap">
      <div class="card-title">This Week</div>
      ${ProgressRow("Workouts", ws.workouts, 5, "var(--accent)")}
      ${ProgressRow("Padel", ws.padel, 2, "var(--padel)")}
      ${ProgressRow("Nutrition", ws.nutrition, 7, "var(--success)")}
    </section>
    <section class="card weekly-card section-gap">
      <div class="card-title">Weight Trend</div>
      ${weights.length > 1 ? TrendBars(weights.map(([date, v]) => ({ label: date.slice(5), value: Number(v.bodyWeight || 0) })), "weight") : `<div class="empty">Log two weight entries to reveal the trend.</div>`}
    </section>
    <section class="card weekly-card section-gap">
      <div class="strength-chart-head">
        <div>
          <div class="card-title">Strength Progress</div>
          <div class="metric-sub">${strengthTrend.length ? `${state.strengthPeriod[0].toUpperCase() + state.strengthPeriod.slice(1)} volume: ${kg(strengthPeriodTotal)}` : `Total logged volume: ${kg(performance.totalVolume)}`}</div>
        </div>
        <div class="segmented strength-period" aria-label="Strength progress period">
          ${["daily", "weekly", "monthly"].map((period) => `<button class="${state.strengthPeriod === period ? "active" : ""}" data-strength-period="${period}">${period[0].toUpperCase() + period.slice(1)}</button>`).join("")}
        </div>
      </div>
      ${strengthTrend.length ? VolumeLineChart(strengthTrend) : `<div class="empty">Finish a weighted workout to reveal volume trend.</div>`}
    </section>
    <section class="card weekly-card section-gap">
      <div class="card-title">Best Estimated 1RM</div>
      ${performance.bestByExercise.length ? performance.bestByExercise.map((item) => `<div class="summary-line"><span>${esc(item.exerciseName)}</span><strong>${kg(item.bestEstimatedOneRepMax)}</strong></div>`).join("") : `<div class="empty">No completed weighted sets yet.</div>`}
    </section>
    <section class="card weekly-card section-gap">
      <div class="card-title">Recent PRs</div>
      ${performance.prList.length ? performance.prList.map((item) => `<div class="summary-line"><span>${esc(item.exerciseName)}</span><strong>${esc(item.label)}</strong></div>`).join("") : `<div class="empty">PRs will appear after you beat a previous best.</div>`}
    </section>
    <section class="form-card section-gap">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div>
          <div class="card-title">Cloud Performance Data</div>
          <div class="day-meta">${esc(state.auth.profile?.email || state.auth.user?.email || "")}</div>
          <div class="day-meta">Role: ${esc(state.auth.profile?.role || "athlete")} · ${esc((state.syncStatus || getSyncStatus()).detail)}</div>
        </div>
        ${SyncBadge()}
      </div>
      <button class="btn btn-secondary section-gap" style="width:100%" data-nav="profile">Account & Settings</button>
    </section>`;
}
function ProfileScreen() {
  const profile = state.auth.profile || {};
  const canAdmin = canOpenAdminPanel(profile);
  return `${Header("Profile", "Private athlete identity", `<button class="btn btn-secondary" data-action="profile-back" style="min-height:40px">Back</button>`)}
    <section class="profile-hero">
      <div class="profile-avatar-wrap">${Avatar(profile, "profile-avatar profile-avatar-large")}</div>
      <div class="profile-identity">
        <div class="eyebrow">${esc(roleLabel(profile.role || ROLES.ATHLETE))}</div>
        <h2>${esc(profile.display_name || "MM Athlete")}</h2>
        <p>${esc(profile.email || state.auth.user?.email || "")}</p>
        <span class="chip success">${esc((state.syncStatus || getSyncStatus()).label)}</span>
      </div>
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Personal Profile</div>
      <div class="field"><label>Profile Picture</label><input class="input" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-profile-avatar /></div>
      <div class="field"><label>Display Name</label><input class="input" data-profile-field="display_name" value="${esc(profile.display_name || "")}" /></div>
      <div class="field"><label>Bio</label><textarea data-profile-field="bio" placeholder="Training focus, goals, or coaching notes">${esc(profile.bio || "")}</textarea></div>
      <button class="btn btn-primary section-gap" style="width:100%" data-action="save-profile">Save Profile</button>
      ${state.profileStatus ? `<div class="admin-note">${esc(state.profileStatus)}</div>` : ""}
    </section>
    ${canAdmin ? `<section class="profile-admin-entry section-gap">
      <div><div class="eyebrow">Private Management</div><div class="card-title">Admin Workspace</div><p>Players, access, activity, plans, roles, and permissions.</p></div>
      <button class="btn btn-primary" data-action="open-admin-workspace">Open</button>
    </section>` : ""}
    <section class="form-card section-gap">
      <div class="card-title">Appearance</div>
      <div class="segmented"><button class="${state.theme === "dark" ? "active" : ""}" data-theme-set="dark">Dark</button><button class="${state.theme === "light" ? "active" : ""}" data-theme-set="light">Light</button><button data-action="reset-demo">Reset Logs</button></div>
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Data & Account</div>
      <div class="grid-2 section-gap">
        <button class="btn btn-secondary" data-action="export-backup">Export Backup</button>
        <button class="btn btn-secondary" data-action="cloud-backup-now">Cloud Backup</button>
      </div>
      <div class="field"><label>Import Backup JSON</label><input class="input" type="file" accept="application/json" data-import-backup /></div>
      <button class="btn btn-danger section-gap" style="width:100%" data-action="logout">Logout</button>
    </section>`;
}
function AdminScreen() {
  return `${Header("Admin Workspace", "Owner command center", `<button class="btn btn-secondary" data-nav="profile" style="min-height:40px">Profile</button>`)}
    <section class="admin-screen-intro">
      <div><div class="eyebrow">Secure Management</div><div class="command-title">Players & Access</div><p class="command-copy">Each player has an isolated identity, athlete profile, plan, activity history, and database access boundary.</p></div>
      <span class="admin-status">Private</span>
    </section>
    ${AdminPanel()}`;
}
function TrendBars(items, mode) {
  const values = items.map((item) => Number(item.value || 0)).filter(Number.isFinite);
  const max = Math.max(...values, 1);
  const min = mode === "weight" ? Math.min(...values) : 0;
  const range = Math.max(max - min, mode === "weight" ? 1 : max);
  return `<div class="trend-chart ${items.length === 1 ? "single" : ""}" style="--trend-count:${Math.max(2, Math.min(8, items.length))}">
    ${items.map((item) => {
      const normalized = mode === "weight" ? (item.value - min) / range : item.value / max;
      const height = Math.round(22 + Math.max(0, Math.min(1, normalized)) * 66);
      return `<div class="trend-column" title="${esc(item.title || item.label)}">
        <div class="trend-value">${mode === "weight" ? Number(item.value).toFixed(1) : Math.round(item.value).toLocaleString("en-US")}</div>
        <div class="trend-track"><span style="--trend-height:${height}%"></span></div>
        <div class="trend-label">${esc(item.label)}</div>
      </div>`;
    }).join("")}
  </div>`;
}
function VolumeLineChart(items) {
  const width = 640;
  const height = 210;
  const plot = { left: 34, right: 18, top: 24, bottom: 42 };
  const values = items.map((item) => Number(item.totalVolume || 0));
  const max = Math.max(...values, 1);
  const usableWidth = width - plot.left - plot.right;
  const usableHeight = height - plot.top - plot.bottom;
  const points = items.map((item, index) => {
    const x = items.length === 1 ? width / 2 : plot.left + (index / (items.length - 1)) * usableWidth;
    const y = plot.top + usableHeight - (Number(item.totalVolume || 0) / max) * usableHeight;
    return { ...item, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length > 1 ? `${plot.left},${height - plot.bottom} ${polyline} ${points.at(-1).x},${height - plot.bottom}` : "";
  return `<div class="line-chart-shell">
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(state.strengthPeriod)} strength volume trend">
      <defs>
        <linearGradient id="strengthArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".25"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>
      </defs>
      ${[0, .5, 1].map((ratio) => `<line class="chart-grid-line" x1="${plot.left}" x2="${width - plot.right}" y1="${plot.top + usableHeight * ratio}" y2="${plot.top + usableHeight * ratio}" />`).join("")}
      ${area ? `<polygon class="chart-area" points="${area}" />` : ""}
      ${points.length > 1 ? `<polyline class="chart-line" points="${polyline}" />` : ""}
      ${points.map((point) => `<g class="chart-point"><circle cx="${point.x}" cy="${point.y}" r="5"/><text class="chart-value" x="${point.x}" y="${Math.max(14, point.y - 12)}" text-anchor="middle">${compactKg(point.totalVolume)}</text><text class="chart-label" x="${point.x}" y="${height - 14}" text-anchor="middle">${esc(point.label)}</text><title>${esc(`${point.label}: ${kg(point.totalVolume)} · ${point.title}`)}</title></g>`).join("")}
    </svg>
  </div>`;
}
function compactKg(value) {
  const amount = Number(value || 0);
  return amount >= 1000 ? `${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k` : `${Math.round(amount)}`;
}
function AdminPanel() {
  const currentEmail = state.auth.profile?.email || state.auth.user?.email || "Signed-in user";
  const role = isOwnerEmail(currentEmail) ? ROLES.OWNER : (state.auth.profile?.role || ROLES.ATHLETE);
  return `<section class="form-card section-gap admin-panel">
    <div class="admin-hero">
      <div>
        <div class="eyebrow">Owner Command Center</div>
        <div class="admin-title">Admin Panel</div>
        <div class="metric-sub">Manage access, roles, permissions, and athlete assignments from one clean control surface.</div>
      </div>
      <span class="admin-status">Private</span>
    </div>
    <div class="admin-kpi-grid section-gap">
      ${AdminKpi("Current role", roleLabel(role), "Owner controls enabled")}
      ${AdminKpi("Users", state.adminUsers.length || "—", state.adminUsers.length ? "Loaded from database" : "Load directory")}
      ${AdminKpi("Athletes", state.adminAthletes.length || "—", state.adminAthletes.length ? "Separate profiles" : "Load directory")}
      ${AdminKpi("Security", "RLS", "Database policies applied")}
    </div>
    <div class="admin-current-user section-gap">
      <div>
        <div class="eyebrow">Signed In</div>
        <strong>${esc(currentEmail)}</strong>
        <div class="day-meta">${roleLabel(role)} · active · cloud account</div>
      </div>
      <span class="chip success">${esc(role)}</span>
    </div>
    ${AdminPlayerCommandCenter()}
    ${AdminCreateUserForm()}
    <div class="admin-section section-gap">
      <div class="admin-section-head">
        <div>
          <div class="eyebrow">Primary Actions</div>
          <div class="card-title">Straightforward Access Control</div>
        </div>
        <span class="chip warning">More functions pending</span>
      </div>
      <div class="admin-action-grid premium">
        ${AdminAction("Invite user", "Send a secure invite and choose initial role.", "invite-user")}
        ${AdminAction("Change role", "Move a user between admin, athlete, and viewer.", "change-user-role")}
        ${AdminAction("Grant permission", "Allow specific actions without changing role.", "update-user-permissions")}
        ${AdminAction("Assign athlete", "Connect a user to Mohammad or future athlete profiles.", "assign-athlete")}
        ${AdminAction("Deactivate", "Disable access without deleting historical data.", "deactivate-user")}
        ${AdminAction("Audit logs", "Review sensitive admin activity.", "audit_logs.view")}
      </div>
      <div class="admin-note">Add User is live above through the create-user Edge Function. These remaining controls stay locked until their own Edge Functions are deployed.</div>
    </div>
    <div class="admin-section section-gap">
      <div class="admin-section-head">
        <div>
          <div class="eyebrow">Roles</div>
          <div class="card-title">Default Authority Levels</div>
        </div>
      </div>
      <div class="role-stack">
        ${Object.entries(ROLE_DEFINITIONS).map(([key, description]) => `<div class="role-row"><span>${roleLabel(key)}</span><strong>${esc(description)}</strong></div>`).join("")}
      </div>
    </div>
    <div class="admin-section section-gap">
      <div class="admin-section-head">
        <div>
          <div class="eyebrow">Permissions Table</div>
          <div class="card-title">Granular Controls</div>
        </div>
      </div>
      ${Object.entries(PERMISSIONS).map(([category, keys]) => `<details class="permission-group"><summary>${esc(category.replaceAll("_", " "))}<span>${keys.length}</span></summary><div class="permission-chip-grid">${keys.map((key) => `<span class="chip">${esc(key)}</span>`).join("")}</div></details>`).join("")}
    </div>
    <div class="admin-section section-gap">
      <div class="admin-section-head">
        <div>
          <div class="eyebrow">Activation Checklist</div>
          <div class="card-title">Production Unlock</div>
        </div>
      </div>
      ${AdminChecklist("Supabase migrations applied", true)}
      ${AdminChecklist("Public signup disabled", true)}
      ${AdminChecklist("Owner role assigned", role === ROLES.OWNER)}
      ${AdminChecklist("Create user Edge Function deployed", true)}
      ${AdminChecklist("Player plan manager enabled", true)}
    </div>
  </section>`;
}
function AdminKpi(label, value, note) {
  return `<div class="admin-kpi"><span>${label}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`;
}
function AdminPlayerCommandCenter() {
  const athlete = selectedAdminAthlete();
  const user = selectedAdminUser();
  const summary = summarizeAthleteSnapshot(state.adminPlayerSnapshot || null);
  const canShow = state.adminAthletes.length > 0;
  return `<div class="admin-section section-gap player-command-center">
    <div class="admin-section-head">
      <div>
        <div class="eyebrow">Player Command Center</div>
        <div class="card-title">Activity + Personal Plan</div>
      </div>
      <button class="mini-btn" data-action="admin-refresh-directory">Refresh</button>
    </div>
    ${state.adminLoadStatus ? `<div class="admin-note">${esc(state.adminLoadStatus)}</div>` : `<div class="admin-note">Load the secure player directory to review each athlete and manage a separate plan.</div>`}
    ${canShow ? `<div class="player-directory section-gap">
      ${state.adminAthletes.map((item) => {
        const itemAssignment = item.users?.find((entry) => entry.relationship_type === "self") || item.users?.[0];
        const itemUser = itemAssignment?.user;
        return `<button class="player-directory-card ${item.id === athlete?.id ? "active" : ""}" data-admin-athlete="${item.id}">
          ${Avatar(itemUser || { display_name: item.display_name }, "profile-avatar player-list-avatar")}
          <span><strong>${esc(item.display_name)}</strong><small>${esc(itemUser?.email || "Athlete profile")}</small></span>
          <em>${esc(roleLabel(itemUser?.role || ROLES.ATHLETE))}</em>
        </button>`;
      }).join("")}
    </div>
    <div class="player-profile-card">
      ${Avatar(user || { display_name: athlete?.display_name }, "profile-avatar player-detail-avatar")}
      <div class="player-profile-copy">
        <div class="eyebrow">Selected Athlete</div>
        <strong>${esc(athlete?.display_name || "No athlete selected")}</strong>
        <div class="day-meta">${user ? `${esc(user.email)} · ${roleLabel(user.role)}` : "No assigned user visible"}</div>
      </div>
      <span class="chip ${athlete?.id === currentAthleteId() ? "success" : ""}">${athlete?.id === currentAthleteId() ? "You" : "Player"}</span>
    </div>
    ${AdminPlayerActivity(summary)}
    ${AdminPlayerPlanEditor()}` : `<div class="empty card section-gap">No player profiles loaded yet. Create a user with “New athlete profile” or refresh the directory.</div>`}
  </div>`;
}
function AdminPlayerActivity(summary) {
  const last = summary.lastWorkout;
  return `<div class="admin-kpi-grid section-gap">
    ${AdminKpi("Week Workouts", `${summary.workoutsThisWeek}/7`, "Completed this week")}
    ${AdminKpi("Total Volume", kg(summary.totalVolume), "All completed sessions")}
    ${AdminKpi("Nutrition", `${summary.nutritionThisWeek}/7`, "Adherent days")}
    ${AdminKpi("Padel", `${summary.padelThisWeek}`, "Sessions this week")}
    <div class="admin-wide-card">
      <div class="eyebrow">Last Workout</div>
      <strong>${last ? esc(last.workoutName || last.category || "Workout") : "No workout yet"}</strong>
      <span>${last ? `${esc(last.date)} · ${Number(last.completedSets || 0)} sets · ${kg(Number(last.totalVolume || 0))}` : "When the player finishes a workout, it appears here."}</span>
    </div>
    <div class="admin-wide-card">
      <div class="eyebrow">Latest Daily Log</div>
      <strong>${summary.latestDaily ? esc(summary.latestDaily.date) : "No daily log yet"}</strong>
      <span>${summary.latestDaily ? `Weight ${summary.latestDaily.bodyWeight || "—"} · Sleep ${summary.latestDaily.sleepScore || "—"}/5 · Energy ${summary.latestDaily.energyScore || "—"}/5` : "Daily readiness, body metrics, and notes appear here."}</span>
    </div>
  </div>`;
}
function AdminPlayerPlanEditor() {
  const plan = planForAdminEditor();
  const dayIdx = Math.min(Number(state.adminPlanDay || 0), Math.max(0, (plan?.days?.length || 1) - 1));
  const day = plan?.days?.[dayIdx];
  if (!plan || !day) return `<div class="empty card section-gap">No plan found for this player yet.</div>`;
  return `<div class="admin-plan-editor section-gap">
    <div class="admin-section-head">
      <div>
        <div class="eyebrow">Player Plan</div>
        <div class="card-title">${esc(plan.title || "MM Fitness Plan")}</div>
      </div>
      <button class="btn btn-primary" style="min-height:38px;padding:0 14px" data-action="admin-save-player-plan">Save Plan</button>
    </div>
    <div class="admin-note">${esc(state.adminPlanStatus || "Changes here apply only to the selected player profile.")}</div>
    <div class="admin-day-strip">
      ${plan.days.map((item, i) => `<button class="${i === dayIdx ? "active" : ""}" data-admin-plan-day="${i}"><span>${esc(item.day.slice(0, 3))}</span><strong>${i + 1}</strong></button>`).join("")}
    </div>
    ${AdminPlanDayEditor(day, dayIdx)}
  </div>`;
}
function AdminPlanDayEditor(day, dayIdx) {
  return `<div class="form-card admin-plan-day">
    <div class="grid-2">
      ${AdminPlanField("Workout Name", dayIdx, "workoutName", workoutName(day))}
      ${AdminPlanField("Category", dayIdx, "category", day.category || "")}
      ${AdminPlanField("Duration", dayIdx, "duration", day.duration || 0, "number")}
      ${AdminPlanField("Calories", dayIdx, "calories", day.calories || 0, "number")}
    </div>
    <div class="field"><label>Session Goal</label><textarea data-admin-plan-field="${dayIdx}" data-field="goal">${esc(day.goal || "")}</textarea></div>
    <div class="field"><label>Nutrition Day Type</label>
      <div class="segmented">${["HIGH","MED","LOW"].map((type) => `<button class="${day.nutritionType === type ? "active" : ""}" data-admin-nutrition="${dayIdx}" data-type="${type}">${type}</button>`).join("")}</div>
    </div>
    <div class="field"><label>Padel Schedule</label>
      <div class="segmented"><button class="${day.hasPadel ? "active" : ""}" data-admin-padel="${dayIdx}" data-value="true">On</button><button class="${!day.hasPadel ? "active" : ""}" data-admin-padel="${dayIdx}" data-value="false">Off</button><button data-action="admin-add-exercise">Add Exercise</button></div>
    </div>
    ${day.hasPadel ? `<div class="grid-2">${AdminPlanField("Padel Time", dayIdx, "padelTime", day.padelTime || "")}${AdminPlanField("Padel Duration", dayIdx, "padelDuration", day.padelDuration || 90, "number")}</div>` : ""}
    <div class="panel-list section-gap">
      ${(day.exercises || []).map((ex, i) => AdminExerciseEditor(ex, i, dayIdx)).join("") || `<div class="empty card">No exercises yet.</div>`}
    </div>
    <button class="btn btn-secondary section-gap" style="width:100%" data-action="admin-add-exercise">Add Exercise</button>
  </div>`;
}
function AdminPlanField(label, dayIdx, field, value, type = "text") {
  return `<div class="field"><label>${label}</label><input class="input" data-admin-plan-field="${dayIdx}" data-field="${field}" type="${type}" value="${esc(value)}" /></div>`;
}
function AdminExerciseEditor(ex, i, dayIdx) {
  return `<article class="exercise-card edit-exercise admin-exercise-card">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
      <div class="day-title">${i + 1}. ${esc(ex.name || "Exercise")}</div>
      <div style="display:flex;gap:6px">
        <button class="mini-btn" data-admin-move-ex="${i}" data-dir="-1">↑</button>
        <button class="mini-btn" data-admin-move-ex="${i}" data-dir="1">↓</button>
        <button class="mini-btn danger" data-admin-remove-ex="${i}">Remove</button>
      </div>
    </div>
    <div class="field"><label>Name</label><input class="input" data-admin-edit-ex="${i}" data-field="name" value="${esc(ex.name || "")}" /></div>
    <div class="edit-grid">
      <div class="field"><label>Sets</label><input class="input" type="number" data-admin-edit-ex="${i}" data-field="sets" value="${esc(ex.sets || 0)}" /></div>
      <div class="field"><label>Reps</label><input class="input" data-admin-edit-ex="${i}" data-field="reps" value="${esc(ex.reps || "")}" /></div>
      <div class="field"><label>Weight Target</label><input class="input" data-admin-edit-ex="${i}" data-field="weightTarget" value="${esc(ex.weightTarget || "")}" /></div>
      <div class="field"><label>Rest</label><input class="input" type="number" data-admin-edit-ex="${i}" data-field="rest" value="${esc(ex.rest || 0)}" /></div>
    </div>
    <div class="field"><label>Intensity</label><input class="input" data-admin-edit-ex="${i}" data-field="intensity" value="${esc(ex.intensity || "")}" /></div>
    <div class="field"><label>Notes</label><textarea data-admin-edit-ex="${i}" data-field="notes">${esc(ex.notes || "")}</textarea></div>
  </article>`;
}
function AdminCreateUserForm() {
  return `<div class="admin-section section-gap admin-create-user">
    <div class="admin-section-head">
      <div>
        <div class="eyebrow">Create Access</div>
        <div class="card-title">Add User</div>
      </div>
      <span class="chip success">Live</span>
    </div>
    <div class="admin-form-grid">
      <div class="field">
        <label>User Email</label>
        <input class="input" data-admin-create="email" type="email" placeholder="athlete@example.com" />
      </div>
      <div class="field">
        <label>Temporary Password</label>
        <input class="input" data-admin-create="password" type="password" placeholder="Set temporary password" />
      </div>
      <div class="field">
        <label>Role</label>
        <select class="input" data-admin-create="role">
          ${[ROLES.ATHLETE, ROLES.VIEWER, ROLES.ADMIN, ROLES.OWNER].map((item) => `<option value="${item}">${roleLabel(item)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Athlete Access</label>
        <select class="input" data-admin-create="athlete">
          <option value="new">New athlete profile</option>
          <option value="current">Mohammad / current profile</option>
          <option value="">No athlete yet</option>
        </select>
      </div>
    </div>
    <button class="btn btn-primary" style="width:100%" data-action="admin-create-user">Create User</button>
    ${state.adminCreateStatus ? `<div class="admin-note">${esc(state.adminCreateStatus)}</div>` : `<div class="admin-note">Password creation runs through the create-user Edge Function. The service role key stays in Supabase Secrets and never appears in this app.</div>`}
  </div>`;
}
function AdminAction(title, description, functionName) {
  return `<button class="admin-action-card" disabled>
    <strong>${esc(title)}</strong>
    <span>${esc(description)}</span>
    <em>${esc(functionName)}</em>
  </button>`;
}
function AdminChecklist(label, done) {
  return `<div class="admin-check ${done ? "done" : ""}"><span>${done ? "✓" : "•"}</span><strong>${esc(label)}</strong></div>`;
}
function BottomNav() {
  const items = [["home","Home","home"],["plan","Plan","plan"],["logs","Logs","logs"],["nutrition","Nutrition","nutrition"],["progress","Progress","progress"]];
  if (state.auth.loading || !state.auth.user) return "";
  if (state.screen === "active" || state.screen === "admin") return "";
  return `<nav class="bottom-nav" aria-label="Primary navigation">${items.map(([id, label, ico]) => {
    const active = state.screen === id;
    const mark = id === "home" ? brandGlyph(active ? "nav-signature active" : "nav-signature") : icon(ico);
    return `<button class="nav-btn ${active ? "active" : ""}" data-nav="${id}" aria-current="${active ? "page" : "false"}">${mark}<span>${label}</span></button>`;
  }).join("")}</nav>`;
}
function Modal() {
  if (!state.modal) return "";
  const m = state.modal;
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="modal">
      <div class="card-title">${m.title}</div>
      ${m.bodyHtml || `<p class="day-meta" style="margin:8px 0 0">${m.body}</p>`}
      <div class="modal-actions">
        <button class="btn btn-secondary" data-modal="${m.cancelAction}">${m.cancelLabel}</button>
        <button class="btn ${m.danger ? "btn-danger" : "btn-primary"}" data-modal="${m.confirmAction}">${m.confirmLabel}</button>
      </div>
    </div>
  </div>`;
}
function openActivityModal(date = todayStr(), preferredType = "padel") {
  const planned = state.plan.days.find((day) => day.day === dayName(date));
  const defaultTime = preferredType === "padel" && planned?.hasPadel ? planned.padelTime || "" : "";
  const defaultDuration = preferredType === "padel" && planned?.hasPadel ? planned.padelDuration || 90 : preferredType === "swimming" ? 30 : 60;
  state.modal = {
    title: "Add activity",
    bodyHtml: `<div class="activity-modal-form">
      <div class="field"><label>Date</label><input class="input" type="date" data-activity-field="date" value="${esc(date)}" /></div>
      <div class="field"><label>Activity</label><select class="input" data-activity-field="type"><option value="padel" ${preferredType === "padel" ? "selected" : ""}>Padel</option><option value="swimming" ${preferredType === "swimming" ? "selected" : ""}>Swimming</option></select></div>
      <div class="grid-2">
        <div class="field"><label>Time</label><input class="input" type="time" data-activity-field="time" value="${toTimeInput(defaultTime)}" /></div>
        <div class="field"><label>Duration (min)</label><input class="input" type="number" min="1" step="5" data-activity-field="duration" value="${defaultDuration}" /></div>
      </div>
      <div class="field"><label>Intensity</label><select class="input" data-activity-field="intensity"><option value="easy">Easy</option><option value="moderate" selected>Moderate</option><option value="hard">Hard</option></select></div>
      <div class="field"><label>Notes</label><textarea data-activity-field="notes" placeholder="Optional session notes"></textarea></div>
    </div>`,
    cancelLabel: "Cancel",
    confirmLabel: "Save Activity",
    cancelAction: "close",
    confirmAction: "save-activity"
  };
  render();
}
function toTimeInput(value = "") {
  const match = String(value).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return /^\d{2}:\d{2}$/.test(value) ? value : "";
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}
function confirmCancel() {
  state.modal = {
    title: "Cancel workout?",
    body: "Are you sure you want to cancel this workout? This will discard the current workout session.",
    cancelLabel: "Keep Workout",
    confirmLabel: "Cancel Workout",
    cancelAction: "close",
    confirmAction: "confirm-cancel",
    danger: true
  };
  render();
}
function confirmFinish() {
  state.modal = {
    title: "Finish workout?",
    body: "Finish workout and save session?",
    cancelLabel: "Continue Workout",
    confirmLabel: "Finish and Save",
    cancelAction: "close",
    confirmAction: "confirm-finish"
  };
  render();
}
function bind() {
  document.querySelectorAll("[data-nav]").forEach((el) => el.addEventListener("click", () => setScreen(el.dataset.nav)));
  document.querySelectorAll("[data-day]").forEach((el) => el.addEventListener("click", () => { state.selectedDay = Number(el.dataset.day); state.screen = "plan"; render(); }));
  document.querySelectorAll("[data-quick]").forEach((el) => el.addEventListener("click", () => {
    if (el.dataset.quick === "activity") openActivityModal(todayStr(), todayPlan().hasPadel ? "padel" : "swimming");
    else if (el.dataset.quick === "padel") togglePadel();
    else setScreen(el.dataset.quick);
  }));
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => handleAction(el.dataset.action)));
  document.querySelectorAll("[data-strength-period]").forEach((el) => el.addEventListener("click", () => {
    state.strengthPeriod = el.dataset.strengthPeriod;
    write("mm-strength-period", state.strengthPeriod);
    render();
  }));
  document.querySelectorAll("[data-history-date]").forEach((el) => el.addEventListener("click", () => {
    state.historySelectedDate = el.dataset.historyDate;
    render();
  }));
  document.querySelectorAll("[data-remove-activity]").forEach((el) => el.addEventListener("click", () => {
    state.activityLogs = removeActivity(state.activityLogs, el.dataset.activityDate, el.dataset.removeActivity);
    saveAll();
    toast("Activity removed");
    render();
  }));
  document.querySelectorAll("[data-import-backup]").forEach((el) => el.addEventListener("change", async () => {
    const file = el.files?.[0];
    if (!file) return;
    try {
      await importLocalBackupFile(file);
      location.reload();
    } catch (error) {
      state.auth.error = error.message || "Import failed";
      render();
    }
  }));
  document.querySelectorAll("[data-log]").forEach((el) => el.addEventListener("input", () => {
    const today = todayStr();
    const val = el.type === "number" ? (el.value === "" ? null : Number(el.value)) : el.value;
    state.logs[today] = { ...(state.logs[today] || {}), [el.dataset.log]: val };
    saveAll();
  }));
  document.querySelectorAll("[data-score]").forEach((el) => el.addEventListener("click", () => {
    const today = todayStr();
    state.logs[today] = { ...(state.logs[today] || {}), [el.dataset.score]: Number(el.dataset.value) };
    saveAll(); render();
  }));
  document.querySelectorAll("[data-adherence]").forEach((el) => el.addEventListener("click", () => {
    const today = todayStr();
    if (el.dataset.adherence === "nutrition") state.nutritionLogs[today] = { ...(state.nutritionLogs[today] || {}), adhered: el.dataset.value };
    else state.logs[today] = { ...(state.logs[today] || {}), [el.dataset.adherence]: el.dataset.value };
    saveAll(); render();
  }));
  document.querySelectorAll("[data-nutrition]").forEach((el) => el.addEventListener("input", () => {
    const today = todayStr();
    const val = el.type === "number" ? (el.value === "" ? null : Number(el.value)) : el.value;
    state.nutritionLogs[today] = { ...(state.nutritionLogs[today] || {}), [el.dataset.nutrition]: val };
    saveAll();
  }));
  document.querySelectorAll("[data-set]").forEach((el) => el.addEventListener("input", () => {
    const key = el.dataset.set;
    const [exerciseIndex, setIndex] = key.split("-").map(Number);
    state.activeCursor = { exerciseIndex, setIndex };
    state.activeWorkout.sets[key] = { ...(state.activeWorkout.sets[key] || {}), [el.dataset.field]: el.value };
    saveAll();
  }));
  document.querySelectorAll("[data-set-done]").forEach((el) => el.addEventListener("click", () => {
    const key = el.dataset.setDone;
    const [exerciseIndex, setIndex] = key.split("-").map(Number);
    state.activeCursor = { exerciseIndex, setIndex };
    const prev = state.activeWorkout.sets[key] || {};
    state.activeWorkout.sets[key] = { ...prev, done: !prev.done };
    saveAll(); render();
  }));
  document.querySelectorAll("[data-theme-set]").forEach((el) => el.addEventListener("click", () => {
    state.theme = el.dataset.themeSet;
    write("mm-theme", state.theme);
    render();
  }));
  document.querySelectorAll("[data-edit-day]").forEach((el) => el.addEventListener("input", () => {
    const idx = Number(el.dataset.editDay);
    const field = el.dataset.field;
    state.plan.days[idx][field] = el.type === "number" ? Number(el.value || 0) : el.value;
    saveAll();
  }));
  document.querySelectorAll("[data-edit-ex]").forEach((el) => el.addEventListener("input", () => {
    const idx = state.selectedDay ?? todayPlan().dayIndex;
    const exIdx = Number(el.dataset.editEx);
    const field = el.dataset.field;
    state.plan.days[idx].exercises[exIdx][field] = el.type === "number" ? Number(el.value || 0) : el.value;
    saveAll();
  }));
  document.querySelectorAll("[data-edit-nutrition]").forEach((el) => el.addEventListener("click", () => {
    const idx = Number(el.dataset.editNutrition);
    const type = el.dataset.type;
    const presets = { HIGH: { calories: 2200, carbs: 200, fats: 71 }, MED: { calories: 2050, carbs: 150, fats: 77 }, LOW: { calories: 1850, carbs: 80, fats: 86 } };
    state.plan.days[idx] = { ...state.plan.days[idx], nutritionType: type, protein: 190, ...presets[type] };
    saveAll();
    render();
  }));
  document.querySelectorAll("[data-edit-padel]").forEach((el) => el.addEventListener("click", () => {
    const idx = Number(el.dataset.editPadel);
    state.plan.days[idx].hasPadel = el.dataset.value === "true";
    if (state.plan.days[idx].hasPadel) {
      state.plan.days[idx].padelTime ||= "6:00 PM";
      state.plan.days[idx].padelDuration ||= 90;
    }
    saveAll();
    render();
  }));
  document.querySelectorAll("[data-remove-ex]").forEach((el) => el.addEventListener("click", () => {
    const idx = state.selectedDay ?? todayPlan().dayIndex;
    state.plan.days[idx].exercises.splice(Number(el.dataset.removeEx), 1);
    saveAll();
    render();
  }));
  document.querySelectorAll("[data-move-ex]").forEach((el) => el.addEventListener("click", () => {
    const idx = state.selectedDay ?? todayPlan().dayIndex;
    const from = Number(el.dataset.moveEx);
    const to = from + Number(el.dataset.dir);
    const list = state.plan.days[idx].exercises;
    if (to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    saveAll();
    render();
  }));
  document.querySelectorAll("[data-admin-athlete-select]").forEach((el) => el.addEventListener("change", async () => {
    try {
      await loadAdminPlayer(el.value);
    } catch (error) {
      state.adminPlanStatus = error.message || "Could not load selected player.";
      render();
    }
  }));
  document.querySelectorAll("[data-admin-athlete]").forEach((el) => el.addEventListener("click", async () => {
    try {
      await loadAdminPlayer(el.dataset.adminAthlete);
    } catch (error) {
      state.adminPlanStatus = error.message || "Could not load selected player.";
      render();
    }
  }));
  document.querySelectorAll("[data-profile-avatar]").forEach((el) => el.addEventListener("change", async () => {
    const file = el.files?.[0];
    if (!file) return;
    state.profileStatus = "Uploading profile picture...";
    render();
    try {
      const uploaded = await uploadOwnAvatar(currentUserId(), file, state.auth.profile?.avatar_path || "");
      state.auth.profile = { ...state.auth.profile, avatar_path: uploaded.path, avatar_url: uploaded.url };
      state.profileStatus = "Profile picture updated.";
    } catch (error) {
      state.profileStatus = error.message || "Could not upload profile picture.";
    }
    render();
  }));
  document.querySelectorAll("[data-admin-plan-day]").forEach((el) => el.addEventListener("click", () => {
    state.adminPlanDay = Number(el.dataset.adminPlanDay);
    render();
  }));
  document.querySelectorAll("[data-admin-plan-field]").forEach((el) => el.addEventListener("input", () => {
    const plan = planForAdminEditor();
    const idx = Number(el.dataset.adminPlanField);
    const field = el.dataset.field;
    plan.days[idx][field] = el.type === "number" ? Number(el.value || 0) : el.value;
    state.adminPlanDraft = plan;
  }));
  document.querySelectorAll("[data-admin-edit-ex]").forEach((el) => el.addEventListener("input", () => {
    const plan = planForAdminEditor();
    const idx = Number(state.adminPlanDay || 0);
    const exIdx = Number(el.dataset.adminEditEx);
    const field = el.dataset.field;
    plan.days[idx].exercises[exIdx][field] = el.type === "number" ? Number(el.value || 0) : el.value;
    state.adminPlanDraft = plan;
  }));
  document.querySelectorAll("[data-admin-nutrition]").forEach((el) => el.addEventListener("click", () => {
    const plan = planForAdminEditor();
    const idx = Number(el.dataset.adminNutrition);
    const type = el.dataset.type;
    const presets = { HIGH: { calories: 2200, carbs: 200, fats: 71 }, MED: { calories: 2050, carbs: 150, fats: 77 }, LOW: { calories: 1850, carbs: 80, fats: 86 } };
    plan.days[idx] = { ...plan.days[idx], nutritionType: type, protein: 190, ...presets[type] };
    state.adminPlanDraft = plan;
    render();
  }));
  document.querySelectorAll("[data-admin-padel]").forEach((el) => el.addEventListener("click", () => {
    const plan = planForAdminEditor();
    const idx = Number(el.dataset.adminPadel);
    plan.days[idx].hasPadel = el.dataset.value === "true";
    if (plan.days[idx].hasPadel) {
      plan.days[idx].padelTime ||= "6:00 PM";
      plan.days[idx].padelDuration ||= 90;
    }
    state.adminPlanDraft = plan;
    render();
  }));
  document.querySelectorAll("[data-admin-remove-ex]").forEach((el) => el.addEventListener("click", () => {
    const plan = planForAdminEditor();
    const idx = Number(state.adminPlanDay || 0);
    plan.days[idx].exercises.splice(Number(el.dataset.adminRemoveEx), 1);
    state.adminPlanDraft = plan;
    render();
  }));
  document.querySelectorAll("[data-admin-move-ex]").forEach((el) => el.addEventListener("click", () => {
    const plan = planForAdminEditor();
    const idx = Number(state.adminPlanDay || 0);
    const from = Number(el.dataset.adminMoveEx);
    const to = from + Number(el.dataset.dir);
    const list = plan.days[idx].exercises;
    if (to < 0 || to >= list.length) return;
    [list[from], list[to]] = [list[to], list[from]];
    state.adminPlanDraft = plan;
    render();
  }));
  document.querySelectorAll("[data-modal]").forEach((el) => el.addEventListener("click", () => handleModal(el.dataset.modal)));
  manageTimer();
}
async function handleAction(action) {
  if (action === "theme") {
    state.theme = state.theme === "dark" ? "light" : "dark";
    write("mm-theme", state.theme);
    saveAll();
    render();
  }
  if (action === "auth-signin") {
    const email = document.querySelector("[data-auth='email']")?.value?.trim();
    const password = document.querySelector("[data-auth='password']")?.value || "";
    try {
      state.auth.error = "";
      await signIn(email, password);
    } catch (error) {
      state.auth.error = error.message || "Authentication failed";
      render();
    }
  }
  if (action === "toggle-admin-panel") {
    if (!canOpenAdminPanel(state.auth.profile)) return toast("Admin access required");
    state.adminPanelOpen = !state.adminPanelOpen;
    if (state.adminPanelOpen && !state.adminAthletes.length) {
      await loadAdminCommandCenter();
      return;
    }
    render();
  }
  if (action === "open-admin-workspace") {
    if (!canOpenAdminPanel(state.auth.profile)) return toast("Admin access required");
    state.screen = "admin";
    if (!state.adminAthletes.length) {
      await loadAdminCommandCenter();
      return;
    }
    render();
  }
  if (action === "profile-back") {
    setScreen("home");
  }
  if (action === "save-profile") {
    const displayName = document.querySelector("[data-profile-field='display_name']")?.value || "";
    const bio = document.querySelector("[data-profile-field='bio']")?.value || "";
    state.profileStatus = "Saving profile...";
    render();
    try {
      const profile = await updateOwnProfile(currentUserId(), { display_name: displayName, bio });
      state.auth.profile = {
        ...state.auth.profile,
        ...profile,
        role: profile.roles?.name || state.auth.profile?.role,
        avatar_url: await signedAvatarUrl(profile.avatar_path)
      };
      state.profileStatus = "Profile saved.";
    } catch (error) {
      state.profileStatus = error.message || "Could not save profile.";
    }
    render();
  }
  if (action === "admin-refresh-directory") {
    await loadAdminCommandCenter();
  }
  if (action === "admin-create-user") {
    await createAdminUser();
  }
  if (action === "admin-add-exercise") {
    const plan = planForAdminEditor();
    const idx = Number(state.adminPlanDay || 0);
    plan.days[idx].exercises.push({ name: "New Exercise", sets: 3, reps: "8-12", weightTarget: "", intensity: "Moderate", rest: 60, notes: "" });
    state.adminPlanDraft = plan;
    render();
  }
  if (action === "admin-save-player-plan") {
    await saveAdminPlayerPlan();
  }
  if (action === "logout") {
    await signOut();
  }
  if (action === "export-backup") {
    const backup = downloadLocalBackup();
    recordBackupExport({ keyCount: backup.keys.length, source: "manual_export" }).catch(() => {});
    toast("Backup exported");
  }
  if (action === "cloud-backup-now") {
    try {
      await saveCloudSnapshot(appSnapshot());
      state.syncStatus = getSyncStatus();
      toast("Cloud backup saved");
      render();
    } catch (error) {
      state.syncStatus = getSyncStatus();
      state.auth.error = error.message || "Cloud backup failed";
      render();
    }
  }
  if (action === "start-today") startWorkout(todayPlan().dayIndex);
  if (action === "view-plan-today") { state.selectedDay = todayPlan().dayIndex; state.screen = "plan"; render(); }
  if (action === "start-selected") startWorkout(state.selectedDay ?? todayPlan().dayIndex);
  if (action === "back-plan") { state.selectedDay = null; state.screen = "plan"; render(); }
  if (action === "edit-workout") { state.editingPlan = true; render(); }
  if (action === "done-edit") { state.editingPlan = false; saveAll(); toast("Workout updated"); render(); }
  if (action === "add-exercise") {
    const idx = state.selectedDay ?? todayPlan().dayIndex;
    state.plan.days[idx].exercises.push({ name: "New Exercise", sets: 3, reps: "8-12", weightTarget: "", intensity: "Moderate", rest: 60, notes: "" });
    saveAll();
    render();
  }
  if (action === "go-nutrition") setScreen("nutrition");
  if (action === "go-logs") setScreen("logs");
  if (action === "go-progress") setScreen("progress");
  if (action === "history-today") { state.historySelectedDate = todayStr(); render(); }
  if (action === "add-activity") openActivityModal(state.historySelectedDate || todayStr(), "padel");
  if (action === "toggle-padel") togglePadel();
  if (action === "pause-workout") pauseWorkout();
  if (action === "resume-workout") resumeWorkout();
  if (action === "cancel-workout") confirmCancel();
  if (action === "finish-workout") confirmFinish();
  if (action === "reset-demo") {
    localRemove("mm-daily-logs");
    localRemove("mm-workout-logs");
    localRemove("mm-nutrition-logs");
    localRemove("mm-padel-logs");
    localRemove("mm-activity-logs");
    location.reload();
  }
}
async function createAdminUser() {
  const email = document.querySelector("[data-admin-create='email']")?.value?.trim();
  const password = document.querySelector("[data-admin-create='password']")?.value || "";
  const role = document.querySelector("[data-admin-create='role']")?.value || ROLES.ATHLETE;
  const athleteChoice = document.querySelector("[data-admin-create='athlete']")?.value || "";
  const athleteMode = athleteChoice === "new" ? "new" : athleteChoice === "current" ? "current" : "none";
  if (!email || !email.includes("@")) {
    state.adminCreateStatus = "Enter a valid user email.";
    render();
    return;
  }
  if (password.length < 8) {
    state.adminCreateStatus = "Temporary password must be at least 8 characters.";
    render();
    return;
  }
  state.adminCreateStatus = "Creating user securely...";
  render();
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: {
      email,
      password,
      role,
      athleteMode,
      athleteDisplayName: email.split("@")[0],
      athleteId: athleteChoice === "current" ? state.auth.athlete?.id : null
    }
  });
  if (error || data?.error) {
    state.adminCreateStatus = data?.error || error?.message || "Could not create user.";
    render();
    return;
  }
  state.adminCreateStatus = `Created ${data.user.email} as ${roleLabel(data.user.role)}.`;
  await loadAdminCommandCenter(data.user.athleteId || state.adminSelectedAthleteId || currentAthleteId());
  toast("User created");
  render();
}
function togglePadel() {
  const today = todayStr();
  const d = todayPlan();
  openActivityModal(today, "padel");
}
function handleModal(action) {
  if (action === "close") {
    state.modal = null;
    state.lastWorkoutSummary = null;
    render();
  }
  if (action === "confirm-cancel") {
    state.activeWorkout = null;
    state.activeCursor = null;
    state.modal = null;
    saveAll();
    clearSessionUi();
    state.screen = "home";
    toast("Workout canceled");
    render();
  }
  if (action === "confirm-finish") {
    const today = todayStr();
    const aw = state.activeWorkout;
    const savedSession = {
      ...createWorkoutSessionSnapshot(aw, state.plan, elapsed(aw)),
      date: today,
    };
    const summary = summarizeWorkoutSession(savedSession, state.plan);
    const prs = [];
    for (const exercise of summary.exercises) {
      const performance = summarizeCurrentExercise(exercise.exerciseName, exercise.exerciseIndex, aw, state.workoutLogs, state.plan);
      prs.push(...performance.prs.filter((pr) => pr.type !== "first_record").map((pr) => ({ ...pr, exerciseName: exercise.exerciseName })));
    }
    state.workoutLogs[today] = {
      ...savedSession,
      totalVolume: summary.totalVolume,
      completedSets: summary.completedSets
    };
    state.activeWorkout = null;
    state.activeCursor = null;
    state.lastWorkoutSummary = summary;
    state.modal = {
      title: "Workout saved",
      bodyHtml: WorkoutSummaryHtml(summary, prs),
      cancelLabel: "Close",
      confirmLabel: "View Progress",
      cancelAction: "close",
      confirmAction: "summary-progress"
    };
    saveAll();
    clearSessionUi();
    state.screen = "home";
    render();
  }
  if (action === "summary-progress") {
    state.modal = null;
    state.lastWorkoutSummary = null;
    state.screen = "progress";
    render();
  }
  if (action === "save-activity") {
    const date = document.querySelector("[data-activity-field='date']")?.value || todayStr();
    const type = document.querySelector("[data-activity-field='type']")?.value || "padel";
    const time = document.querySelector("[data-activity-field='time']")?.value || "";
    const duration = Number(document.querySelector("[data-activity-field='duration']")?.value || 0);
    const intensity = document.querySelector("[data-activity-field='intensity']")?.value || "moderate";
    const notes = document.querySelector("[data-activity-field='notes']")?.value || "";
    if (!date || duration <= 0) return toast("Add a date and duration");
    state.activityLogs = addActivity(state.activityLogs, { date, type, time, duration, intensity, notes, completed: true });
    state.historySelectedDate = date;
    state.modal = null;
    saveAll();
    toast(`${activityLabel(type)} saved`);
    render();
  }
}
function WorkoutSummaryHtml(summary, prs = []) {
  return `<div class="summary-box">
    <div class="summary-line"><span>Total Volume</span><strong>${kg(summary.totalVolume)}</strong></div>
    <div class="summary-line"><span>Completed Sets</span><strong>${summary.completedSets}</strong></div>
    <div class="summary-line"><span>Duration</span><strong>${summary.duration} min</strong></div>
    <div class="summary-divider"></div>
    <div class="perf-label">Best estimated 1RM</div>
    ${summary.bestOneRepMaxHighlights.length ? summary.bestOneRepMaxHighlights.map((item) => `<div class="summary-line"><span>${esc(item.exerciseName)}</span><strong>${kg(item.bestEstimatedOneRepMax)}</strong></div>`).join("") : `<div class="empty">No weighted completed sets.</div>`}
    <div class="summary-divider"></div>
    <div class="perf-label">PRs achieved</div>
    ${prs.length ? prs.slice(0, 5).map((pr) => `<span class="chip success">${esc(pr.exerciseName)} · ${esc(pr.label)}</span>`).join("") : `<div class="empty">No new PRs this session.</div>`}
  </div>`;
}
function manageTimer() {
  if (timerTick) clearInterval(timerTick);
  if (state.screen === "active" && state.activeWorkout && !state.activeWorkout.paused) {
    timerTick = setInterval(() => {
      const timer = $(".timer");
      if (timer && state.activeWorkout) timer.textContent = formatElapsed(elapsed(state.activeWorkout));
    }, 1000);
  }
}

function restoreScrollAfterRender() {
  if (pendingScrollY === null || state.screen !== "active" || !state.activeWorkout) return;
  const y = pendingScrollY;
  pendingScrollY = null;
  requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
}

function persistActiveWorkoutNow() {
  if (!state.activeWorkout) return;
  write("mm-active-workout", state.activeWorkout);
  persistWorkoutUiState(state);
}

function installResumeGuards() {
  const persist = () => persistActiveWorkoutNow();
  window.addEventListener("pagehide", persist, { capture: true });
  window.addEventListener("beforeunload", persist, { capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persist();
    if (document.visibilityState === "visible") {
      const ui = readSessionUi({});
      if (shouldResumeActiveWorkout(ui, state.activeWorkout)) {
        state.screen = "active";
        state.selectedDay = Number.isInteger(ui.selectedDay) ? ui.selectedDay : state.selectedDay;
        state.activeCursor = ui.activeCursor || state.activeCursor;
        pendingScrollY = Number(ui.scrollY || window.scrollY || 0);
        render();
      }
    }
  });
  window.addEventListener("pageshow", (event) => {
    const ui = readSessionUi({});
    if (!shouldResumeActiveWorkout(ui, state.activeWorkout)) return;
    state.screen = "active";
    state.selectedDay = Number.isInteger(ui.selectedDay) ? ui.selectedDay : state.selectedDay;
    state.activeCursor = ui.activeCursor || state.activeCursor;
    pendingScrollY = Number(ui.scrollY || 0);
    if (event.persisted || state.auth.loading) render();
  });
  window.addEventListener("scroll", () => {
    if (state.screen === "active" && state.activeWorkout) persistWorkoutUiState(state);
  }, { passive: true });
}

async function boot() {
  installResumeGuards();
  window.addEventListener("mm-sync-status", (event) => {
    state.syncStatus = event.detail;
    const badges = document.querySelectorAll(".sync-badge");
    badges.forEach((badge) => {
      badge.className = `sync-badge ${event.detail.state || "local"}`;
      badge.textContent = event.detail.label;
    });
  });

  render();
  await initAuth(async (nextAuth) => {
    state.auth = nextAuth;
    if (nextAuth.user && nextAuth.athlete && !nextAuth.loading) {
      try {
        if (state.activeWorkout && state.screen === "active") {
          queueCloudSnapshot(appSnapshot);
        } else {
          const cloud = await loadCloudSnapshot();
          if (cloud?.data) hydrateFromSnapshot(cloud);
          else queueCloudSnapshot(appSnapshot);
        }
      } catch (error) {
        state.syncStatus = getSyncStatus();
        state.auth.error = error.message || "Could not load cloud data";
      }
    }
    state.syncStatus = getSyncStatus();
    render();
  });
}

boot();

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./sw.js", { scope: "/", updateViaCache: "none" }).then((registration) => {
    registration.update().catch(() => {});
    if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!sessionStorage.getItem("mm-sw-reloaded")) {
      sessionStorage.setItem("mm-sw-reloaded", "1");
      location.reload();
    }
  });
}
