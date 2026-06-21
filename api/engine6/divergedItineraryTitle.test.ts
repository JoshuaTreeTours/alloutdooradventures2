import { describe, expect, it } from "vitest";

import {
  extractEngine6ConciseItineraryTitleFromProse,
  isEngine6ProseItineraryTitle,
} from "./divergedItineraryTitle";

describe("isEngine6ProseItineraryTitle", () => {
  it("treats concise POI names as non-prose", () => {
    expect(isEngine6ProseItineraryTitle("Tahiti Beach")).toBe(false);
    expect(isEngine6ProseItineraryTitle("Everglades Adventure")).toBe(false);
    expect(isEngine6ProseItineraryTitle("Indian Creek Island")).toBe(false);
  });

  it("treats supplier marketing sentences as prose", () => {
    expect(
      isEngine6ProseItineraryTitle(
        "Beluga point is just south of Anchorage on the Turnagain Arm"
      )
    ).toBe(true);
    expect(
      isEngine6ProseItineraryTitle(
        "We then loop back to the world-famous Las Olas Boulevard lined with boutiques"
      )
    ).toBe(true);
  });
});

describe("extractEngine6ConciseItineraryTitleFromProse", () => {
  it("extracts dash-delimited activity titles", () => {
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Sandspur Island (Raccoon Island) - 1 hour 15 minutes | Arrive at the famous Raccoon Island",
      })
    ).toEqual({
      title: "Sandspur Island (Raccoon Island)",
      source: "explicit",
    });
  });

  it("extracts colon-delimited activity titles", () => {
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Airboat Ride: Glide across the Everglades marshes on a thrilling airboat ride with expert captains",
      })
    ).toEqual({
      title: "Airboat Ride",
      source: "explicit",
    });
  });

  it("extracts named locations from aerial tour prose", () => {
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Discover the charm of Coconut Grove's shoreline, where lush greenery meets the calm waters of Biscayne Bay",
      })
    ).toEqual({
      title: "Coconut Grove",
      source: "explicit",
    });
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Named after one of the most captivating shorelines on the Spanish coast, Vizcaya Museum & Gardens captures jaw-dropping European extravagance",
      })
    ).toBeNull();
  });

  it("extracts marketplace and island names from Miami boat prose", () => {
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Nestled in downtown Miami, Bayside Marketplace is the perfect launch point for the Miami Pirate Boat Tour",
      })
    ).toEqual({
      title: "Bayside Marketplace",
      source: "explicit",
    });
    expect(
      extractEngine6ConciseItineraryTitleFromProse({
        title:
          "Glide past the stunning Venetian Islands, a group of six man-made islands in Biscayne Bay",
      })
    ).toEqual({
      title: "Venetian Islands",
      source: "explicit",
    });
  });
});
