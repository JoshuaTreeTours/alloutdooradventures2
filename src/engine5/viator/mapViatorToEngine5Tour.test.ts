import { describe, expect, it } from "vitest";

import { engine5ViatorApiFallbackByProductCode, engine5ViatorTours } from "../data/viatorTours";
import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";

describe("mapViatorToEngine5Tour", () => {
  const record = engine5ViatorTours[0]!;
  const apiTour = engine5ViatorApiFallbackByProductCode[record.productCode]!;

  it("maps API facts into the Engine5 tour model", () => {
    const vm = mapViatorToEngine5Tour({ record, apiTour });

    expect(vm.title).toBe("Rock Scrambling Adventures in Joshua Tree National Park");
    expect(vm.facts.priceFrom).toBe("$199.00");
    expect(vm.facts.duration).toBe("6 hours");
    expect(vm.facts.meetingPoint).toContain("Palm Springs");
    expect(vm.content.highlights.length).toBeGreaterThan(0);
  });

  it("prefers source-page/source-code TACDN image as primaryImage", () => {
    const vm = mapViatorToEngine5Tour({ record, apiTour });

    expect(vm.primaryImage).toBe(apiTour.sourceDerivedImageUrl);
    expect(vm.imageSource).toBe("source-code");
  });

  it("does not allow API media image to override primaryImage", () => {
    const vm = mapViatorToEngine5Tour({
      record,
      apiTour: {
        ...apiTour,
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/42/api-gallery.jpg?w=1100&h=800&s=1",
      },
    });

    expect(vm.primaryImage).toBe(apiTour.sourceDerivedImageUrl);
    expect(vm.primaryImage).not.toBe(apiTour.primaryImageUrl);
  });

  it("blocks destination/home style fallback leakage when product image exists", () => {
    const vm = mapViatorToEngine5Tour({
      record,
      apiTour,
      lastResortDestinationImage:
        "https://dynamic-media.tacdn.com/orion/images/globalNav/fallback-top-activities.webp",
    });

    expect(vm.primaryImage).toBe(apiTour.sourceDerivedImageUrl);
    expect(vm.imageSource).not.toBe("destination-home-last-resort");
  });
});
