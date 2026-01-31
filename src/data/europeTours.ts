import type { Tour } from "./tours.types";

import { europeCyclingTours } from "./generated/europe-cycling.generated";
import { europeHikingTours } from "./generated/europe-hiking.generated";
import { europeCanoeingTours } from "./generated/europe-canoeing.generated";

export const europeTours: Tour[] = [
  ...europeCyclingTours,
  ...europeHikingTours,
  ...europeCanoeingTours,
];
