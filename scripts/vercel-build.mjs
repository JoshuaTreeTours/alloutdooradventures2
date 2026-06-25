import { execSync } from "node:child_process";
import fs from "node:fs";

const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const isPreview = VERCEL_ENV === "preview";

console.log("VERCEL_ENV:", VERCEL_ENV);

function exists(path) {
  try {
    return fs.existsSync(path);
  } catch {
    return false;
  }
}

// Keep build-time Engine6 registry scans quiet unless explicitly debugging location fallbacks.
const buildEnv = {
  ...process.env,
  ENGINE6_LOCATION_DIAGNOSTICS: process.env.ENGINE6_LOCATION_DIAGNOSTICS ?? "0",
};

function run(cmd, extraEnv = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: { ...buildEnv, ...extraEnv },
  });
}

const runBuildArtifactVerification =
  process.env.VERIFY_BUILD_ARTIFACTS === "1";

/*
BUILD FLOW

preview:
  vite
  prerender

production:
  enrichment (when script exists)
  merchant feed (when script exists; requires VIATOR_API_KEY)
  sitemap
  vite
  prerender

all envs:
  fix-root-index-seo
  ensure-prerendered-route-files

Optional (VERIFY_BUILD_ARTIFACTS=1 or npm run verify:build-artifacts):
  destination/engine6 SEO verification
  route head identity / canonical checks
  SEO placeholder scan
*/

if (!isPreview && exists("scripts/generate-tour-enrichment.mjs")) {
  run("node scripts/generate-tour-enrichment.mjs");
} else if (!isPreview && exists("scripts/generate-tour-enrichment.ts")) {
  run("tsx scripts/generate-tour-enrichment.ts");
} else {
  console.log("Skipping tour enrichment.");
}

if (!isPreview && exists("scripts/generate-merchant-feed.ts")) {
  run("tsx scripts/generate-merchant-feed.ts", {
    REQUIRE_LIVE_MERCHANT_COMMERCIAL: "1",
  });
} else if (!isPreview) {
  console.log("Skipping merchant feed generation.");
}

run("vite build");

if (exists("scripts/generate-sitemap.mjs")) {
  run("node scripts/generate-sitemap.mjs", { SITEMAP_WRITE: "1" });
}

if (isPreview) {
  run("tsx scripts/verify-engine6-preview.ts");
}

if (exists("scripts/run-prerender.mjs")) {
  run("node scripts/run-prerender.mjs");
} else {
  console.log("Skipping prerender.");
}

if (exists("scripts/fix-root-index-seo.mjs")) {
  run("node scripts/fix-root-index-seo.mjs");
}

if (exists("scripts/ensure-prerendered-route-files.mjs")) {
  run("node scripts/ensure-prerendered-route-files.mjs");
}

if (runBuildArtifactVerification) {
  if (exists("scripts/verify-engine6-route-seo.mjs")) {
    run("node scripts/verify-engine6-route-seo.mjs");
  }

  if (exists("scripts/verify-destination-route-seo.mjs")) {
    run("node scripts/verify-destination-route-seo.mjs");
  }

  if (exists("scripts/verify-route-head-identity.mjs")) {
    run("node scripts/verify-route-head-identity.mjs");
  }

  if (exists("scripts/verify-destination-tour-canonical.mjs")) {
    run("node scripts/verify-destination-tour-canonical.mjs");
  }

  if (exists("scripts/verify-no-seo-placeholders.mjs")) {
    run("node scripts/verify-no-seo-placeholders.mjs");
  }
} else {
  console.log(
    "Skipping build artifact verification (set VERIFY_BUILD_ARTIFACTS=1 or run npm run verify:build-artifacts)."
  );
}
