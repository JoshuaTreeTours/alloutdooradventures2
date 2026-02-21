import fs from "node:fs";
import path from "node:path";

type GuideFile = {
  tier?: "tier1" | "tier2";
  city?: string;
  state: string;
  slug?: string;
};

const ROOT = path.resolve("src/data/guides/us");

type Row = {
  state: string;
  cityName: string;
  citySlug: string;
  route: string;
};

const rows: Row[] = [];

for (const stateSlug of fs.readdirSync(ROOT).sort()) {
  const stateDir = path.join(ROOT, stateSlug);
  if (!fs.statSync(stateDir).isDirectory()) continue;

  for (const fileName of fs.readdirSync(stateDir).sort()) {
    if (!fileName.endsWith(".json")) continue;
    const citySlug = fileName.replace(/\.json$/, "");
    const filePath = path.join(stateDir, fileName);
    const guide = JSON.parse(fs.readFileSync(filePath, "utf8")) as GuideFile;

    const tier = guide.tier === "tier2" ? "tier2" : "tier1";
    if (tier === "tier1") continue;
    if (!guide.city) continue;

    const route = `guides/us/${stateSlug}/${citySlug}`;
    rows.push({
      state: guide.state,
      cityName: guide.city,
      citySlug,
      route,
    });
  }
}

rows.sort((a, b) => {
  const stateCmp = a.state.localeCompare(b.state);
  if (stateCmp !== 0) return stateCmp;
  const cityCmp = a.cityName.localeCompare(b.cityName);
  if (cityCmp !== 0) return cityCmp;
  return a.citySlug.localeCompare(b.citySlug);
});

console.log(`Non-tier1 city guides: ${rows.length}`);

const countsByState = new Map<string, number>();
for (const row of rows) {
  countsByState.set(row.state, (countsByState.get(row.state) ?? 0) + 1);
}

for (const state of Array.from(countsByState.keys()).sort((a, b) =>
  a.localeCompare(b)
)) {
  console.log(`COUNT | ${state} | ${countsByState.get(state)}`);
}

for (const row of rows) {
  console.log(`${row.state} | ${row.cityName} | ${row.citySlug} | ${row.route}`);
}
