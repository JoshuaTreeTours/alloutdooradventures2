import { resolveEngine6PathForProductCode } from "./routes";

import type { Engine6Tour } from "./types";

const ENGINE6_CANONICAL_ROUTE_PATTERN =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/;

export const parseEngine6CanonicalPath = (canonicalPath: string) => {
  const match = ENGINE6_CANONICAL_ROUTE_PATTERN.exec(canonicalPath);
  if (!match) {
    return null;
  }

  const [, stateSlug = "", citySlug = "", tourSlug = ""] = match;
  return { stateSlug, citySlug, tourSlug };
};

export const buildEngine6ParentCityToursPath = (canonicalPath: string) => {
  const parsed = parseEngine6CanonicalPath(canonicalPath);
  if (!parsed) {
    return null;
  }

  return `/destinations/${parsed.stateSlug}/${parsed.citySlug}/tours`;
};

export const assertEngine6RequestedPathMatchesResolvedTour = ({
  requestedPath,
  resolvedTour,
}: {
  requestedPath: string;
  resolvedTour: Engine6Tour;
}) => {
  if (requestedPath !== resolvedTour.canonicalPath) {
    throw new Error(
      `Engine6 route integrity mismatch: requestedPath=${requestedPath} resolvedCanonicalPath=${resolvedTour.canonicalPath} productCode=${resolvedTour.productCode}`
    );
  }
};

export const assertEngine6NoCanonicalSlugCollisions = (tours: Engine6Tour[]) => {
  const productCodeBySlug = new Map<string, string>();

  for (const tour of tours) {
    const parsed = parseEngine6CanonicalPath(tour.canonicalPath);
    if (!parsed) {
      continue;
    }

    const existingProductCode = productCodeBySlug.get(parsed.tourSlug);
    if (existingProductCode && existingProductCode !== tour.productCode) {
      throw new Error(
        `Engine6 canonical slug collision: slug=${parsed.tourSlug} products=${existingProductCode},${tour.productCode}`
      );
    }

    productCodeBySlug.set(parsed.tourSlug, tour.productCode);
  }
};

export const validateEngine6CanonicalRouteIntegrity = (tour: Engine6Tour) => {
  const violations: string[] = [];
  if (tour.canonicalPath.includes("/united-states/")) {
    violations.push(
      "canonical path leaked to non-canonical /destinations/united-states/... route"
    );
  }
  const parsedCanonicalPath = parseEngine6CanonicalPath(tour.canonicalPath);

  if (!parsedCanonicalPath) {
    violations.push("canonical path must use /destinations/{state}/{city}/tours/{slug}");
    return { violations, parentCityToursPath: null };
  }

  const canonicalPathForProduct = resolveEngine6PathForProductCode(
    tour.productCode
  );

  if (canonicalPathForProduct && canonicalPathForProduct !== tour.canonicalPath) {
    violations.push(
      "product is wired to non-canonical alternate path despite explicit canonical route"
    );
  }

  if (tour.pagePath !== tour.canonicalPath) {
    violations.push("pagePath diverged from canonical path");
  }

  return {
    violations,
    parentCityToursPath: buildEngine6ParentCityToursPath(tour.canonicalPath),
  };
};
