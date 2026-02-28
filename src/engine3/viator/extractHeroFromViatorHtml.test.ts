import { describe, expect, it } from "vitest";

import { extractHeroFromViatorHtml } from "./extractHeroFromViatorHtml";

describe("extractHeroFromViatorHtml", () => {
  it("returns largest tacdn image when both 360x240 and 674x446 are present", () => {
    const html = `
      <img src="https://media.tacdn.com/media/attractions-splice-spp-360x240/06/e0/2f/52.jpg" />
      <img src="https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg" />
    `;

    const extracted = extractHeroFromViatorHtml(html);

    expect(extracted.heroUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
  });

  it("rejects junk nav/icon images", () => {
    const html =
      '<img src="https://cache.vtrcdn.com/orion/images/globalNav/fallback-top-activities_100x100.webp" />';

    const extracted = extractHeroFromViatorHtml(html);
    expect(extracted.heroUrl).toBeUndefined();
  });
});
