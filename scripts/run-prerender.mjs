const env = process.env.VERCEL_ENV;
process.env.PRERENDER = process.env.PRERENDER || "1";

if (env === "preview") {
  console.log("⏭ Skipping prerender in preview environment.");
  process.exit(0);
}

console.log("🚀 Running prerender (production build).");

import("./prerender.mjs")
  .then(() => {
    console.log("✅ Prerender complete.");
    process.exit(0);
  })
  .catch((err) => {
    const getFirstCause = (error) => {
      let current = error;
      while (current?.cause) {
        current = current.cause;
      }
      return current;
    };

    console.error("❌ Prerender failed.");
    if (err?.stack) {
      console.error("--- stack ---");
      console.error(err.stack);
    } else {
      console.error(err);
    }

    const firstCause = getFirstCause(err);
    if (firstCause && firstCause !== err) {
      console.error("--- first underlying cause ---");
      if (firstCause?.stack) {
        console.error(firstCause.stack);
      } else {
        console.error(firstCause);
      }
    }

    process.exit(1);
  });
