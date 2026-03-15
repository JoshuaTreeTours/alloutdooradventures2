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
});
