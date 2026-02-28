import { describe, expect, it } from "vitest";

import { buildEngine3ViatorSchemaGraph } from "./buildEngine3ViatorSchemaGraph";
import type { Engine3TourViewModel } from "../types";

const baseTour: Engine3TourViewModel = {
  tourId: "abc123",
  title: "Sunset Jeep Adventure",
  country: "usa",
  city: "palm-springs",
  region: "california",
  canonicalPath:
    "/destinations/california/palm-springs/tours/sunset-jeep-adventure-abc123",
  bookingUrl: "https://www.viator.com/tours/example",
};

describe("buildEngine3ViatorSchemaGraph", () => {
  it("builds minimal graph with Offer and TouristTrip but no FAQ or itinerary", () => {
    const graph = buildEngine3ViatorSchemaGraph(
      baseTour,
      baseTour.canonicalPath
    );
    const nodes = graph["@graph"] as Record<string, unknown>[];

    const offer = nodes.find(node => node["@type"] === "Offer");
    expect(offer?.["@id"]).toBe(`${baseTour.canonicalPath}#offer`);

    const trip = nodes.find(node => node["@type"] === "TouristTrip");
    expect((trip?.offers as Record<string, unknown>)["@id"]).toBe(
      `${baseTour.canonicalPath}#offer`
    );
    expect(trip?.itinerary).toBeUndefined();

    const faq = nodes.find(node => node["@type"] === "FAQPage");
    expect(faq).toBeUndefined();
  });

  it("emits FAQPage with normalized de-duplicated questions", () => {
    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        faqs: [
          {
            question: " What should I bring? ",
            answer: "Water and sunscreen.",
          },
          {
            question: "what should i bring?",
            answer: "This duplicate is ignored.",
          },
          { question: "Is this kid friendly?", answer: "Yes." },
        ],
      },
      baseTour.canonicalPath
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const faq = nodes.find(node => node["@type"] === "FAQPage") as Record<
      string,
      unknown
    >;

    expect(faq).toBeTruthy();
    const mainEntity = faq.mainEntity as Array<Record<string, unknown>>;
    expect(mainEntity).toHaveLength(2);
    expect(mainEntity[0].name).toBe("What should I bring?");
  });

  it("emits itinerary in TouristTrip with ordered items", () => {
    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        itinerary: [
          { title: "Stop B", order: 2, duration: "30 minutes" },
          { title: "Stop A", order: 1, description: "First stop" },
        ],
      },
      baseTour.canonicalPath
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as Record<
      string,
      unknown
    >;
    const itinerary = trip.itinerary as Record<string, unknown>;
    const items = itinerary.itemListElement as Array<Record<string, unknown>>;

    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Stop A");
    expect(items[0].position).toBe(1);
    expect(items[1].name).toBe("Stop B");
    expect(items[1].position).toBe(2);
  });
});
