import { describe, expect, it } from "vitest";

import {
  FEATURED_BEST_SELLING_TOUR_ROUTES,
  FEATURED_BEST_SELLING_TOURS,
} from "./Home";

const expectedProductCodes = [
  "3272GCSR2",
  "199627P1",
  "123783P1",
  "151830P1",
  "132218P140",
  "89173P8",
  "6740P7",
  "6004HIKE",
  "424860P1",
];

describe("homepage featured best-selling tours", () => {
  it("uses the requested Engine6 Viator tours in carousel order", () => {
    expect(FEATURED_BEST_SELLING_TOURS).toHaveLength(9);
    expect(FEATURED_BEST_SELLING_TOURS.map(entry => entry.href)).toEqual([
      ...FEATURED_BEST_SELLING_TOUR_ROUTES,
    ]);
    expect(
      FEATURED_BEST_SELLING_TOURS.map(entry => entry.tour.productCode)
    ).toEqual(expectedProductCodes);
    expect(FEATURED_BEST_SELLING_TOURS.map(entry => entry.tour.engine)).toEqual(
      Array(9).fill("engine6")
    );
    expect(
      FEATURED_BEST_SELLING_TOURS.every(
        entry =>
          entry.tour.bookingProvider === "viator" &&
          Boolean(entry.tour.heroImage) &&
          typeof entry.tour.startingPrice === "number" &&
          typeof entry.tour.badges.rating === "number" &&
          typeof entry.tour.badges.reviewCount === "number"
      )
    ).toBe(true);
  });
});
