import { describe, expect, it } from "vitest";

import { DEFAULT_ENGINE3_HERO_IMAGE_URL } from "../constants";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { pickViatorPrimaryImage } from "./viatorImages";

describe("pickViatorPrimaryImage", () => {
  it("returns a valid https image when product includes Viator images", () => {
    const picked = pickViatorPrimaryImage(viatorProductCacheByCode["6740P7"]);

    expect(picked.heroUrl).toBeDefined();
    expect(picked.cardUrl).toBeDefined();
    expect(picked.heroUrl).toMatch(/^https:\/\//);
    expect(picked.cardUrl).toMatch(/^https:\/\//);
  });

  it("falls back to Engine3 Viator default image when API images are invalid", () => {
    const picked = pickViatorPrimaryImage({
      productCode: "TEST",
      imageCandidates: ["http://example.com/test.jpg", "not-a-url"],
      supplierImage: "",
    });

    expect(picked.heroUrl).toBe(DEFAULT_ENGINE3_HERO_IMAGE_URL);
    expect(picked.cardUrl).toBe(DEFAULT_ENGINE3_HERO_IMAGE_URL);
  });

  it("falls back to Engine3 Viator default image when product is missing", () => {
    const picked = pickViatorPrimaryImage(undefined);

    expect(picked.heroUrl).toBe(DEFAULT_ENGINE3_HERO_IMAGE_URL);
    expect(picked.cardUrl).toBe(DEFAULT_ENGINE3_HERO_IMAGE_URL);
  });
});
