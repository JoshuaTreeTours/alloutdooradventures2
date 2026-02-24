import { describe, expect, it } from "vitest";

import { parseFareHarborHtml } from "./parseFareHarborHtml";

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
    expect(parseFareHarborHtml(makeHtml("Sunset Trail Walk", "Dock 1")).category.primary).toBe(
      "Hiking tour"
    );
    expect(
      parseFareHarborHtml(makeHtml("Harbor Cruise Adventure", "Marina, CA")).category.primary
    ).toBe("Boat tour");
  });

  it("keeps guided tour fallback when confidence is low", () => {
    expect(
      parseFareHarborHtml(makeHtml("City Highlights Experience", "Main Plaza")).category.primary
    ).toBe("Guided tour");
  });


  it("extracts unique ordered gallery images from slider markup", () => {
    const parsed = parseFareHarborHtml(`
<main>
  <section class="fh-slider">
    <img src="http://cdn.example.com/hero.jpg" />
    <img data-src="//cdn.example.com/second.jpg" />
    <img src="https://cdn.example.com/hero.jpg" />
  </section>
  ${makeHtml("Slider Tour", "Main Plaza")}
</main>
`);

    expect(parsed.heroImage).toBe("https://cdn.example.com/hero.jpg");
    expect(parsed.galleryImages).toEqual([
      "https://cdn.example.com/hero.jpg",
      "https://cdn.example.com/second.jpg",
    ]);
  });

  it("stores raw text when meeting point cannot be fully parsed", () => {
    const parsed = parseFareHarborHtml(
      makeHtml("Canyon Jeep", "Meet at visitor center lobby next to ticket desk")
    );
    expect(parsed.meetingPoint.rawText).toContain("visitor center lobby");
    expect(parsed.meetingPoint.addressLine1).toBeUndefined();
  });
});
