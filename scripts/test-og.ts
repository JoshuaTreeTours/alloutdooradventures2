import assert from "node:assert/strict";

import handler from "../api/og";

const origin = "https://www.alloutdooradventures.com";
const knownTourPath =
  "/destinations/arizona/flagstaff/tours/ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718";
const joshuaTreePath =
  "/destinations/california/joshua-tree/tours/sunset-trail-ride-402194";

const run = async () => {
  const knownRes = await handler(
    new Request(`${origin}/api/og?path=${encodeURIComponent(knownTourPath)}`),
  );
  assert.equal(knownRes.status, 200, "expected 200 response for known tour path");

  const knownHtml = await knownRes.text();

  assert.match(knownHtml, /<title>[^<]+<\/title>/, "title tag missing");
  assert.match(
    knownHtml,
    /<meta name="description" content="[^"]+" \/>/,
    "description meta missing",
  );
  assert.match(
    knownHtml,
    new RegExp(`<link rel="canonical" href="${origin}${knownTourPath}" \/>`),
    "canonical should match request path",
  );

  const joshuaTreeRes = await handler(
    new Request(`${origin}/api/og?path=${encodeURIComponent(joshuaTreePath)}`),
  );
  assert.equal(
    joshuaTreeRes.status,
    200,
    "expected 200 response for Joshua Tree tour path",
  );

  const joshuaTreeHtml = await joshuaTreeRes.text();
  assert.match(
    joshuaTreeHtml,
    /<title>[^<]*Sunset Trail Ride[^<]*<\/title>/i,
    "expected tour-specific title for Joshua Tree",
  );
  assert.doesNotMatch(
    joshuaTreeHtml,
    /Curated tours & experiences on All Outdoor Adventures\./,
    "expected non-fallback description for Joshua Tree",
  );

  console.log("OG metadata smoke test passed");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
