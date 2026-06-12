const INPUTS = [
  ["sleepScore", "sleep"],
  ["energyScore", "energy"],
  ["sorenessScore", "soreness"],
  ["achillesScore", "Achilles"]
];

function scoreValue(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 && number <= 5 ? number : null;
}

export function buildReadinessModel(log = {}) {
  const values = Object.fromEntries(INPUTS.map(([key]) => [key, scoreValue(log[key])]));
  const missing = INPUTS.filter(([key]) => values[key] === null).map(([, label]) => label);
  if (missing.length) {
    return {
      hasScore: false,
      score: null,
      status: "Log recovery",
      label: "Recovery Check",
      missing
    };
  }

  const score = Math.round((
    values.sleepScore
    + values.energyScore
    + (6 - values.sorenessScore)
    + (6 - values.achillesScore)
  ) / 20 * 100);

  return {
    hasScore: true,
    score,
    status: score >= 80 ? "Ready" : score >= 60 ? "Moderate" : "Reduce intensity",
    label: "Today's Readiness",
    missing: []
  };
}
