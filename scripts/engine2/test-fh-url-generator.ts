import assert from "node:assert/strict";

import { buildFareHarborUrl } from "../../src/engine2/utils/buildFareHarborUrl";

const output = buildFareHarborUrl({
  company: "red-jeep",
  itemId: "34891",
  calendarPath: "/calendar/2026/02/",
});

const parsed = new URL(output);

assert.equal(parsed.hostname, "fareharbor.com");
assert.equal(
  parsed.pathname,
  "/embeds/book/red-jeep/items/34891/calendar/2026/02/"
);

const expectedParams = {
  asn: "fh",
  "asn-ref": "alloutdooradventures",
  flow: "no",
  "full-items": "yes",
  g4: "yes",
  ref: "https://www.alloutdooradventures.com",
  back: "https://www.alloutdooradventures.com/",
};

for (const [key, value] of Object.entries(expectedParams)) {
  assert.equal(parsed.searchParams.get(key), value, `missing ${key}`);
}

const disallowedPatterns = ["gclid", "branding", "bookable-only"];
for (const pattern of disallowedPatterns) {
  assert.equal(output.includes(pattern), false, `should not include ${pattern}`);
}
assert.equal(/flow=\d+/.test(output), false, "should not include numeric flow values");

assert.equal(
  output,
  "https://fareharbor.com/embeds/book/red-jeep/items/34891/calendar/2026/02/?asn=fh&asn-ref=alloutdooradventures&flow=no&full-items=yes&g4=yes&ref=https%3A%2F%2Fwww.alloutdooradventures.com&back=https%3A%2F%2Fwww.alloutdooradventures.com%2F"
);

console.log("engine2 fareharbor url normalization checks passed");
