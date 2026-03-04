import { describe, expect, it, vi } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const baseTour: Engine2Tour = {
  id: "6740P7",
  engine: "engine3",
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/Palm-Springs/example",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-national-park-scenic-tour-6740p7",
  name: "Joshua Tree National Park Scenic Tour",
  provider: {
    name: "Desert Adventures",
    shortName: "desert-adventures",
  },
  geo: {
    country: "United States",
    region: "California",
    city: "Palm Springs",
    lat: 33.7,
    lng: -116.3,
  },
  seo: {
    title: "Joshua Tree National Park Scenic Tour",
    description: "",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-national-park-scenic-tour-6740p7",
    ogImage: "",
  },
  content: {
    experienceText: "",
    highlights: ["Scenic desert views"],
    duration: "5 hours",
  },
  images: {
    hero: "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://www.viator.com/tours/example",
  },
};

describe("mapViatorToEngine3ViewModel", () => {
  it("applies 6740P7 departure note only when meeting point matches Palm Springs Art Museum", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-National-Park-Scenic-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree National Park Scenic Tour",
      meetingPointText: "Palm Springs Art Museum, 101 N Museum Dr, Palm Springs, CA",
      priceFrom: "$179.00",
      priceCurrency: "USD",
      imageCandidates: [
        "https://dynamic-media.tacdn.com/media/photo-o/2a/4e/7a/da/caption.jpg?w=1200&h=800&s=1",
      ],
    });

    expect(viewModel.departureNote).toContain("8:30 a.m.");
    expect(viewModel.priceFrom).toBe("$179.00");
    expect(viewModel.primaryImageUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2a/4e/7a/da/caption.jpg?w=1200&h=800&s=1"
    );
  });

  it("suppresses 6740P7 departure override when API meeting point no longer matches", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-National-Park-Scenic-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree National Park Scenic Tour",
      meetingPointText: "Palm Desert Visitor Center",
      priceFrom: "$179.00",
      priceCurrency: "USD",
      imageCandidates: [
        "https://dynamic-media.tacdn.com/media/photo-o/2a/4e/7a/da/caption.jpg?w=1200&h=800&s=1",
      ],
    });

    expect(viewModel.departureNote).toBeUndefined();
  });

  it("uses override price when API from-price is within tolerance", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-National-Park-Scenic-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree National Park Scenic Tour",
      meetingPointText: "Palm Springs Art Museum",
      priceFrom: "$199.00",
      priceCurrency: "USD",
      imageCandidates: ["https://cdn.filestackcontent.com/jdGA0GBmQtmU0ynb8Uwm"],
    });

    expect(viewModel.priceFrom).toBe("$179.00");
    expect(viewModel.priceCurrency).toBe("USD");
  });

  it("keeps API price and warns when API from-price is outside tolerance", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-National-Park-Scenic-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree National Park Scenic Tour",
      meetingPointText: "Palm Springs Art Museum",
      priceFrom: "$260.00",
      priceCurrency: "USD",
      imageCandidates: ["https://cdn.filestackcontent.com/jdGA0GBmQtmU0ynb8Uwm"],
    });

    expect(viewModel.priceFrom).toBe("$260.00");
    expect(warnSpy).toHaveBeenCalledOnce();
    warnSpy.mockRestore();
  });
});
