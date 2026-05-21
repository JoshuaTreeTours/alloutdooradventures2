import { describe, expect, it } from "vitest";
import handler, { getStaticOgMeta } from "./og";

const ORIGIN = "https://www.alloutdooradventures.com";

describe("legacy wrapper SEO scoped repairs", () => {
  it("uses route-specific image/meta for Santa Barbara slug", () => {
    const meta = getStaticOgMeta(
      "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.image).toBeTruthy();
    expect(meta?.image).not.toContain("/hero.jpg");
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241`
    );
    expect(meta?.title).toContain("Santa Barbara");
  });

  it("normalizes united-states legacy path canonical to state/city canonical", () => {
    const meta = getStaticOgMeta(
      "/destinations/united-states/oregon/portland/tours/half-day-gorge-waterfalls-tour-5235",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/oregon/portland/tours/half-day-gorge-waterfalls-tour-5235`
    );
    expect(meta?.image).toBeTruthy();
    expect(meta?.image).not.toContain("/hero.jpg");
  });

  it("supports legacy /tours/state/city/slug routes and yields specific canonical/image", () => {
    const meta = getStaticOgMeta(
      "/tours/arizona/flagstaff/grand-canyon-skywalk-adventure-tour-west-rim-f-adv-164139",
      ORIGIN
    );
    expect(meta).not.toBeNull();
    expect(meta?.canonical).toBe(
      `${ORIGIN}/destinations/arizona/flagstaff/tours/grand-canyon-skywalk-adventure-tour-west-rim-f-adv-164139`
    );
    expect(meta?.image).toBeTruthy();
    expect(meta?.title).toContain("Flagstaff");
  });

  it("covers additional scoped regression examples", () => {
    const examples = [
      "/destinations/california/santa-barbara/tours/full-day-island-cruise-620790",
      "/destinations/california/santa-barbara/tours/santa-barbara-harbor-and-waterfront-tour-449817",
      "/destinations/oregon/portland/tours/mt-hood-winter-wonderland-snowshoe-adventure-685976",
    ];

    for (const path of examples) {
      const meta = getStaticOgMeta(path, ORIGIN);
      expect(meta).not.toBeNull();
      expect(meta?.image).toBeTruthy();
      expect(meta?.image).not.toContain("/hero.jpg");
      expect(meta?.canonical).toContain("/destinations/");
    }
  });

  it("emits matching og/twitter/json-ld image tags for Santa Barbara regression route", async () => {
    const path =
      "/destinations/california/santa-barbara/tours/coastal-cruise-azure-seas-4241";
    const expectedImage = "https://cdn.filestackcontent.com/CpdZ3KojRiatNhscNdHS";
    const req = new Request(
      `${ORIGIN}/api/og?path=${encodeURIComponent(path)}`
    );
    const response = await handler(req);
    const html = await response.text();
    expect(html).toContain(
      `<meta property="og:image" content="${expectedImage}" />`
    );
    expect(html).toContain(
      `<meta name="twitter:image" content="${expectedImage}" />`
    );
    expect(html).toContain(`"image":"${expectedImage}"`);
    expect(html).not.toContain("/hero.jpg");
  });

  it("prioritizes scoped legacy resolver over static map for in-scope Portland tour pages", () => {
    const path =
      "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223";
    const meta = getStaticOgMeta(path, ORIGIN);
    expect(meta).not.toBeNull();
    expect(meta?.canonical).toBe(`${ORIGIN}${path}`);
    expect(meta?.image).toBeTruthy();
    expect(meta?.image).not.toContain("/hero.jpg");
  });
});
