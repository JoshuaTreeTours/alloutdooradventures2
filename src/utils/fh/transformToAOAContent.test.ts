import { describe, expect, it } from "vitest";

import { transformToAOAContent } from "./transformToAOAContent";

describe("transformToAOAContent rewrite-v3", () => {
  it("keeps hero price and schema price in sync from override source", () => {
    const rewrite = transformToAOAContent(
      {
        title: "Shared San Andreas Fault Jeep Tour",
        overview: "",
        highlights: [],
        duration: "3 hours",
        meetingPoint: {
          name: "Metate Ranch",
          addressLine1: "38635 Monroe St",
          city: "Indio",
          region: "CA",
          postalCode: "92203",
          country: "US",
          rawText: "Metate Ranch — 38635 Monroe St, Indio, CA 92203",
        },
        category: { primary: "Jeep tour", tags: ["geology"] },
        pricing: ["Adults: $175", "Children: $150"],
        priceAdult: 175,
        priceChild: 150,
        priceLabel: "$175 adult / $150 child",
        inclusions: [],
        exclusions: [],
        faq: [],
        galleryImages: [
          "https://cdn.filestackcontent.com/H4abOlNUQlmRczadXw7c",
          "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm",
        ],
      },
      "https://cdn.filestackcontent.com/H4abOlNUQlmRczadXw7c"
    );

    expect(rewrite.heroPriceText).toBe("$175 adult / $150 child");
    expect(rewrite.schemaPrice).toBe(175);
    expect(rewrite.category?.primary).toBe("Jeep tour");
    expect(rewrite.meetingPoint?.addressLine1).toBe("38635 Monroe St");
    expect(rewrite.durationMinutes).toBe(180);
    expect(rewrite.durationISO).toBe("PT3H");
    expect(rewrite.image2).toBe(
      "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm"
    );
    expect(rewrite.image2).not.toBe(rewrite.heroImage);
    expect(rewrite.pricing).toMatchObject({
      currency: "USD",
      low: 150,
      high: 175,
      isAggregate: true,
    });
  });
});
