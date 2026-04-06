import { engine6ResolvedTours, getEngine6NativeTourByCanonicalPath } from "../src/engine6/registry";
import { resolveEngine6ProductCodeForPath } from "../src/engine6/routes";

const previewUrl = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;

if (!previewUrl) {
  throw new Error(
    "Preview URL was not generated (expected VERCEL_BRANCH_URL or VERCEL_URL)."
  );
}

if (engine6ResolvedTours.length === 0) {
  throw new Error("Engine6 preview validation failed: no resolved tours.");
}

const unreachableRoutes = engine6ResolvedTours
  .map(tour => {
    const expectedProductCode = resolveEngine6ProductCodeForPath(tour.canonicalPath);
    const resolvedTour = getEngine6NativeTourByCanonicalPath(tour.canonicalPath);

    if (expectedProductCode !== tour.productCode || !resolvedTour) {
      return `${tour.canonicalPath} (expected ${tour.productCode}, got ${expectedProductCode ?? "null"})`;
    }

    return null;
  })
  .filter((value): value is string => Boolean(value));

if (unreachableRoutes.length > 0) {
  throw new Error(
    `Engine6 preview route reachability failed:\n${unreachableRoutes.join("\n")}`
  );
}

console.log(
  `Engine6 preview route verification passed for ${engine6ResolvedTours.length} tours on ${previewUrl}`
);
