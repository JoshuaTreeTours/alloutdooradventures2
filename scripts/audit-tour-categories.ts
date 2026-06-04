import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { engine6ResolvedTours } from "../src/engine6/registry";
import { legacyFhMigratedTours } from "../src/engine6/legacyFh/registry";
import { TOUR_ACTIVITY_CATEGORIES } from "../src/lib/tourCategoryClassifier";

const allTours = [...engine6ResolvedTours, ...legacyFhMigratedTours];
const counts: Record<string, number> = Object.fromEntries(
  TOUR_ACTIVITY_CATEGORIES.map(category => [category.label, 0])
);

for (const tour of allTours) {
  for (const category of tour.activityCategories) {
    counts[category.label] = (counts[category.label] ?? 0) + 1;
  }
}

const multiCategoryTours = allTours
  .filter(tour => tour.activityCategories.length > 1)
  .slice(0, 12);

const lines = [
  "# Tour Category Classification Audit",
  "",
  `Generated from ${engine6ResolvedTours.length} Engine6 native tours and ${legacyFhMigratedTours.length} migrated legacy/FareHarbor tours.`,
  "",
  "## Category counts",
  "",
  "| Category | Tour assignments |",
  "| --- | ---: |",
  ...TOUR_ACTIVITY_CATEGORIES.map(
    category => `| ${category.label} | ${counts[category.label] ?? 0} |`
  ),
  "",
  "## Multi-category examples",
  "",
  multiCategoryTours.length > 0
    ? "| Product code | Title | Primary display category | Activity categories |"
    : "No multi-category examples found.",
  ...(multiCategoryTours.length > 0
    ? [
        "| --- | --- | --- | --- |",
        ...multiCategoryTours.map(
          tour =>
            `| ${tour.productCode} | ${tour.title.replace(/\|/g, "\\|")} | ${tour.primaryDisplayCategory ?? ""} | ${tour.activityCategories.map(category => category.label).join(", ")} |`
        ),
      ]
    : []),
  "",
  "## Notes",
  "",
  "- Counts are category assignments, so one tour can increment multiple categories.",
  "- `primaryDisplayCategory` remains a single value for card/listing badge surfaces; `activityCategories` stores the reusable structured multi-category metadata.",
];

const report = `${lines.join("\n")}\n`;
const outputPath = resolve("docs/tour-category-audit.md");
writeFileSync(outputPath, report);
console.log(report);
console.log(`Wrote ${outputPath}`);
