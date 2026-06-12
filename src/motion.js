export const MOTION = Object.freeze({
  instant: 90,
  fast: 160,
  standard: 200,
  emphasis: 240,
  stagger: 55,
  staggerCap: 280
});

let lastScreenKey = null;
let completedSetKeys = new Set();

const REVEAL_SELECTORS = [
  ".performance-cockpit",
  ".primary-insight-card",
  ".volume-intelligence",
  ".strength-leaderboard",
  ".pr-timeline",
  ".consistency-strip",
  ".body-metric-trend",
  ".recovery-pattern",
  ".history-calendar-instrument",
  ".selected-day-intelligence",
  ".activity-timeline",
  ".nutrition-cockpit",
  ".macro-instrument-grid",
  ".daily-log-cockpit",
  ".profile-cockpit",
  ".admin-workspace-tabs",
  ".admin-workspace-panel"
];

export function prefersReducedMotion() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function motionDelay(index = 0, step = MOTION.stagger, cap = MOTION.staggerCap) {
  const safeIndex = Math.max(0, Number(index) || 0);
  return `${Math.min(safeIndex * step, cap)}ms`;
}

export function normalizeProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, number));
}

export function shouldAnimateScreen(previousScreen, nextScreen, reducedMotion = prefersReducedMotion()) {
  return !reducedMotion && previousScreen !== nextScreen;
}

function activateNode(node, className, animate) {
  if (!node) return;
  if (!animate) node.classList.add("motion-static");
  const activate = () => node.classList.add(className);
  if (animate && typeof requestAnimationFrame === "function") requestAnimationFrame(activate);
  else activate();
}

export function applyPerformanceMotion({ root = document, screenKey = "unknown", force = false } = {}) {
  if (!root?.querySelectorAll) return;
  const reduced = prefersReducedMotion();
  const animate = force || shouldAnimateScreen(lastScreenKey, screenKey, reduced);
  const screen = root.querySelector("[data-motion-screen]");

  if (screen && animate) screen.classList.add("motion-screen-enter");

  root.querySelectorAll(REVEAL_SELECTORS.join(",")).forEach((node, index) => {
    if (!node.hasAttribute("data-motion-reveal")) node.dataset.motionReveal = String(index);
  });

  root.querySelectorAll(".rail > span, .macro-instrument .rail > i").forEach((node) => {
    if (node.hasAttribute("data-motion-progress")) return;
    const value = parseFloat(node.style.getPropertyValue("--pct"));
    if (Number.isFinite(value)) node.dataset.motionProgress = String(value);
  });

  root.querySelectorAll("[data-motion-reveal]").forEach((node, index) => {
    const order = Number(node.dataset.motionReveal);
    node.style.setProperty("--motion-delay", motionDelay(Number.isFinite(order) ? order : index));
    activateNode(node, "motion-reveal-ready", animate);
  });

  root.querySelectorAll("[data-motion-progress]").forEach((node) => {
    const value = normalizeProgress(node.dataset.motionProgress);
    node.style.setProperty("--motion-progress", `${value}%`);
    activateNode(node, "motion-progress-ready", animate);
  });

  root.querySelectorAll(".chart-line, .body-sparkline polyline").forEach((node) => {
    activateNode(node, "motion-chart-ready", animate);
  });

  const currentCompleted = new Set();
  root.querySelectorAll("[data-motion-set].done").forEach((node) => {
    const key = node.dataset.motionSet;
    currentCompleted.add(key);
    if (!completedSetKeys.has(key) && lastScreenKey === screenKey && !reduced) {
      node.classList.add("motion-set-complete");
    }
  });
  completedSetKeys = screenKey === "active" ? currentCompleted : new Set();

  lastScreenKey = screenKey;
}
