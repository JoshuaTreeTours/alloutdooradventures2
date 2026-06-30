import { execSync, spawnSync } from "node:child_process";
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

function emitCapturedProcessOutput(label, stdout, stderr) {
  if (stdout) {
    process.stdout.write(stdout);
  }
  if (stderr) {
    process.stderr.write(stderr);
  }
}

function formatCapturedProcessFailure(stdout, stderr) {
  const sections = [];

  if (stdout?.trim()) {
    sections.push("--- stdout ---", stdout.trimEnd());
  }

  if (stderr?.trim()) {
    sections.push("--- stderr ---", stderr.trimEnd());
  }

  if (sections.length === 0) {
    sections.push("(no captured stdout/stderr)");
  }

  return sections.join("\n");
}

function runMerchantFeedCommercialBackfill() {
  const cmd = "tsx";
  const args = ["scripts/refresh-merchant-feed-commercial-backfill.ts"];

  console.log(`\n> ${cmd} ${args.join(" ")}`);
  console.log("[vercel-build] commercial backfill env:", {
    RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL:
      process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL ?? "(unset)",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "(unset)",
    VIATOR_API_KEY: process.env.VIATOR_API_KEY ? "(set)" : "(unset)",
    ENGINE6_VIATOR_API_KEY: process.env.ENGINE6_VIATOR_API_KEY
      ? "(set)"
      : "(unset)",
    VIATOR_PARTNER_API_KEY: process.env.VIATOR_PARTNER_API_KEY
      ? "(set)"
      : "(unset)",
    VIATOR_API_BASE_URL: process.env.VIATOR_API_BASE_URL ?? "(unset)",
    VIATOR_BASE_URL: process.env.VIATOR_BASE_URL ?? "(unset)",
  });

  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  emitCapturedProcessOutput(
    "[vercel-build][commercial-backfill]",
    result.stdout,
    result.stderr
  );

  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(
      result.stdout,
      result.stderr
    );

    console.error(
      `[vercel-build] refresh-merchant-feed-commercial-backfill.ts failed (exit ${result.status ?? "null"})`
    );
    console.error(
      `[vercel-build] ${failureDetails.replace(/\n/g, "\n[vercel-build] ")}`
    );

    if (result.error) {
      console.error("[vercel-build] spawn error:", result.error);
    }

    throw new Error(
      `refresh-merchant-feed-commercial-backfill.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`
    );
  }
}

function runMerchantFeedGeneration() {
  const cmd = "tsx";
  const args = ["scripts/generate-merchant-feed.ts"];
  const extraEnv = { REQUIRE_LIVE_MERCHANT_COMMERCIAL: "1" };

  console.log(`\n> ${cmd} ${args.join(" ")}`);
  console.log("[vercel-build] merchant feed env:", {
    REQUIRE_LIVE_MERCHANT_COMMERCIAL: "1",
    MERCHANT_FEED_RUNTIME_BASE_URL:
      process.env.MERCHANT_FEED_RUNTIME_BASE_URL ?? "(unset)",
    ENGINE6_RUNTIME_BASE_URL:
      process.env.ENGINE6_RUNTIME_BASE_URL ?? "(unset)",
    VIATOR_API_KEY: process.env.VIATOR_API_KEY ? "(set)" : "(unset)",
    ENGINE6_VIATOR_API_KEY: process.env.ENGINE6_VIATOR_API_KEY
      ? "(set)"
      : "(unset)",
    VIATOR_PARTNER_API_KEY: process.env.VIATOR_PARTNER_API_KEY
      ? "(set)"
      : "(unset)",
    VIATOR_API_BASE_URL: process.env.VIATOR_API_BASE_URL ?? "(unset)",
    VIATOR_BASE_URL: process.env.VIATOR_BASE_URL ?? "(unset)",
  });

  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv, ...extraEnv },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  emitCapturedProcessOutput(
    "[vercel-build][merchant-feed]",
    result.stdout,
    result.stderr
  );

  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(
      result.stdout,
      result.stderr
    );

    console.error(
      `[vercel-build] generate-merchant-feed.ts failed (exit ${result.status ?? "null"})`
    );
    console.error(`[vercel-build] ${failureDetails.replace(/\n/g, "\n[vercel-build] ")}`);

    if (result.error) {
      console.error("[vercel-build] spawn error:", result.error);
    }

    throw new Error(
      `generate-merchant-feed.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`
    );
  }
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
  merchant feed commercial backfill (optional one-time when RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL=1)
  merchant feed (when script exists; live commercial refresh on every production build)
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

if (
  !isPreview &&
  process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL === "1" &&
  exists("scripts/refresh-merchant-feed-commercial-backfill.ts")
) {
  runMerchantFeedCommercialBackfill();
} else if (!isPreview && process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL === "1") {
  console.log("Skipping merchant feed commercial backfill (script missing).");
}

if (
  !isPreview &&
  process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL !== "1" &&
  exists("scripts/generate-merchant-feed.ts")
) {
  runMerchantFeedGeneration();
} else if (!isPreview && process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL === "1") {
  console.log(
    "Skipping full merchant feed generation (RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL=1)."
  );
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
