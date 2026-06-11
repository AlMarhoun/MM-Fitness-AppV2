const TYPES = new Set(["padel", "swimming"]);

function cleanActivity(activity = {}, id) {
  const type = TYPES.has(activity.type) ? activity.type : "padel";
  return {
    id: activity.id || id || `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: String(activity.date || "").slice(0, 10),
    type,
    time: String(activity.time || ""),
    duration: Math.max(0, Number(activity.duration || 0)),
    intensity: String(activity.intensity || "moderate"),
    completed: activity.completed !== false,
    notes: String(activity.notes || "").slice(0, 300),
    source: activity.source || "activity"
  };
}

export function addActivity(activityLogs = {}, activity, id) {
  const next = { ...(activityLogs || {}) };
  const normalized = cleanActivity(activity, id);
  if (!normalized.date) return next;
  next[normalized.date] = [...(next[normalized.date] || []), normalized];
  return next;
}

export function removeActivity(activityLogs = {}, date, id) {
  const next = { ...(activityLogs || {}) };
  next[date] = (next[date] || []).filter((activity) => activity.id !== id);
  if (!next[date].length) delete next[date];
  return next;
}

export function activitiesForDate(activityLogs = {}, date, legacyPadelLogs = {}) {
  const current = (activityLogs?.[date] || []).map((activity) => cleanActivity(activity, activity.id));
  if (current.some((activity) => activity.type === "padel")) return current;
  const legacy = legacyPadelLogs?.[date];
  if (!legacy?.completed) return current;
  return [...current, cleanActivity({
    id: `legacy-padel-${date}`,
    date,
    type: "padel",
    time: legacy.time,
    duration: legacy.duration,
    intensity: legacy.intensity,
    completed: true,
    notes: legacy.notes,
    source: "legacy"
  })];
}

export function activityCount(activityLogs = {}, type, dates = null, legacyPadelLogs = {}) {
  const keys = dates || Array.from(new Set([...Object.keys(activityLogs || {}), ...Object.keys(legacyPadelLogs || {})]));
  return keys.reduce((total, date) => total + activitiesForDate(activityLogs, date, legacyPadelLogs)
    .filter((activity) => activity.completed && (!type || activity.type === type)).length, 0);
}

export function activityLabel(type) {
  return type === "swimming" ? "Swimming" : "Padel";
}
