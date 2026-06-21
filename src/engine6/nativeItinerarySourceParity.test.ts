import { describe, expect, it } from "vitest";
import { isEngine6LiveItineraryMergeSuppressed } from "./mapViatorToEngine6Tour";
import { engine6ResolvedTours } from "./registry";
import specimen3780superPayload from "../../data/engine6/viator/3780SUPER.exact-product.json";

const source3780SuperRows = [
  {
    title: "Cafe Beignet departure",
    description:
      "Meet outside Cafe Beignet in the JAX Brewery Building on Decatur Street for check-in and the start of the day.",
  },
  {
    title: "French Quarter walking tour",
    description:
      "Walk through the historic French Quarter with guide-led context on New Orleans culture, architecture, and early city history.",
  },
  {
    title: "Jackson Square",
    description:
      "Pass Jackson Square while moving through the French Quarter portion of the sightseeing route.",
  },
  {
    title: "French Market lunch break",
    description:
      "Pause at the French Market for independent lunch time before continuing the combined sightseeing experience.",
  },
  {
    title: "Riverboat CITY of NEW ORLEANS cruise",
    description:
      "Board the Riverboat CITY of NEW ORLEANS for a 75-minute Mississippi River sightseeing cruise with captain narration.",
  },
  {
    title: "New Orleans city highlights bus tour",
    description:
      "Continue by narrated coach through city highlight areas including the Garden District, St. Charles Avenue, and above-ground cemetery scenery.",
  },
  {
    title: "Audubon Aquarium",
    description:
      "Pass Audubon Aquarium along the downtown riverfront during the city highlights sequence.",
  },
  {
    title: "City Park",
    description:
      "Pass New Orleans City Park as the coach route introduces broader city neighborhoods beyond the French Quarter.",
  },
  {
    title: "Garden District",
    description:
      "Travel through the Garden District for views of historic homes and neighborhood streets from the coach route.",
  },
  {
    title: "The National WWII Museum",
    description:
      "Pass the National WWII Museum during the narrated city highlights portion of the tour.",
  },
] as const;

describe("Engine6 native itinerary source parity", () => {
  it("uses bundled/native row descriptions for 3780SUPER without shifting adjacent stops", () => {
    const rawProduct = specimen3780superPayload.product;
    expect(
      rawProduct.itineraryItems.map(item => ({
        title: item.title,
        description: item.description,
      }))
    ).toEqual(source3780SuperRows);

    const tour = engine6ResolvedTours.find(
      item => item.productCode === "3780SUPER"
    );
    expect(tour?.itinerary).toHaveLength(source3780SuperRows.length);

    source3780SuperRows.forEach((sourceRow, index) => {
      const renderedRow = tour?.itinerary[index];
      expect(renderedRow?.title).toBe(sourceRow.title);
      expect(renderedRow?.description).toBe(sourceRow.description);
    });
  });

  it("keeps 415653P2 on native generated descriptions because source JSON has no row descriptions", () => {
    const tour = engine6ResolvedTours.find(
      item => item.productCode === "415653P2"
    );
    expect(tour?.itinerary).toHaveLength(11);
    expect(tour?.itinerary[2]?.title).toBe("Tunnel View");
    expect(tour?.itinerary[2]?.description).toBe(
      "Visit Tunnel View during the 15 minutes stop."
    );
    expect(tour?.itinerary[3]?.title).toBe("Bridalveil Fall");
    expect(tour?.itinerary[3]?.description).toBe(
      "Visit Bridalveil Fall during the 30 minutes stop."
    );
    expect(tour?.itinerary[4]?.title).toBe("Swinging Bridge Picnic Area");
    expect(tour?.itinerary[4]?.description).toBe(
      "Visit Swinging Bridge Picnic Area during the 15 minutes stop."
    );
  });

  it("suppresses live itinerary merging for rows that must use bundled/native parity", () => {
    expect(isEngine6LiveItineraryMergeSuppressed("415653P2")).toBe(true);
    expect(isEngine6LiveItineraryMergeSuppressed("3780SUPER")).toBe(true);
  });
});
