import { describe, expect, it } from "vitest";

import { transformToAOAContent } from "./transformToAOAContent";

describe("transformToAOAContent rewrite-v3", () => {
  it("keeps hero price and schema price in sync from override source", () => {
    const rewrite = transformToAOAContent({
      title: "Shared San Andreas Fault Jeep Tour",
      heroImage: "https://cdn.example.com/hero.jpg",
      galleryImages: [
        "https://cdn.example.com/hero.jpg",
        "https://cdn.example.com/second.jpg",
      ],
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
    });

    expect(rewrite.heroImage).toBe("https://cdn.example.com/hero.jpg");
    expect(rewrite.image2).toBe("https://cdn.example.com/second.jpg");
    expect(rewrite.heroPriceText).toBe("$175 adult / $150 child");
    expect(rewrite.schemaPrice).toBe(175);
    expect(rewrite.category?.primary).toBe("Jeep tour");
    expect(rewrite.meetingPoint?.addressLine1).toBe("38635 Monroe St");
    expect(rewrite.durationMinutes).toBe(180);
    expect(rewrite.durationISO).toBe("PT3H");
    expect(rewrite.pricing).toMatchObject({
      currency: "USD",
      low: 150,
      high: 175,
      isAggregate: true,
    });
  });
});
