const UI_STATE_KEY = "mm-session-ui";

function safeNow() {
  return new Date().toISOString();
}

export function readSessionUi(fallback = {}) {
  try {
    const raw = localStorage.getItem(UI_STATE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function writeSessionUi(value) {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify({ ...value, savedAt: safeNow() }));
  } catch {
    // Local persistence is best-effort. Workout set data is still saved separately.
  }
}

export function clearSessionUi() {
  try {
    localStorage.removeItem(UI_STATE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function captureWorkoutUiState(state, extra = {}) {
  return {
    screen: state.screen,
    selectedDay: state.selectedDay,
    editingPlan: state.editingPlan,
    activeCursor: state.activeCursor || null,
    scrollY: typeof window === "undefined" ? 0 : window.scrollY || 0,
    activeWorkoutId: state.activeWorkout?.id || null,
    activeWorkoutRunning: !!state.activeWorkout && !state.activeWorkout.paused,
    activeWorkoutPaused: !!state.activeWorkout?.paused,
    ...extra
  };
}

export function persistWorkoutUiState(state, extra = {}) {
  writeSessionUi(captureWorkoutUiState(state, extra));
}

export function shouldResumeActiveWorkout(uiState, activeWorkout) {
  if (!activeWorkout) return false;
  if (!uiState || !uiState.screen) return true;
  return uiState.screen === "active" || uiState.activeWorkoutId === activeWorkout.id;
}
