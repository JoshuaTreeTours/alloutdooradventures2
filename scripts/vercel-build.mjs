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
  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);
}

function formatCapturedProcessFailure(stdout, stderr) {
  const sections = [];
  if (stdout?.trim()) sections.push("--- stdout ---", stdout.trimEnd());
  if (stderr?.trim()) sections.push("--- stderr ---", stderr.trimEnd());
  if (sections.length === 0) sections.push("(no captured stdout/stderr)");
  return sections.join("\n");
}

function runMerchantFeedCommercialBackfill() {
  const cmd = "tsx";
  const args = ["scripts/refresh-merchant-feed-commercial-backfill.ts"];
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    shell: true, stdio: ["inherit", "pipe", "pipe"],
  });
  emitCapturedProcessOutput("[vercel-build][commercial-backfill]", result.stdout, result.stderr);
  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(result.stdout, result.stderr);
    throw new Error(`refresh-merchant-feed-commercial-backfill.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`);
  }
}

function resolveEngine6LiveViatorValidationEnv() {
  const explicitMode = process.env.ENGINE6_LIVE_VIATOR_VALIDATION_MODE?.trim().toLowerCase() ?? "";
  const validationMode = explicitMode === "strict" ? "strict" : "pr-scoped";
  return { ENGINE6_LIVE_VIATOR_VALIDATION_MODE: validationMode };
}

function runEngine6LiveViatorProductionValidation() {
  const cmd = "tsx";
  const args = ["scripts/validate-engine6-production-viator.ts"];
  const validationEnv = resolveEngine6LiveViatorValidationEnv();
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv, ...validationEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    shell: true, stdio: ["inherit", "pipe", "pipe"],
  });
  emitCapturedProcessOutput("[vercel-build][engine6-live-viator-validation]", result.stdout, result.stderr);
  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(result.stdout, result.stderr);
    throw new Error(`validate-engine6-production-viator.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`);
  }
}

function runMerchantFeedGeneration() {
  const cmd = "tsx";
  const args = ["scripts/generate-merchant-feed.ts"];
  const extraEnv = { REQUIRE_LIVE_MERCHANT_COMMERCIAL: "1" };
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv, ...extraEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    shell: true, stdio: ["inherit", "pipe", "pipe"],
  });
  emitCapturedProcessOutput("[vercel-build][merchant-feed]", result.stdout, result.stderr);
  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(result.stdout, result.stderr);
    throw new Error(`generate-merchant-feed.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`);
  }
}

function runMerchantFeedCommercialParityAudit() {
  const cmd = "tsx";
  const args = ["scripts/audit-merchant-feed-commercial-parity.ts"];
  const extraEnv = { REQUIRE_LIVE_MERCHANT_COMMERCIAL: "1" };
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const result = spawnSync(`${cmd} ${args.join(" ")}`, {
    env: { ...buildEnv, ...extraEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024,
    shell: true, stdio: ["inherit", "pipe", "pipe"],
  });
  emitCapturedProcessOutput("[vercel-build][merchant-feed-commercial-parity]", result.stdout, result.stderr);
  if (result.status !== 0) {
    const failureDetails = formatCapturedProcessFailure(result.stdout, result.stderr);
    throw new Error(`audit-merchant-feed-commercial-parity.ts failed with exit code ${result.status ?? "null"}\n${failureDetails}`);
  }
}

const runBuildArtifactVerification = process.env.VERIFY_BUILD_ARTIFACTS === "1";

if (!isPreview && exists("scripts/generate-tour-enrichment.mjs")) {
  run("node scripts/generate-tour-enrichment.mjs");
} else if (!isPreview && exists("scripts/generate-tour-enrichment.ts")) {
  run("tsx scripts/generate-tour-enrichment.ts");
}

if (!isPreview && process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL === "1" && exists("scripts/refresh-merchant-feed-commercial-backfill.ts")) {
  runMerchantFeedCommercialBackfill();
}

if (!isPreview && exists("scripts/validate-engine6-production-viator.ts")) {
  runEngine6LiveViatorProductionValidation();
}

if (!isPreview && process.env.RUN_MERCHANT_FEED_COMMERCIAL_BACKFILL !== "1" && exists("scripts/generate-merchant-feed.ts")) {
  runMerchantFeedGeneration();
  runMerchantFeedCommercialParityAudit();
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
}

if (exists("scripts/fix-root-index-seo.mjs")) {
  run("node scripts/fix-root-index-seo.mjs");
}

if (exists("scripts/ensure-prerendered-route-files.mjs")) {
  run("node scripts/ensure-prerendered-route-files.mjs");
}

// Internal tour HTML previously stopped at an empty React root. Server-render the
// existing route tree so Lighthouse and crawlers receive meaningful content on
// the first response; the client hydrates this exact markup afterward.
if (exists("scripts/prerender-tour-routes.tsx")) {
  run("node --import tsx scripts/prerender-tour-routes.tsx", {
    NODE_ENV: "production",
    TSX_TSCONFIG_PATH: "tsconfig.prerender.json",
  });
}

if (exists("scripts/prerender-homepage.tsx")) {
  run("node --import tsx scripts/prerender-homepage.tsx", {
    NODE_ENV: "production",
    TSX_TSCONFIG_PATH: "tsconfig.prerender.json",
  });
}

if (runBuildArtifactVerification) {
  if (exists("scripts/verify-engine6-route-seo.mjs")) run("node scripts/verify-engine6-route-seo.mjs");
  if (exists("scripts/verify-destination-route-seo.mjs")) run("node scripts/verify-destination-route-seo.mjs");
  if (exists("scripts/verify-route-head-identity.mjs")) run("node scripts/verify-route-head-identity.mjs");
  if (exists("scripts/verify-destination-tour-canonical.mjs")) run("node scripts/verify-destination-tour-canonical.mjs");
  if (exists("scripts/verify-no-seo-placeholders.mjs")) run("node scripts/verify-no-seo-placeholders.mjs");
}
