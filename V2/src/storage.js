import { authState, currentAthleteId, currentUserId } from "./auth.js";
import { getAppSetting, insertBackupExport, upsertAppSetting } from "./db.js";

export const LOCAL_KEYS = [
  "mm-theme",
  "mm-daily-logs",
  "mm-workout-logs",
  "mm-nutrition-logs",
  "mm-padel-logs",
  "mm-plan",
  "mm-active-workout",
  "mm-auth-mode"
];

const CLOUD_STATE_KEY = "app_state";
let syncTimer = null;
let lastSyncStatus = { label: "Local", detail: "Local backup active", state: "local" };

export function localRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function localWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function localRemove(key) {
  localStorage.removeItem(key);
}

export function getLocalBackupSnapshot() {
  const data = {};
  for (const key of LOCAL_KEYS) data[key] = localRead(key, null);
  return {
    app: "MM Fitness App",
    version: 1,
    exportedAt: new Date().toISOString(),
    keys: LOCAL_KEYS,
    data
  };
}

export function downloadLocalBackup() {
  const snapshot = getLocalBackupSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mm-fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return snapshot;
}

export function importLocalBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result || "{}"));
        if (!backup.data || !Array.isArray(backup.keys)) throw new Error("Invalid MM Fitness backup file");
        for (const key of LOCAL_KEYS) {
          if (Object.prototype.hasOwnProperty.call(backup.data, key)) {
            const value = backup.data[key];
            if (value === null || typeof value === "undefined") localRemove(key);
            else localWrite(key, value);
          }
        }
        resolve(backup);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Could not read backup file"));
    reader.readAsText(file);
  });
}

export function getSyncStatus() {
  return lastSyncStatus;
}

function setSyncStatus(next) {
  lastSyncStatus = next;
  window.dispatchEvent(new CustomEvent("mm-sync-status", { detail: next }));
}

export async function loadCloudSnapshot() {
  const athleteId = currentAthleteId();
  if (!athleteId) return null;
  const row = await getAppSetting(athleteId, CLOUD_STATE_KEY);
  return row?.setting_value || null;
}

export async function saveCloudSnapshot(snapshot) {
  const athleteId = currentAthleteId();
  if (!athleteId) {
    setSyncStatus({ label: "Local", detail: "Sign in to cloud sync", state: "local" });
    return null;
  }
  setSyncStatus({ label: "Saving", detail: "Cloud sync in progress", state: "saving" });
  try {
    const result = await upsertAppSetting(athleteId, CLOUD_STATE_KEY, {
      ...snapshot,
      syncedAt: new Date().toISOString()
    });
    setSyncStatus({ label: "Saved", detail: "Cloud backup updated", state: "saved" });
    return result;
  } catch (error) {
    setSyncStatus({ label: "Sync error", detail: error.message || "Cloud sync failed", state: "error" });
    throw error;
  }
}

export function queueCloudSnapshot(snapshotFactory) {
  if (!authState.user || !authState.athlete) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await saveCloudSnapshot(snapshotFactory());
    } catch {
      // Status is already updated by saveCloudSnapshot. The app keeps local data intact.
    }
  }, 650);
}

export async function recordBackupExport(metadata = {}) {
  const userId = currentUserId();
  const athleteId = currentAthleteId();
  if (!userId) return null;
  return insertBackupExport(userId, athleteId, metadata);
}
