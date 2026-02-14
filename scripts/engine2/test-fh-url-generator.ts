import assert from "node:assert/strict";

import {
  buildFareHarborCalendarUrl,
  getCurrentYearMonth,
} from "../../src/lib/fareharbor/buildBookingUrl";

const args = {
  shortname: "red-jeep",
  itemId: "43915",
  refUrl: "https://www.red-jeep.com",
  backUrl: "https://www.red-jeep.com/",
};

const { year, month } = getCurrentYearMonth();
const output = buildFareHarborCalendarUrl(args);

assert.match(month, /^\d{2}$/);
assert.match(year, /^\d{4}$/);

const parsed = new URL(output);
assert.equal(parsed.hostname, "fareharbor.com");
assert.equal(
  parsed.pathname,
  `/embeds/book/red-jeep/items/43915/calendar/${year}/${month}/`
);

const expectedParams = {
  asn: "fh",
  "asn-ref": "alloutdooradventures",
  flow: "no",
  "full-items": "yes",
  g4: "yes",
  ref: "https://www.red-jeep.com",
  back: "https://www.red-jeep.com/",
};

for (const [key, value] of Object.entries(expectedParams)) {
  assert.equal(parsed.searchParams.get(key), value, `missing ${key}`);
}

const expectedBase = `https://fareharbor.com/embeds/book/red-jeep/items/43915/calendar/${year}/${month}/`;
assert.equal(`${parsed.origin}${parsed.pathname}`, expectedBase);

console.log("fareharbor url generator regression checks passed");
