import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));
const serviceWorker = fs.readFileSync(new URL("../sw.js", import.meta.url), "utf8");

const failures = [];

if (manifest.start_url !== "/") failures.push("manifest.start_url must be / to avoid Vercel clean URL redirects");
if (manifest.scope !== "/") failures.push("manifest.scope must be /");
if (/index\.html/.test(manifest.start_url)) failures.push("manifest.start_url must not reference index.html");
if (/caches\.match\(["']\.\/index\.html["']\)/.test(serviceWorker)) failures.push("service worker must not use index.html as a cached navigation fallback");
if (!serviceWorker.includes('event.request.mode === "navigate"')) failures.push("service worker must explicitly bypass navigation requests");
if (!serviceWorker.includes("!response.redirected")) failures.push("service worker must refuse redirected responses before caching");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("PWA navigation and redirect safeguards validated.");
