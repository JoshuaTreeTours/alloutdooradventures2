const isPreviewBuild = process.env.VERCEL_ENV === "preview";

if (isPreviewBuild) {
  console.log("Skipping prerender for Vercel preview build.");
  process.exit(0);
}

await import("./prerender.mjs");
