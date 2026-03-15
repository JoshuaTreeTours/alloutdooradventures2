import { describe, expect, it } from "vitest";

import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";
import { engine6HiloVolcanoRecord } from "./records";

describe("mapViatorToEngine6PageData", () => {
  it("extracts pilot page fields from nested Viator payload shapes", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        product: {
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          description: {
            text: "A long field day adventure in Hilo with volcano views.",
          },
          productUrl: "https://example.com/book",
          pricingSummary: {
            fromPrice: { amount: 245, currency: "USD", formatted: "$245.00" },
          },
          rating: 4.8,
          reviewCount: 37,
          meetingPoints: [
            { name: "Hilo Harbor", fullAddress: "Hilo Harbor, Hilo, HI" },
          ],
          duration: { formatted: "8 hours" },
          cancellationPolicy: {
            description: "Free cancellation up to 24 hours in advance.",
          },
          highlights: ["Explore lava tubes", "See Kilauea caldera"],
          itinerary: {
            items: [
              {
                title: "Volcanoes National Park",
                description: "Walk crater rim",
                durationText: "3h",
              },
            ],
          },
          faqs: [
            {
              question: "Is lunch included?",
              answer: "Lunch is not included.",
            },
          ],
          inclusions: ["Guide", "Hotel pickup"],
          exclusions: ["Lunch"],
          additionalInfo: ["Wear closed-toe shoes"],
          images: [
            {
              isCover: true,
              variants: [
                {
                  url: "https://images.example.com/cover.jpg",
                  width: 1200,
                  height: 800,
                },
              ],
            },
          ],
        },
      },
    });

    expect(page.productCode).toBe("11069P1");
    expect(page.fromPrice).toBe(245);
    expect(page.meetingPointShort).toBe("Hilo Harbor");
    expect(page.durationText).toBe("8 hours");
    expect(page.itinerary).toHaveLength(1);
    expect(page.faqs).toHaveLength(1);
    expect(page.heroImage).toBe("https://images.example.com/cover.jpg");
  });

  it("extracts from Viator partner payload shape with pricingInfo and ticketTypes", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        productCode: "11069P1",
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        description:
          "Explore Volcanoes National Park with a private local guide and scenic stops.",
        pricingInfo: {
          currencyCode: "USD",
          summary: {
            fromPrice: 229,
          },
        },
        ticketInfo: {
          ticketDescription:
            "Duration: 8 hours. Meeting point: Hilo Hotel pickup available.",
        },
        ticketTypes: [
          {
            pricingInfo: {
              summary: {
                fromPrice: 249,
              },
            },
          },
        ],
        images: [
          {
            variants: [
              {
                url: "https://images.example.com/small.jpg",
                width: 640,
                height: 480,
              },
              {
                url: "https://images.example.com/large.jpg",
                width: 1920,
                height: 1080,
              },
            ],
          },
          {
            variants: [
              {
                url: "https://images.example.com/second-large.jpg",
                width: 1600,
                height: 1200,
              },
            ],
          },
        ],
      },
    });

    expect(page.title).toContain("Hawaii Volcanoes");
    expect(page.fromPrice).toBe(229);
    expect(page.currency).toBe("USD");
    expect(page.heroImage).toBe("https://images.example.com/large.jpg");
    expect(page.galleryImages).toEqual([
      "https://images.example.com/large.jpg",
      "https://images.example.com/second-large.jpg",
    ]);
    expect(page.durationText).toBe("8 hours");
    expect(page.meetingPointFull).toContain("Hilo Hotel pickup available");
  });

  it("does not emit invalid zero pricing when commercial price is unavailable", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        pricingInfo: {
          currencyCode: "USD",
          summary: {
            fromPrice: 0,
          },
        },
        ticketTypes: [
          {
            pricingInfo: {
              summary: {
                fromPrice: "0.00",
              },
            },
          },
        ],
      },
    });

    expect(page.fromPrice).toBeUndefined();
    expect(page.fromPriceText).toBeUndefined();
  });

  it("extracts itinerary from nested variant data and derives FAQs when raw FAQ array is missing", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        pricingInfo: {
          currencyCode: "USD",
          summary: { fromPrice: 200 },
        },
        meetingPoints: [{ fullAddress: "Pier 1, Hilo, HI" }],
        duration: { formatted: "6 hours" },
        cancellationPolicy: "Free cancellation up to 24 hours before start",
        inclusions: ["Guide", "Private transportation"],
        exclusions: ["Lunch"],
        additionalInfo: ["Not wheelchair accessible"],
        variants: [
          {
            itinerary: {
              dayPlans: [
                {
                  stopName: "Volcanoes National Park",
                  description: "Visit crater rim and steam vents",
                  durationText: "2 hours",
                },
                {
                  stopName: "Rainbow Falls",
                  description: "Scenic stop for photos",
                  durationText: "45 minutes",
                },
              ],
            },
          },
        ],
      },
    });

    expect(page.itinerary).toHaveLength(2);
    expect(page.itinerary[0]?.title).toBe("Volcanoes National Park");
    expect(page.faqs.length).toBeGreaterThanOrEqual(4);
    expect(page.faqs.map(item => item.question)).toContain(
      "What is the cancellation policy?"
    );
  });

  it("is tolerant when optional fields are missing", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        productCode: "11069P1",
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        images: [],
      },
    });

    expect(page.title).toBe(
      "Private Tour: Hawaii Volcanoes National Park Eco Tour"
    );
    expect(page.ratingValue).toBeUndefined();
    expect(page.reviewCount).toBeUndefined();
    expect(page.meetingPointShort).toBeUndefined();
    expect(page.durationText).toBeUndefined();
    expect(page.galleryImages).toEqual([]);
  });
});
