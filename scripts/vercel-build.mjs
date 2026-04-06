import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
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
  vite only (fast, reliable)

production:
  enrichment
  sitemap
  vite
  prerender
*/

if (!isPreview && exists("scripts/generate-tour-enrichment.mjs")) {
  run("node scripts/generate-tour-enrichment.mjs");
} else {
  console.log("Skipping tour enrichment.");
}

if (!isPreview && exists("scripts/generate-sitemap.mjs")) {
  run("node scripts/generate-sitemap.mjs");
}

run("vite build");

if (isPreview) {
  run("tsx scripts/verify-engine6-preview.ts");
}

if (!isPreview && exists("scripts/run-prerender.mjs")) {
  run("node scripts/run-prerender.mjs");
} else {
  console.log("Skipping prerender.");
}
