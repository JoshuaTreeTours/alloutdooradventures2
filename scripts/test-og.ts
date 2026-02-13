import assert from "node:assert/strict";

import handler from "../api/og";

const origin = "https://www.alloutdooradventures.com";
const path =
  "/destinations/arizona/flagstaff/tours/ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718";

const req = new Request(
  `${origin}/api/og?path=${encodeURIComponent(path)}`,
);

const run = async () => {
  const res = await handler(req);
  assert.equal(res.status, 200, "expected 200 response");

  const html = await res.text();

  assert.match(html, /<title>[^<]+<\/title>/, "title tag missing");
  assert.match(
    html,
    /<meta name="description" content="[^"]+" \/>/,
    "description meta missing",
  );
  assert.match(
    html,
    new RegExp(`<link rel="canonical" href="${origin}${path}" \/>`),
    "canonical should match request path",
  );

  console.log("OG metadata smoke test passed");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
