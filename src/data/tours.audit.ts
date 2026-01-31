import type { Tour } from "./tours.types";
import { flagstaffTours } from "./flagstaffTours";
import { sedonaTours } from "./sedonaTours";
import { manualTours } from "./tours.manual";
import { toursGenerated } from "./tours.generated";
import { applyTourPricing } from "./tourPricing";

export const toursForAudit: Tour[] = [
  ...toursGenerated,
  ...manualTours,
  ...flagstaffTours,
  ...sedonaTours,
].map(applyTourPricing);
