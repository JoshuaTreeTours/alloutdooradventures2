import {
  getGuidePlaceClassification,
  type GuidePlaceClassification,
} from "./guidePlaceClassification";
import { getNationalParkGuideClassification } from "./nationalParkGuideClassifications";

export type { GuidePlaceClassification } from "./guidePlaceClassification";

export const resolveGuidePlaceClassification = (
  stateSlug: string,
  citySlug: string,
  displayName?: string
): GuidePlaceClassification =>
  getNationalParkGuideClassification(stateSlug, citySlug) ??
  getGuidePlaceClassification(stateSlug, citySlug, displayName);

export const isResolvedGuidePlaceClassificationVerified = (
  stateSlug: string,
  citySlug: string,
  displayName?: string
) => resolveGuidePlaceClassification(stateSlug, citySlug, displayName).verified;
