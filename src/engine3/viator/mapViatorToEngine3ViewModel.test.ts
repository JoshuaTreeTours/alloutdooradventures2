import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const HERO_URL_6740P7 =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/7a/caption.jpg?w=1200&h=800&s=1";

const baseTour: Engine2Tour = {
  id: "6740P7",
  engine: "engine3",
  bookingProvider: "viator",
  bookingUrl:
    "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-backroads-hummer-h2-tour-6740p7",
  name: "Joshua Tree Backroads Hummer H2 Tour",
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
    title: "Joshua Tree Backroads Hummer H2 Tour",
    description: "",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-backroads-hummer-h2-tour-6740p7",
    ogImage: "",
  },
  content: {
    experienceText: "",
    highlights: ["Scenic desert views"],
    duration: "3 hours",
  },
  images: {
    hero: "https://cdn.filestackcontent.com/legacy-placeholder",
    gallery: [],
  },
  booking: {
    bookingUrl:
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
  },
};

describe("mapViatorToEngine3ViewModel", () => {
  it("maps 6740P7 with canonical title and hero from 6740P7 media", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree Backroads Hummer H2 Tour",
      imageCandidates: [
        HERO_URL_6740P7,
        "https://dynamic-media.tacdn.com/media/photo-o/2f/4f/17/91/caption.jpg?w=1200&h=800&s=1",
      ],
      supplierImage: HERO_URL_6740P7,
      duration: "3 hours",
      highlights: [
        "Drive through desert washes",
        "Stop at Joshua Tree viewpoints",
        "Learn geology with a guide",
      ],
      included: ["Professional guide", "Bottled water"],
    });

    expect(viewModel.title).toContain("Joshua Tree Backroads Hummer H2 Tour");
    expect(viewModel.primaryImageUrl).toBe(HERO_URL_6740P7);
    expect(viewModel.heroImageUrl).toBe(HERO_URL_6740P7);
    expect(viewModel.primaryImageUrl).not.toBe(
      "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa"
    );
    expect(viewModel.bookingUrl).toContain("d648-6740P7");
    expect(viewModel.bookingUrl).toContain("pid=P00290915");
    expect(viewModel.bookingUrl).toContain("mcid=42383");
    expect(viewModel.bookingUrl).toContain("medium=link");
  });

  it("uses 6740P7 meeting-point override only when source meeting data is missing", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree Backroads Hummer H2 Tour",
      imageCandidates: [HERO_URL_6740P7],
      supplierImage: HERO_URL_6740P7,
    });

    expect(viewModel.meetingPointDescription).toContain("Palm Springs Art Museum");
    expect(viewModel.departureTimeText).toBe("Daily at 8:30 a.m.");
  });
});
