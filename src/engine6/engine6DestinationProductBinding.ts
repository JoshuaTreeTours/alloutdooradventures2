import { parseEngine6StateCityFromCanonicalPath } from "./displayHero.js";
import { resolveEngine6PathForProductCode } from "./routes.js";

export const extractViatorTourDestinationSlug = (sourceUrl: string) => {
  const match = sourceUrl.trim().match(/\/tours\/([^/]+)\//i);
  return match?.[1]?.trim() ?? null;
};

export const normalizeEngine6DestinationIdentity = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");

export const resolveEngine6ConfiguredProductCitySlug = (productCode: string) => {
  const canonicalPath = resolveEngine6PathForProductCode(productCode);
  if (!canonicalPath) {
    return null;
  }

  return parseEngine6StateCityFromCanonicalPath(canonicalPath).citySlug || null;
};

export const destinationIdentitiesMatch = (
  left: string | null | undefined,
  right: string | null | undefined
) => {
  if (!left?.trim() || !right?.trim()) {
    return true;
  }

  return (
    normalizeEngine6DestinationIdentity(left) ===
    normalizeEngine6DestinationIdentity(right)
  );
};

export type Engine6DestinationBindingViolation =
  | "cross-destination"
  | "duplicate-engine6-assignment";

export type Engine6DestinationBindingAssessment = {
  violation: Engine6DestinationBindingViolation | null;
  detail: string | null;
  viatorDestinationSlug: string | null;
  boundCitySlug: string | null;
};

export const assessEngine6DestinationProductBinding = (args: {
  productCode: string;
  sourceUrl: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  destinationLabel?: string | null;
}): Engine6DestinationBindingAssessment => {
  const viatorDestinationSlug = extractViatorTourDestinationSlug(args.sourceUrl);
  const boundCitySlug = resolveEngine6ConfiguredProductCitySlug(args.productCode);
  const expectedViatorSlug =
    args.viatorDestinationSlug?.trim() || args.destinationCitySlug?.trim() || null;

  if (
    boundCitySlug &&
    args.destinationCitySlug?.trim() &&
    boundCitySlug !== args.destinationCitySlug.trim() &&
    !destinationIdentitiesMatch(boundCitySlug, args.destinationCitySlug)
  ) {
    return {
      violation: "duplicate-engine6-assignment",
      detail: `product ${args.productCode} is already configured for Engine6 destination city "${boundCitySlug}"`,
      viatorDestinationSlug,
      boundCitySlug,
    };
  }

  if (
    viatorDestinationSlug &&
    expectedViatorSlug &&
    !destinationIdentitiesMatch(viatorDestinationSlug, expectedViatorSlug)
  ) {
    return {
      violation: "cross-destination",
      detail: `Viator URL destination "${viatorDestinationSlug}" does not match intended destination "${expectedViatorSlug}"`,
      viatorDestinationSlug,
      boundCitySlug,
    };
  }

  return {
    violation: null,
    detail: null,
    viatorDestinationSlug,
    boundCitySlug,
  };
};
