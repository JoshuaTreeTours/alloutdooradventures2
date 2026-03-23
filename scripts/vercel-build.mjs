import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function capture(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

const VERCEL_ENV = (process.env.VERCEL_ENV || "").toLowerCase();
const isPreview = VERCEL_ENV === "preview";
const isProd = VERCEL_ENV === "production";
const gitCommitSha =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GIT_COMMIT ||
  capture("git rev-parse HEAD");
const gitBranch =
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.GIT_BRANCH ||
  capture("git branch --show-current");
const vercelUrl = process.env.VERCEL_URL || "";

console.log("VERCEL_ENV:", VERCEL_ENV);
console.log("GIT_COMMIT_SHA:", gitCommitSha || "unknown");
console.log("GIT_BRANCH:", gitBranch || "unknown");
console.log("VERCEL_URL:", vercelUrl || "unknown");

process.env.VITE_GIT_COMMIT_SHA = gitCommitSha;
process.env.VITE_GIT_BRANCH = gitBranch;
process.env.VITE_VERCEL_ENV = process.env.VERCEL_ENV || "";
process.env.VITE_VERCEL_URL = vercelUrl;

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

if (!isPreview && exists("scripts/run-prerender.mjs")) {
  run("node scripts/run-prerender.mjs");
} else {
  console.log("Skipping prerender.");
}
