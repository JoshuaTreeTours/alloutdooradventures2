import { buildEngine3TourPath } from "../routing/buildEngine3TourPath";
import type { Engine3Tour } from "../types";

export const viatorTours: readonly Engine3Tour[] = [
  {
    engine: "engine3",
    bookingProvider: "viator",
    viator: {
      productCode: "2335P1",
      url: "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "palm-springs",
    },
    slug: "san-andreas-fault-jeep-tour-from-palm-springs",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    viator: {
      productCode: "3351P15",
      url: "https://www.viator.com/tours/Palm-Springs/Palm-Springs-Indian-Canyons-Bike-and-Hike/d648-3351P15",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "palm-springs",
    },
    slug: "palm-springs-indian-canyons-bike-and-hike",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    viator: {
      productCode: "6740JTREE",
      url: "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
      heroImageOverrideUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "palm-springs",
    },
    slug: "joshua-tree-hummer-adventure-from-palm-desert",
  },
] as const;

export const viatorTourPaths = viatorTours.map(buildEngine3TourPath);
