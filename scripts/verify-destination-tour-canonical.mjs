import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const homeCanonical = "https://www.alloutdooradventures.com/";
const routePattern = /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+$/;

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(fullPath)));
    } else if (entry.isFile() && entry.name === "index.html") {
      out.push(fullPath);
    }
  }
  return out;
}

const files = await walk(dist);
const failures = [];
let checked = 0;

for (const file of files) {
  const route =
    "/" + path.relative(dist, path.dirname(file)).replace(/\\/g, "/").replace(/(^|\/)index$/, "");

  if (!routePattern.test(route)) {
    continue;
  }

  checked += 1;
  const html = await readFile(file, "utf8");
  const canonical =
    (html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || "";

  if (canonical === homeCanonical) {
    failures.push(`${route}:home-canonical`);
  }
}

if (checked === 0) {
  console.error("[verify-destination-tour-canonical] no destination tour HTML files were found.");
  process.exit(1);
}

if (failures.length) {
  console.error("[verify-destination-tour-canonical]\n" + failures.join("\n"));
  process.exit(1);
}

console.log(`[verify-destination-tour-canonical] verified ${checked} destination tour route files.`);
