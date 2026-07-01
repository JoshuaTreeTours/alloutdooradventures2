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

const destinationIdentityTokens = (value: string) =>
  normalizeEngine6DestinationIdentity(value).split(" ").filter(Boolean);

export const destinationIdentitiesReferToSameEngine6Destination = (
  left: string | null | undefined,
  right: string | null | undefined
) => {
  if (!left?.trim() || !right?.trim()) {
    return false;
  }

  if (destinationIdentitiesMatch(left, right)) {
    return true;
  }

  const leftTokens = destinationIdentityTokens(left);
  const rightTokens = destinationIdentityTokens(right);
  const [prefixTokens, fullTokens] =
    leftTokens.length <= rightTokens.length
      ? [leftTokens, rightTokens]
      : [rightTokens, leftTokens];

  if (prefixTokens.length === 0) {
    return false;
  }

  return prefixTokens.every((token, index) => fullTokens[index] === token);
};

const collectIntendedDestinationSlugs = (args: {
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
}) => {
  const slugs = new Set<string>();

  if (args.destinationCitySlug?.trim()) {
    slugs.add(args.destinationCitySlug.trim());
  }

  if (args.viatorDestinationSlug?.trim()) {
    slugs.add(args.viatorDestinationSlug.trim());
  }

  return [...slugs];
};

const isProductBoundToSameEngine6Destination = (args: {
  boundCitySlug: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
}) => {
  const intendedDestinationSlugs = collectIntendedDestinationSlugs(args);

  if (intendedDestinationSlugs.length === 0) {
    return true;
  }

  return intendedDestinationSlugs.some(slug =>
    destinationIdentitiesReferToSameEngine6Destination(args.boundCitySlug, slug)
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
    !isProductBoundToSameEngine6Destination({
      boundCitySlug,
      destinationCitySlug: args.destinationCitySlug,
      viatorDestinationSlug: args.viatorDestinationSlug,
    })
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
