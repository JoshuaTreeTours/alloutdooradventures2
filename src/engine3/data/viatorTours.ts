import { buildEngine3TourPath } from "../buildEngine3TourPath";
import type { Engine3Tour } from "../types";

export const viatorTours: readonly Engine3Tour[] = [
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "sailing",
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
    category: "e-bike",
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
    category: "day-trips",
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
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "sailing",
    viator: {
      productCode: "17960P4",
      url: "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Sunset-Sail/d4372-17960P4",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "santa-barbara-sunset-sail",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "wine-tours",
    viator: {
      productCode: "347292P8",
      url: "https://www.viator.com/tours/Santa-Barbara/Santa-Ynez-Valley-Wine-Country-Shuttle/d4372-347292P8",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "santa-ynez-valley-wine-country-shuttle",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "e-bike",
    viator: {
      productCode: "21431P12",
      url: "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-E-Bike-Coastal-Ride/d4372-21431P12",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "santa-barbara-e-bike-coastal-ride",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "walking-tours",
    viator: {
      productCode: "13055P2",
      url: "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-History-and-Architecture-Walking-Tour/d4372-13055P2",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "santa-barbara-history-and-architecture-walking-tour",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "food-tours",
    viator: {
      productCode: "117795P1",
      url: "https://www.viator.com/tours/Santa-Barbara/Santa-Barbara-Downtown-Food-Tasting-Tour/d4372-117795P1",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "santa-barbara-downtown-food-tasting-tour",
  },
  {
    engine: "engine3",
    bookingProvider: "viator",
    category: "day-trips",
    viator: {
      productCode: "56236P7",
      url: "https://www.viator.com/tours/Santa-Barbara/Solvang-Day-Trip-from-Santa-Barbara/d4372-56236P7",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "santa-barbara",
    },
    slug: "solvang-day-trip-from-santa-barbara",
  },
] as const;

export const viatorTourPaths = viatorTours.map(buildEngine3TourPath);
