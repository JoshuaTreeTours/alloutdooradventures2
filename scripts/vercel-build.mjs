import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd, env = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
}

const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const isPreview = VERCEL_ENV === "preview";
const isProd = VERCEL_ENV === "production";

console.log("VERCEL_ENV:", VERCEL_ENV);

function exists(path) {
  try { return fs.existsSync(path); } catch { return false; }
}

/*
BUILD FLOW

preview:
  vite
  prerender

production:
  enrichment
  sitemap
  vite
  prerender

all envs:
  seo placeholder artifact verification
*/

if (!isPreview && exists("scripts/generate-tour-enrichment.mjs")) {
  run("node scripts/generate-tour-enrichment.mjs");
} else {
  console.log("Skipping tour enrichment.");
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
