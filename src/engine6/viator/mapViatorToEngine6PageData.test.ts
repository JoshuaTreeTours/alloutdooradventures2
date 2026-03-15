import { describe, expect, it } from "vitest";

import { mapViatorToEngine6PageData } from "./mapViatorToEngine6PageData";
import { engine6HiloVolcanoRecord } from "./records";

describe("mapViatorToEngine6PageData", () => {
  it("maps required Viator product fields for price/itinerary/duration/meeting point", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        product: {
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          description: {
            text: "Explore active volcanic landscapes with a private guide.",
          },
          pricingSummary: {
            fromPrice: {
              amount: 200,
              currency: "USD",
              formatted: "$200.00",
            },
          },
          itinerary: {
            items: [
              {
                title: "Hawaii Volcanoes National Park",
                description: "Walk overlooks and steam vents",
                durationText: "3 hours",
              },
            ],
          },
          duration: {
            fixedDurationInMinutes: 480,
          },
          logistics: {
            startLocation: {
              name: "Hilo Port",
              fullAddress: "Hilo Port, Hilo, Hawaii",
            },
          },
          highlights: ["Crater viewpoints", "Private transport"],
          inclusions: ["Guide", "Transportation"],
          exclusions: ["Lunch"],
          cancellationPolicy: "Free cancellation up to 24 hours in advance",
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

    expect(page.fromPrice).toBe(200);
    expect(page.currency).toBe("USD");
    expect(page.durationText).toBe("8 hours");
    expect(page.meetingPointFull).toBe("Hilo Port, Hilo, Hawaii");
    expect(page.itinerary).toHaveLength(1);
    expect(page.highlights).toContain("Crater viewpoints");
    expect(page.inclusions).toContain("Guide");
    expect(page.exclusions).toContain("Lunch");
    expect(page.cancellationText).toBe(
      "Free cancellation up to 24 hours in advance"
    );
  });

  it("never renders a zero price", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        product: {
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          pricingSummary: {
            fromPrice: {
              amount: 0,
              currency: "USD",
              formatted: "$0.00",
            },
          },
        },
      },
    });

    expect(page.fromPrice).toBeUndefined();
    expect(page.fromPriceText).toBeUndefined();
  });

  it("derives FAQs when raw faqs array is missing", () => {
    const page = mapViatorToEngine6PageData({
      record: engine6HiloVolcanoRecord,
      payload: {
        product: {
          title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
          pricingSummary: {
            fromPrice: {
              amount: 200,
              currency: "USD",
            },
          },
          duration: {
            fixedDurationInMinutes: 480,
          },
          logistics: {
            startLocation: {
              fullAddress: "Hilo Port, Hilo, Hawaii",
            },
          },
          cancellationPolicy: "Free cancellation up to 24 hours in advance",
          inclusions: ["Guide"],
          exclusions: ["Lunch"],
          additionalInfo: ["Wear closed-toe shoes"],
        },
      },
    });

    expect(page.faqs.map(item => item.question)).toContain(
      "What is the cancellation policy?"
    );
    expect(page.faqs.length).toBeGreaterThanOrEqual(4);
  });
});
