import fs from "node:fs";
import path from "node:path";
import { GUIDE_DESCRIPTION_BLACKLIST } from "../src/utils/guides/validateNoBoilerplate";

type GuideThing = {
  title?: string;
  description?: string;
};

type GuideJson = {
  thingsToDo?: GuideThing[];
};

const ROOT = path.resolve("src/data/guides");

const walkJsonFiles = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
};

const run = () => {
  const failures: string[] = [];
  const files = walkJsonFiles(ROOT);

  for (const file of files) {
    const json = JSON.parse(fs.readFileSync(file, "utf8")) as GuideJson;
    if (!Array.isArray(json.thingsToDo)) {
      continue;
    }

    json.thingsToDo.forEach((item, index) => {
      const description = item.description ?? "";
      const blocked = GUIDE_DESCRIPTION_BLACKLIST.find(pattern =>
        pattern.test(description)
      );

      if (!blocked) {
        return;
      }

      failures.push(
        `${path.relative(process.cwd(), file)} [${index}] ${item.title ?? "Untitled"} => ${blocked}`
      );
    });
  }

  if (failures.length) {
    console.error("Blocked boilerplate phrases found in guide descriptions:");
    failures.forEach(item => console.error(`- ${item}`));
    process.exit(1);
  }

  console.log("No blocked boilerplate phrases found in guide descriptions.");
};

run();
