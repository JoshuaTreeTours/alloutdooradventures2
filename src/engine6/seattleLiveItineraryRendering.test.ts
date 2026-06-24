import { describe, expect, it } from "vitest";

import {
  ENGINE6_SEATTLE_CITY_PREMIER_ROUTE,
  isEngine6SeattleTourCanonicalPath,
} from "./routes";
import { engine6ResolvedTours } from "./registry";

describe("Seattle Engine6 live itinerary rendering", () => {
  it("identifies the Seattle City Premier route as a Seattle tour path", () => {
    expect(
      isEngine6SeattleTourCanonicalPath(ENGINE6_SEATTLE_CITY_PREMIER_ROUTE)
    ).toBe(true);
  });

  it("keeps fixture-native itinerary rows aligned for 5396P10", () => {
    const nativeTour = engine6ResolvedTours.find(
      tour => tour.productCode === "5396P10"
    );
    expect(nativeTour).toBeDefined();

    for (const item of nativeTour!.itinerary) {
      if (item.title === "Ballard Locks") {
        expect(item.description).toMatch(/locks|boats/i);
      }
      if (item.title === "Kerry Park") {
        expect(item.description).toMatch(/skyline/i);
      }
      if (item.title === "Pioneer Square") {
        expect(item.description).toMatch(/pioneer/i);
      }
    }
  });

  it("resolves all 15 Seattle product codes in the registry", () => {
    const seattleProductCodes = [
      "5396P10",
      "40943P1",
      "479383P1",
      "36129P1",
      "2956PIKEPL",
      "23161P1",
      "2956EXCLUSIVE",
      "7812P115",
      "2960HARBOR",
      "3657RAINIER",
      "5396MTR",
      "351474P1",
      "3132SMB",
      "5396BOEING",
      "8647P594",
    ];

    for (const productCode of seattleProductCodes) {
      const tour = engine6ResolvedTours.find(
        resolved => resolved.productCode === productCode
      );
      expect(tour?.canonicalPath.startsWith("/destinations/washington/seattle/tours/")).toBe(
        true
      );
    }
  });
});
