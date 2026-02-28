import { buildEngine3TourPath } from "../routing/buildEngine3TourPath";
import type { Engine3Tour } from "../types";

const devOnlySecondTourEnabled =
  typeof process !== "undefined" &&
  process.env.ENABLE_ENGINE3_DEV_TOUR === "true";

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
      productCode: "6740JTREE",
      url: "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
    },
    destination: {
      country: "usa",
      state: "california",
      city: "palm-springs",
    },
    slug: "joshua-tree-hummer-adventure-from-palm-desert",
  },
  ...(devOnlySecondTourEnabled
    ? [
        {
          engine: "engine3",
          bookingProvider: "viator",
          viator: {
            productCode: "6488P7",
            url: "https://www.viator.com/tours/Palm-Springs/Indian-Canyons-Walking-Tour/d648-6488P7",
          },
          destination: {
            country: "usa",
            state: "california",
            city: "palm-springs",
          },
          slug: "indian-canyons-walking-tour",
        } satisfies Engine3Tour,
      ]
    : []),
] as const;

export const viatorTourPaths = viatorTours.map(buildEngine3TourPath);
