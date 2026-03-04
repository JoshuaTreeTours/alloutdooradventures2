import { describe, expect, it } from "vitest";

import {
  isApprovedViatorImageUrl,
  resolveEngine3ViatorHero,
} from "./resolveHeroImage";
import { VIATOR_PLACEHOLDER_SVG } from "../../utils/viatorPlaceholderSvg";

const STABLE_SPLICE =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg";
const CAPTION_THUMB =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("isApprovedViatorImageUrl", () => {
  it("approves stable media.tacdn attractions splice urls", () => {
    expect(isApprovedViatorImageUrl(STABLE_SPLICE)).toBe(true);
  });

  it("rejects caption.jpg thumbnails", () => {
    expect(isApprovedViatorImageUrl(CAPTION_THUMB)).toBe(false);
  });

  it("rejects dynamic-media urls", () => {
    expect(
      isApprovedViatorImageUrl(
        "https://dynamic-media.tacdn.com/media/photo-o/10/11/12/13/other.jpg"
      )
    ).toBe(false);
  });
});

describe("resolveEngine3ViatorHero", () => {
  it("uses per-tour override first when approved", () => {
    const image = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      productCode: "6740JTREE",
    });

    expect(image).toBe(STABLE_SPLICE);
  });

  it("prefers approved API primary over gallery candidates", () => {
    const image = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      primaryImageUrl: STABLE_SPLICE,
      galleryImages: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/99/99/99/99.jpg",
      ],
    });

    expect(image).toBe(STABLE_SPLICE);
  });

  it("rejects caption first gallery image and picks next approved candidate", () => {
    const image = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      imageCandidates: [
        CAPTION_THUMB,
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/22/33/44.jpg",
      ],
    });

    expect(image).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/22/33/44.jpg"
    );
  });

  it("falls back to inline svg placeholder when all candidates are rejected", () => {
    const image = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      imageCandidates: [CAPTION_THUMB],
      galleryImages: ["https://example.com/nope.jpg"],
    });

    expect(image).toBe(VIATOR_PLACEHOLDER_SVG);
  });

  it("keeps tour overrides scoped and never inherited across tours", () => {
    const scenic = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      productCode: "6740JTREE",
    });
    const firstOther = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      productCode: "2335P1",
      imageCandidates: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/21/21/21/21.jpg",
      ],
    });
    const secondOther = resolveEngine3ViatorHero({
      bookingProvider: "viator",
      productCode: "3351P15",
      imageCandidates: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/31/31/31/31.jpg",
      ],
    });

    expect(scenic).toBe(STABLE_SPLICE);
    expect(firstOther).not.toBe(scenic);
    expect(secondOther).not.toBe(scenic);
  });
});
