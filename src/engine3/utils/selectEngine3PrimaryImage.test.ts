import { describe, expect, it } from "vitest";

import {
  isRejectedCandidate,
  selectEngine3PrimaryImage,
} from "./selectEngine3PrimaryImage";

describe("selectEngine3PrimaryImage", () => {
  it("prefers dynamic-media photo-o hero images over other valid candidates", () => {
    const image = selectEngine3PrimaryImage({
      viatorImageCandidates: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/34/56/78.jpg",
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
        "https://cache.vtrcdn.com/pictures/12345.jpg",
      ],
    });

    expect(image).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1"
    );
  });

  it("rejects known placeholder and chrome-like image URLs", () => {
    expect(
      isRejectedCandidate(
        "https://dynamic-media.tacdn.com/orion/images/globalNav/fallback-top-activities.webp"
      )
    ).toBe(true);
    expect(
      isRejectedCandidate(
        "https://dynamic-media.tacdn.com/media/photo-o/2f/globalNav/fallback-image.webp"
      )
    ).toBe(true);
  });

  it("accepts legacy Viator filestack hero URLs", () => {
    const image = selectEngine3PrimaryImage({
      viatorImageCandidates: [
        "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
      ],
    });

    expect(image).toBe("https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa");
  });
});
