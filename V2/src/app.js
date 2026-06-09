import { authState, initAuth, isAdmin, signIn, signOut, signUp } from "./auth.js";
import { downloadLocalBackup, getSyncStatus, importLocalBackupFile, loadCloudSnapshot, localRead, localRemove, localWrite, queueCloudSnapshot, recordBackupExport, saveCloudSnapshot } from "./storage.js";

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

const state = {
  screen: "home",
  selectedDay: null,
  theme: read("mm-theme", "dark"),
  logs: read("mm-daily-logs", {}),
  workoutLogs: read("mm-workout-logs", {}),
  nutritionLogs: read("mm-nutrition-logs", {}),
  padelLogs: read("mm-padel-logs", {}),
  plan: read("mm-plan", PLAN),
  activeWorkout: read("mm-active-workout", null),
  auth: { ...authState },
  syncStatus: getSyncStatus(),
  editingPlan: false,
  toast: "",
  modal: null,
  splashDone: !forceSplash && sessionStorage.getItem("mm-splash-done") === "1"
};

let timerTick = null;

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
      "mm-plan": state.plan,
      "mm-active-workout": state.activeWorkout
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
  state.plan = data["mm-plan"] || state.plan;
  state.activeWorkout = data["mm-active-workout"] || state.activeWorkout;
  write("mm-theme", state.theme);
  write("mm-daily-logs", state.logs);
  write("mm-workout-logs", state.workoutLogs);
  write("mm-nutrition-logs", state.nutritionLogs);
  write("mm-padel-logs", state.padelLogs);
  write("mm-plan", state.plan);
  if (state.activeWorkout) write("mm-active-workout", state.activeWorkout);
  else localRemove("mm-active-workout");
  return true;
}
function saveAll() {
  write("mm-theme", state.theme);
  write("mm-daily-logs", state.logs);
  write("mm-workout-logs", state.workoutLogs);
  write("mm-nutrition-logs", state.nutritionLogs);
  write("mm-padel-logs", state.padelLogs);
  write("mm-plan", state.plan);
  if (state.activeWorkout) write("mm-active-workout", state.activeWorkout);
  else localRemove("mm-active-workout");
  queueCloudSnapshot(appSnapshot);
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
    padel: dates.filter((d) => state.padelLogs[d]?.completed).length,
    nutrition: dates.filter((d) => state.nutritionLogs[d]?.adhered === "yes").length
  };
}
function setScreen(screen) {
  state.screen = screen;
  state.selectedDay = screen === "plan" ? null : state.selectedDay;
  state.editingPlan = false;
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
function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m]));
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
    settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M4 12h2m12 0h2M12 4v2m0 12v2m-5.6-2.4 1.4-1.4m8.4-8.4 1.4-1.4m0 11.2-1.4-1.4M7.8 7.8 6.4 6.4"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}

