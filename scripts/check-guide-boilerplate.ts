import fs from "node:fs";
import path from "node:path";
import { findBannedPhrase } from "../src/utils/guides/validateNoBoilerplate";

const ROOT = path.resolve("src/data/guides/us");

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith(".json") && entry.name !== "index.json") out.push(full);
  }
  return out;
};

let bad = 0;
for (const file of walk(ROOT)) {
  const json = JSON.parse(fs.readFileSync(file, "utf8")) as { thingsToDo?: Array<{ description?: string }> };
  for (const item of json.thingsToDo ?? []) {
    const banned = findBannedPhrase(item.description ?? "");
    if (banned) {
      bad += 1;
      console.error(`${file}: ${banned}`);
    }
  }
}

if (bad > 0) {
  console.error(`Found ${bad} banned descriptions`);
  process.exit(1);
}

console.log("No banned guide boilerplate found.");
