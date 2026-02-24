import { describe, expect, it } from "vitest";

import { parseFareHarborHtml } from "./parseFareHarborHtml";
import {
  fareHarborHtmlByUrl,
  FAREHARBOR_URL_34849,
} from "./fareharborBookFixtures";

const makeHtml = (title: string, details: string) => `
<main>
  <h1>${title}</h1>
  <section data-fh="details">
    <p><strong>Duration:</strong> 2 hours</p>
    <p><strong>Meeting Point:</strong> ${details}</p>
  </section>
  <section data-fh="pricing">
    <ul><li>Adults: $99</li></ul>
  </section>
</main>
`;

describe("parseFareHarborHtml category and meeting point", () => {
  it("detects hiking and boat categories from title", () => {
    expect(
      parseFareHarborHtml(makeHtml("Sunset Trail Walk", "Dock 1")).category
        .primary
    ).toBe("Hiking tour");
    expect(
      parseFareHarborHtml(makeHtml("Harbor Cruise Adventure", "Marina, CA"))
        .category.primary
    ).toBe("Boat tour");
  });

  it("keeps guided tour fallback when confidence is low", () => {
    expect(
      parseFareHarborHtml(makeHtml("City Highlights Experience", "Main Plaza"))
        .category.primary
    ).toBe("Guided tour");
  });

  it("stores raw text when meeting point cannot be fully parsed", () => {
    const parsed = parseFareHarborHtml(
      makeHtml(
        "Canyon Jeep",
        "Meet at visitor center lobby next to ticket desk"
      )
    );
    expect(parsed.meetingPoint.rawText).toContain("visitor center lobby");
    expect(parsed.meetingPoint.addressLine1).toBeUndefined();
  });

  it("extracts unique slider images for tour 34849", () => {
    const parsed = parseFareHarborHtml(
      fareHarborHtmlByUrl[FAREHARBOR_URL_34849]
    );

    expect(parsed.galleryImages.length).toBeGreaterThanOrEqual(2);
    expect(new Set(parsed.galleryImages).size).toBe(
      parsed.galleryImages.length
    );
    expect(parsed.galleryImages).toContain(
      "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm"
    );
  });
});
