import assert from "node:assert/strict";

import handler from "../api/og";

const origin = "https://www.alloutdooradventures.com";
const homeTitle = "All Outdoor Adventures";
const knownTourPath =
  "/destinations/arizona/flagstaff/tours/ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718";
const failingTourPath =
  "/destinations/california/joshua-tree/tours/sunset-trail-ride-402194";

const getTitleFromHtml = (html: string) => {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match?.[1]?.trim() || "";
};

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

  const rewrittenPathRes = await handler(
    new Request(`${origin}/api/og${failingTourPath}`),
  );
  assert.equal(
    rewrittenPathRes.status,
    200,
    "expected 200 response for path-derived OG route",
  );

  const rewrittenPathHtml = await rewrittenPathRes.text();
  const rewrittenTitle = getTitleFromHtml(rewrittenPathHtml);
  assert.notEqual(rewrittenTitle, homeTitle, "title should not be home title");
  assert.match(
    rewrittenPathHtml,
    /<title>[^<]*Sunset Trail Ride[^<]*<\/title>/i,
    "expected tour-specific title for failing tour path",
  );

  console.log("OG metadata smoke test passed");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
