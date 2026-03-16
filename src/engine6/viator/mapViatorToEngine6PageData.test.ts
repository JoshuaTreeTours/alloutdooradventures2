import { describe, expect, it } from "vitest";

import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";

describe("mapViatorToEngine6PageData", () => {
  it("extracts price from deployed payload path pricing.summary.fromPriceFormatted", () => {
    const mapped = mapViatorToEngine6PageData({
      title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
      shortDescription: "Overview",
      productUrl: "https://www.viator.com/tours/Hilo/example/d669-11069P1",
      pricing: {
        summary: {
          fromPriceFormatted: "$255.00",
        },
      },
      rating: 4.8,
      reviewCount: 12,
      images: [
        {
          isCover: true,
          variants: [
            {
              url: "https://dynamic-media.tacdn.com/media/photo-o/xx/yy.jpg",
              width: 1600,
              height: 900,
            },
          ],
        },
      ],
    });

    expect(mapped.page.title).toContain("Volcanoes");
    expect(mapped.page.heroImage).toContain("dynamic-media.tacdn.com");
    expect(mapped.page.facts.priceFrom).toBe("$255");
    expect(mapped.page.facts.reviewCount).toBe(12);
    expect(mapped.priceDiagnostics.selectedPath).toBe(
      "pricing.summary.fromPriceFormatted"
    );
    expect(mapped.priceDiagnostics.price).toBe(255);
    expect(mapped.priceDiagnostics.priceFormatted).toBe("$255");
  });

  it("extracts price from bookingOptions[0].price.formatted", () => {
    const mapped = mapViatorToEngine6PageData({
      title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
      shortDescription: "Overview",
      productUrl: "https://www.viator.com/tours/Hilo/example/d669-11069P1",
      bookingOptions: [
        {
          price: {
            formatted: "$249",
          },
        },
      ],
      images: [
        {
          isCover: true,
          variants: [
            {
              url: "https://dynamic-media.tacdn.com/media/photo-o/xx/yy.jpg",
              width: 1600,
              height: 900,
            },
          ],
        },
      ],
    });

    expect(mapped.page.facts.priceFrom).toBe("$249");
    expect(mapped.priceDiagnostics.selectedPath).toBe(
      "bookingOptions[0].price.formatted"
    );
    expect(mapped.priceDiagnostics.price).toBe(249);
    expect(mapped.priceDiagnostics.priceFormatted).toBe("$249");
  });
});