function render() {
  app.dataset.theme = state.theme;
  app.innerHTML = `${!state.splashDone ? Splash() : ""}<main class="app-main">${route()}</main>${BottomNav()}${Modal()}${state.toast ? `<div class="toast">${state.toast}</div>` : ""}`;
  bind();
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
  if (state.auth.loading) return BootScreen();
  if (!state.auth.user) return LoginScreen();
  if (state.screen === "active") return ActiveWorkout();
  if (state.screen === "plan") return state.selectedDay === null ? Plan() : WorkoutDetail();
  if (state.screen === "logs") return Logs();
  if (state.screen === "nutrition") return Nutrition();
  if (state.screen === "progress") return Progress();
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
  const mode = read("mm-auth-mode", "signin");
  return `<section class="auth-screen">
    ${brandGlyph("auth-signature")}
    <div class="eyebrow">Private athlete OS</div>
    <h1 class="h1">${mode === "signup" ? "Create Player Access" : "Sign In"}</h1>
    <p class="command-copy">${mode === "signup" ? "Create a player account. Admin role is never self-assigned." : "Use your MM Fitness App account to sync securely."}</p>
    ${state.auth.error ? `<div class="paused-banner" style="text-align:left">${esc(state.auth.error)}</div>` : ""}
    <section class="form-card section-gap">
      <div class="field"><label>Email</label><input class="input" type="email" autocomplete="email" data-auth="email" placeholder="name@example.com" /></div>
      <div class="field"><label>Password</label><input class="input" type="password" autocomplete="${mode === "signup" ? "new-password" : "current-password"}" data-auth="password" placeholder="Password" /></div>
      ${mode === "signup" ? `<div class="field"><label>Display Name</label><input class="input" data-auth="displayName" placeholder="Mohammad" /></div>` : ""}
      <button class="btn btn-primary section-gap" style="width:100%" data-action="${mode === "signup" ? "auth-signup" : "auth-signin"}">${mode === "signup" ? "Create Account" : "Sign In"}</button>
      <button class="btn btn-ghost section-gap" style="width:100%" data-action="toggle-auth-mode">${mode === "signup" ? "I already have an account" : "Create player account"}</button>
    </section>
    <section class="card metric-card section-gap">
      <div class="eyebrow">Security</div>
      <div class="metric-sub">Cloud data is protected by Supabase Auth and RLS. Local backup remains on this device until you export or migrate it.</div>
    </section>
  </section>`;
}
function Header(title, eyebrow, right = brandGlyph("screen-signature")) {
  return `<header class="screen-head"><div><div class="eyebrow">${eyebrow}</div><h1 class="h1">${title}</h1></div>${right}</header>`;
}
function HomeHeader() {
  return `<header class="home-head">
    <div>
      ${brandGlyph("home-signature")}
      <div class="eyebrow" style="margin-top:12px">${fmtDate()} · Week ${weekNumber()} / 36</div>
      <h1 class="h1">Mohammad</h1>
      ${SyncBadge()}
    </div>
    <button class="readiness-orb" data-action="theme"><strong>${readinessScore()}</strong><span>Readiness</span></button>
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
        ${Quick("Padel", "play", !!state.padelLogs[today]?.completed, "padel", !d.hasPadel)}
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
  if (d.hasPadel && !state.padelLogs[todayStr()]?.completed) return { label: "Mark Padel", action: "toggle-padel" };
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
    dayIndex,
    startedAt: Date.now(),
    elapsedBeforePause: 0,
    pausedAt: null,
    paused: false,
    sets: {}
  };
  saveAll();
  state.screen = "active";
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
  const allDone = Array.from({ length: Number(ex.sets) }, (_, i) => state.activeWorkout.sets[`${exIdx}-${i}`]?.done).every(Boolean);
  return `<article class="exercise-card" style="${allDone ? "border-color:color-mix(in srgb,var(--success) 32%,transparent)" : ""}">
    <div style="display:flex;justify-content:space-between;gap:10px">
      <div>
        <div class="day-title">${allDone ? "✓ " : ""}${ex.name}</div>
        <div class="exercise-meta"><span>${ex.sets} × ${ex.reps}</span><span>${ex.intensity}</span>${ex.rest ? `<span>${ex.rest}s rest</span>` : ""}</div>
      </div>
    </div>
    ${ex.notes ? `<div class="day-meta">${ex.notes}</div>` : ""}
    ${Array.from({ length: Number(ex.sets) }, (_, setIdx) => SetRow(exIdx, setIdx)).join("")}
  </article>`;
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
  return `${Header("Daily Log", fmtDate())}
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
  const weight = latestWeight();
  const totalWorkouts = Object.values(state.workoutLogs).filter((w) => w.completed).length;
  const totalPadel = Object.values(state.padelLogs).filter((p) => p.completed).length;
  const weights = Object.entries(state.logs).filter(([, v]) => v.bodyWeight).sort(([a], [b]) => a.localeCompare(b)).slice(-8);
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
      ${weights.length > 1 ? `<div class="progress-chart">${weights.map(([, v]) => `<div class="bar" style="--h:${Math.max(18, 150 - (v.bodyWeight - 88) * 5)}px"></div>`).join("")}</div>` : `<div class="empty">Log two weight entries to reveal the trend.</div>`}
    </section>
    <section class="form-card section-gap">
      <div class="card-title">Settings</div>
      <div class="segmented"><button class="${state.theme === "dark" ? "active" : ""}" data-theme-set="dark">Dark</button><button class="${state.theme === "light" ? "active" : ""}" data-theme-set="light">Light</button><button data-action="reset-demo">Reset Logs</button></div>
    </section>
    <section class="form-card section-gap">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div>
          <div class="card-title">Cloud Account</div>
          <div class="day-meta">${esc(state.auth.profile?.email || state.auth.user?.email || "")}</div>
          <div class="day-meta">Role: ${esc(state.auth.profile?.role || "player")} · ${esc((state.syncStatus || getSyncStatus()).detail)}</div>
        </div>
        ${SyncBadge()}
      </div>
      <div class="grid-2 section-gap">
        <button class="btn btn-secondary" data-action="export-backup">Export Backup</button>
        <button class="btn btn-secondary" data-action="cloud-backup-now">Cloud Backup</button>
      </div>
      <div class="field">
        <label>Import Backup JSON</label>
        <input class="input" type="file" accept="application/json" data-import-backup />
      </div>
      ${isAdmin() ? `<div class="section-gap card metric-card" style="box-shadow:none"><div class="eyebrow">Admin</div><div class="metric-sub">Admin role active. Player management requires assigned athlete policies; privileged account creation should stay outside the public frontend.</div></div>` : ""}
      <button class="btn btn-danger section-gap" style="width:100%" data-action="logout">Logout</button>
    </section>`;
}
function BottomNav() {
  const items = [["home","Home","home"],["plan","Plan","plan"],["logs","Logs","logs"],["nutrition","Nutrition","nutrition"],["progress","Progress","progress"]];
  if (state.auth.loading || !state.auth.user) return "";
  if (state.screen === "active") return "";
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
      <p class="day-meta" style="margin:8px 0 0">${m.body}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" data-modal="${m.cancelAction}">${m.cancelLabel}</button>
        <button class="btn ${m.danger ? "btn-danger" : "btn-primary"}" data-modal="${m.confirmAction}">${m.confirmLabel}</button>
      </div>
    </div>
  </div>`;
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
    if (el.dataset.quick === "padel") togglePadel();
    else setScreen(el.dataset.quick);
  }));
  document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", () => handleAction(el.dataset.action)));
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
    state.activeWorkout.sets[key] = { ...(state.activeWorkout.sets[key] || {}), [el.dataset.field]: el.value };
    saveAll();
  }));
  document.querySelectorAll("[data-set-done]").forEach((el) => el.addEventListener("click", () => {
    const key = el.dataset.setDone;
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
  if (action === "toggle-auth-mode") {
    const next = read("mm-auth-mode", "signin") === "signin" ? "signup" : "signin";
    write("mm-auth-mode", next);
    state.auth.error = "";
    render();
  }
  if (action === "auth-signin" || action === "auth-signup") {
    const email = document.querySelector("[data-auth='email']")?.value?.trim();
    const password = document.querySelector("[data-auth='password']")?.value || "";
    const displayName = document.querySelector("[data-auth='displayName']")?.value?.trim() || "";
    try {
      state.auth.error = "";
      if (action === "auth-signin") await signIn(email, password);
      else await signUp(email, password, displayName);
    } catch (error) {
      state.auth.error = error.message || "Authentication failed";
      render();
    }
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
    location.reload();
  }
}
function togglePadel() {
  const today = todayStr();
  const d = todayPlan();
  if (!d.hasPadel) return toast("No padel scheduled today");
  const done = !!state.padelLogs[today]?.completed;
  state.padelLogs[today] = { completed: !done, duration: d.padelDuration || 90, date: today };
  saveAll();
  toast(!done ? "Padel marked complete" : "Padel unchecked");
  render();
}
function handleModal(action) {
  if (action === "close") {
    state.modal = null;
    render();
  }
  if (action === "confirm-cancel") {
    state.activeWorkout = null;
    state.modal = null;
    saveAll();
    state.screen = "home";
    toast("Workout canceled");
    render();
  }
  if (action === "confirm-finish") {
    const today = todayStr();
    const aw = state.activeWorkout;
    state.workoutLogs[today] = {
      completed: true,
      date: today,
      dayIndex: aw.dayIndex,
      duration: Math.max(1, Math.round(elapsed(aw) / 60)),
      sets: aw.sets
    };
    state.activeWorkout = null;
    state.modal = null;
    saveAll();
    state.screen = "home";
    toast("Workout saved");
    render();
  }
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

async function boot() {
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
        const cloud = await loadCloudSnapshot();
        if (cloud?.data) hydrateFromSnapshot(cloud);
        else queueCloudSnapshot(appSnapshot);
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
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
