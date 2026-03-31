import { describe, expect, it } from "vitest";

import {
  assertEngine6NoCanonicalSlugCollisions,
  assertEngine6RequestedPathMatchesResolvedTour,
} from "./routeIntegrity";
import { getEngine6NativeTourByCanonicalPath, engine6ResolvedTours } from "./registry";
import {
  ENGINE6_SAN_DIEGO_BALBOA_ART_PRODUCT_CODE,
  ENGINE6_SAN_DIEGO_BALBOA_ART_ROUTE,
  ENGINE6_NYC_PEDICAB_PRODUCT_CODE,
  ENGINE6_NYC_PEDICAB_ROUTE,
  ENGINE6_SAN_DIEGO_JOSHUA_TREE_PRODUCT_CODE,
  ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE,
  ENGINE6_SPECIMEN_PRODUCT_CODE,
  ENGINE6_SPECIMEN_ROUTE,
  resolveEngine6ProductCodeForPath,
} from "./routes";

describe("engine6 route integrity enforcement", () => {
  it("test 1: New York pedicab URL resolves only to the pedicab product", () => {
    expect(resolveEngine6ProductCodeForPath(ENGINE6_NYC_PEDICAB_ROUTE)).toBe(
      ENGINE6_NYC_PEDICAB_PRODUCT_CODE
    );

    const tour = getEngine6NativeTourByCanonicalPath(ENGINE6_NYC_PEDICAB_ROUTE);
    expect(tour?.productCode).toBe(ENGINE6_NYC_PEDICAB_PRODUCT_CODE);
    expect(tour?.canonicalPath).toBe(ENGINE6_NYC_PEDICAB_ROUTE);
  });

  it("test 2: Santa Barbara vineyard URL resolves only to the vineyard product", () => {
    expect(resolveEngine6ProductCodeForPath(ENGINE6_SPECIMEN_ROUTE)).toBe(
      ENGINE6_SPECIMEN_PRODUCT_CODE
    );

    const tour = getEngine6NativeTourByCanonicalPath(ENGINE6_SPECIMEN_ROUTE);
    expect(tour?.productCode).toBe(ENGINE6_SPECIMEN_PRODUCT_CODE);
    expect(tour?.canonicalPath).toBe(ENGINE6_SPECIMEN_ROUTE);
  });

  it("test 3: San Diego sample URL resolves correctly", () => {
    expect(resolveEngine6ProductCodeForPath(ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE)).toBe(
      ENGINE6_SAN_DIEGO_JOSHUA_TREE_PRODUCT_CODE
    );

    const tour = getEngine6NativeTourByCanonicalPath(
      ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE
    );
    expect(tour?.productCode).toBe(ENGINE6_SAN_DIEGO_JOSHUA_TREE_PRODUCT_CODE);
    expect(tour?.canonicalPath).toBe(ENGINE6_SAN_DIEGO_JOSHUA_TREE_ROUTE);
  });

  it("test 3b: Balboa Park canonical URL resolves to 5356P12", () => {
    expect(resolveEngine6ProductCodeForPath(ENGINE6_SAN_DIEGO_BALBOA_ART_ROUTE)).toBe(
      ENGINE6_SAN_DIEGO_BALBOA_ART_PRODUCT_CODE
    );

    const tour = getEngine6NativeTourByCanonicalPath(
      ENGINE6_SAN_DIEGO_BALBOA_ART_ROUTE
    );
    expect(tour?.productCode).toBe(ENGINE6_SAN_DIEGO_BALBOA_ART_PRODUCT_CODE);
    expect(tour?.canonicalPath).toBe(ENGINE6_SAN_DIEGO_BALBOA_ART_ROUTE);
    expect(tour?.bookingUrl).toBe(`${ENGINE6_SAN_DIEGO_BALBOA_ART_ROUTE}/book`);
  });

  it("test 4: mismatch detection throws for intentional bad mapping", () => {
    const tour = getEngine6NativeTourByCanonicalPath(ENGINE6_NYC_PEDICAB_ROUTE);
    expect(tour).toBeDefined();

    expect(() =>
      assertEngine6RequestedPathMatchesResolvedTour({
        requestedPath: ENGINE6_SPECIMEN_ROUTE,
        resolvedTour: tour!,
      })
    ).toThrow(/route integrity mismatch/i);
  });

  it("fails closed for unknown canonical route lookups", () => {
    expect(resolveEngine6ProductCodeForPath("/destinations/new-york/new-york/tours/not-real")).toBeNull();
    expect(
      getEngine6NativeTourByCanonicalPath(
        "/destinations/new-york/new-york/tours/not-real"
      )
    ).toBeNull();
  });

  it("asserts there are no canonical slug collisions across products", () => {
    expect(() => assertEngine6NoCanonicalSlugCollisions(engine6ResolvedTours)).not.toThrow();

    const [firstTour] = engine6ResolvedTours;
    expect(firstTour).toBeDefined();

    expect(() =>
      assertEngine6NoCanonicalSlugCollisions([
        firstTour!,
        {
          ...firstTour!,
          productCode: "DIFFERENT_PRODUCT",
        },
      ])
    ).toThrow(/canonical slug collision/i);
  });
});
