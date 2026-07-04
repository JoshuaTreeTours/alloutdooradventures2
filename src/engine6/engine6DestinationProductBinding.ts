import { parseEngine6StateCityFromCanonicalPath } from "./displayHero.js";
import { assessEngine6ProductCodeExclusivity } from "./engine6ProductCodeExclusivityGovernance.js";
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

const DIRECTIONAL_DESTINATION_PREFIX_TOKENS = new Set([
  "east",
  "lower",
  "north",
  "south",
  "upper",
  "west",
]);

const destinationIdentityTokens = (value: string) =>
  normalizeEngine6DestinationIdentity(value).split(" ").filter(Boolean);

const stripLeadingDirectionalDestinationTokens = (tokens: readonly string[]) => {
  let index = 0;

  while (
    index < tokens.length - 1 &&
    DIRECTIONAL_DESTINATION_PREFIX_TOKENS.has(tokens[index])
  ) {
    index += 1;
  }

  return tokens.slice(index);
};

const destinationIdentityTokensMatchAsPrefix = (
  leftTokens: readonly string[],
  rightTokens: readonly string[]
) => {
  const [prefixTokens, fullTokens] =
    leftTokens.length <= rightTokens.length
      ? [leftTokens, rightTokens]
      : [rightTokens, leftTokens];

  if (prefixTokens.length === 0) {
    return false;
  }

  return prefixTokens.every((token, index) => fullTokens[index] === token);
};

const destinationIdentityTokenSetsReferToSameEngine6Destination = (
  leftTokens: readonly string[],
  rightTokens: readonly string[]
) => {
  if (destinationIdentityTokensMatchAsPrefix(leftTokens, rightTokens)) {
    return true;
  }

  const leftWithoutDirection = stripLeadingDirectionalDestinationTokens(leftTokens);
  const rightWithoutDirection =
    stripLeadingDirectionalDestinationTokens(rightTokens);

  return (
    destinationIdentityTokensMatchAsPrefix(
      leftWithoutDirection,
      rightWithoutDirection
    ) ||
    destinationIdentityTokensMatchAsPrefix(leftTokens, rightWithoutDirection) ||
    destinationIdentityTokensMatchAsPrefix(leftWithoutDirection, rightTokens)
  );
};

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

  return destinationIdentityTokenSetsReferToSameEngine6Destination(
    destinationIdentityTokens(left),
    destinationIdentityTokens(right)
  );
};

const collectIntendedDestinationSlugs = (args: {
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  configPathSlug?: string | null;
}) => {
  const slugs = new Set<string>();

  if (args.destinationCitySlug?.trim()) {
    slugs.add(args.destinationCitySlug.trim());
  }

  if (args.viatorDestinationSlug?.trim()) {
    slugs.add(args.viatorDestinationSlug.trim());
  }

  if (args.configPathSlug?.trim()) {
    slugs.add(args.configPathSlug.trim());
  }

  return [...slugs];
};

export const isProductBoundToSameEngine6Destination = (args: {
  boundCitySlug: string;
  destinationCitySlug?: string | null;
  viatorDestinationSlug?: string | null;
  configPathSlug?: string | null;
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
  configPathSlug?: string | null;
  destinationLabel?: string | null;
}): Engine6DestinationBindingAssessment => {
  const viatorDestinationSlug = extractViatorTourDestinationSlug(args.sourceUrl);
  const exclusivity = assessEngine6ProductCodeExclusivity({
    productCode: args.productCode,
    destinationCitySlug: args.destinationCitySlug,
    viatorDestinationSlug: args.viatorDestinationSlug,
    configPathSlug: args.configPathSlug,
    destinationLabel: args.destinationLabel,
  });
  const boundCitySlug =
    exclusivity.existingOwner?.destinationCitySlug ??
    resolveEngine6ConfiguredProductCitySlug(args.productCode);
  const expectedViatorSlug =
    args.viatorDestinationSlug?.trim() || args.destinationCitySlug?.trim() || null;

  if (!exclusivity.accepted && exclusivity.violation) {
    return {
      violation: exclusivity.violation,
      detail:
        exclusivity.detail ??
        `product ${args.productCode} is already configured for Engine6 destination city "${boundCitySlug}"`,
      viatorDestinationSlug,
      boundCitySlug,
    };
  }

  if (
    !exclusivity.allowlisted &&
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
