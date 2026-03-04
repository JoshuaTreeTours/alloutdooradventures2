import { buildEngine3TourPath } from "../buildEngine3TourPath";
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
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
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
