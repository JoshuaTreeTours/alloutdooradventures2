import { describe, expect, it } from "vitest";

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

  it("returns undefined urls when no valid API image is present", () => {
    const picked = pickViatorPrimaryImage({
      productCode: "TEST",
      imageCandidates: ["http://example.com/test.jpg", "not-a-url"],
      supplierImage: "",
    });

    expect(picked.heroUrl).toBeUndefined();
    expect(picked.cardUrl).toBeUndefined();
  });
});
