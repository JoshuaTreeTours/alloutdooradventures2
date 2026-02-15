const env = process.env.VERCEL_ENV;

if (env === "preview") {
  console.log("⏭ Skipping prerender in preview environment.");
  process.exit(0);
}

console.log("🚀 Running prerender (production build).");

import("./prerender.mjs")
  .then(() => {
    console.log("✅ Prerender complete.");
  })
  .catch((err) => {
    console.error("❌ Prerender failed:", err);
    process.exit(1);
  });
