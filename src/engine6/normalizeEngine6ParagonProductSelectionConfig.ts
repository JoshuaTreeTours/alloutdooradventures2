import path from "node:path";

import { extractViatorTourDestinationSlug } from "./engine6DestinationProductBinding.js";
import type {
  Engine6DestinationBuildConfig,
  Engine6ProductSelectionSlot,
} from "./engine6ProductSelectionGovernance.js";

export type Engine6LegacyProductSelectionConfigInput = {
  destinationLabel?: string;
  destination?: string;
  label?: string;
  destinationCitySlug?: string;
  citySlug?: string;
  viatorDestinationSlug?: string;
  targetPremiumShare?: number;
  slots?: Engine6ProductSelectionSlot[];
};

const readOptionalString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export const extractProductSelectionSlugFromConfigPath = (configPath: string) => {
  const basename = path.basename(configPath);
  const dashedMatch = basename.match(/^(.+)-product-selection\.json$/i);
  if (dashedMatch?.[1]?.trim()) {
    return dashedMatch[1].trim();
  }

  const dottedMatch = basename.match(/^(.+)\.product-selection\.json$/i);
  if (dottedMatch?.[1]?.trim()) {
    return dottedMatch[1].trim();
  }

  return null;
};

export const slugToDestinationLabel = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const collectCandidateSourceUrls = (slots: Engine6ProductSelectionSlot[]) =>
  slots.flatMap(slot => slot.candidates.map(candidate => candidate.sourceUrl));

const resolveFirstViatorDestinationSlug = (slots: Engine6ProductSelectionSlot[]) => {
  for (const sourceUrl of collectCandidateSourceUrls(slots)) {
    const viatorDestinationSlug = extractViatorTourDestinationSlug(sourceUrl);
    if (viatorDestinationSlug) {
      return viatorDestinationSlug;
    }
  }

  return null;
};

export const normalizeEngine6ParagonProductSelectionConfig = (args: {
  configPath: string;
  raw: unknown;
  destinationLabelOverride?: string | null;
}): Engine6DestinationBuildConfig => {
  const record =
    args.raw && typeof args.raw === "object" && !Array.isArray(args.raw)
      ? (args.raw as Engine6LegacyProductSelectionConfigInput)
      : {};

  const slots = Array.isArray(record.slots) ? record.slots : [];

  if (slots.length === 0) {
    throw new Error(
      `Invalid Engine6 Paragon config at ${args.configPath}: expected non-empty slots array`
    );
  }

  const pathSlug = extractProductSelectionSlugFromConfigPath(args.configPath);
  const firstViatorDestinationSlug = resolveFirstViatorDestinationSlug(slots);

  const destinationLabel =
    readOptionalString(record.destinationLabel) ||
    readOptionalString(record.destination) ||
    readOptionalString(record.label) ||
    readOptionalString(args.destinationLabelOverride) ||
    (pathSlug ? slugToDestinationLabel(pathSlug) : null) ||
    (firstViatorDestinationSlug
      ? slugToDestinationLabel(firstViatorDestinationSlug)
      : null) ||
    "Engine6 Destination";

  const destinationCitySlug =
    readOptionalString(record.destinationCitySlug) ||
    readOptionalString(record.citySlug) ||
    (firstViatorDestinationSlug
      ? firstViatorDestinationSlug.toLowerCase()
      : null) ||
    (pathSlug ? pathSlug.toLowerCase() : null) ||
    undefined;

  const viatorDestinationSlug =
    readOptionalString(record.viatorDestinationSlug) ||
    firstViatorDestinationSlug ||
    undefined;

  return {
    destinationLabel,
    destinationCitySlug,
    viatorDestinationSlug,
    targetPremiumShare:
      typeof record.targetPremiumShare === "number"
        ? record.targetPremiumShare
        : undefined,
    slots,
  };
};
