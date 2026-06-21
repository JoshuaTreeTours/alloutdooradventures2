import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { isEngine6ProseItineraryTitle } from "../../api/engine6/divergedItineraryTitle";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import specimen411138p3Payload from "../../data/engine6/viator/411138P3.exact-product.json";
import specimen53474p8Payload from "../../data/engine6/viator/53474P8.exact-product.json";
import specimen57834p1Payload from "../../data/engine6/viator/57834P1.exact-product.json";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";
import type { Engine6ApiResponse } from "./types";

const EXPECTED_411138P3_REVIEWED_TITLES = [
  "Downtown Anchorage",
  "Beluga Point",
  "Alaska Wildlife Conservation Center",
  "Turnagain Arm",
  "Girdwood",
  "Explorer Glacier",
  "Byron Glacier Trail",
  "Chugach State Park",
  "Potter Marsh Bird Sanctuary",
] as const;

const DIVERGED_FL_AK_PRODUCT_CODES = [
  "411138P3",
  "383300P6",
  "76145P2",
  "89173P10",
  "231628P7",
  "8836P2",
  "10150P16",
  "214880P12",
  "402171P1",
  "408277P4",
  "5503P21",
  "342209P4",
] as const;

type LiveFixtureRow = {
  title: string;
  titleSource?: Engine6LiveItineraryItem["titleSource"];
  description?: string;
};

const LIVE_FIXTURES: Record<
  (typeof DIVERGED_FL_AK_PRODUCT_CODES)[number],
  LiveFixtureRow[]
> = {
  "411138P3": [
    {
      title: "Downtown Anchorage",
      titleSource: "description-inferred",
      description: "Pickup in Anchorage.",
    },
    {
      title: "Beluga point is just south of Anchorage on the Turnagain Arm",
      titleSource: "description-inferred",
    },
    {
      title:
        "After Beluga Point, we stop at the Alaska Wildlife Conservation Center",
      titleSource: "description-inferred",
    },
    { title: "Turnagain Arm", titleSource: "description-inferred" },
    { title: "Girdwood", titleSource: "product-override" },
    {
      title:
        "Explorer Glacier Seasonally we can see the scenic glacial ponds of Explorer Glacier",
      titleSource: "description-inferred",
    },
    {
      title: "Seasonal Self-Guided walk to the foot of the stunning Byron Glacier",
      titleSource: "description-inferred",
    },
    {
      title:
        "Enjoy selective viewpoints and stops to experience and photograph eagles, mountain goats, whales and beautiful scenery",
      titleSource: "description-inferred",
    },
    {
      title: "Home to 130 bird species",
      titleSource: "description-inferred",
    },
  ],
  "383300P6": [
    {
      title: "We set off to one of the older parts of Fort Lauderdale",
      titleSource: "description-inferred",
    },
    {
      title:
        "We then loop back to the world-famous Las Olas Boulevard lined with boutiques, restaurants, cafes, and bars",
      titleSource: "description-inferred",
    },
    {
      title:
        "We pass by the oldest home in Fort Lauderdale and the old trading post of the Stranahan Family on the river",
      titleSource: "description-inferred",
    },
    {
      title:
        'We gently bike along the 2 miles of the world-famous red brick road taking in the "Venice of the Americas"',
      titleSource: "description-inferred",
    },
    {
      title:
        "Riders get to loop back and capture a great snap on Andrews Bridge heading over to the historic Downtowner",
      titleSource: "description-inferred",
    },
    {
      title:
        "We then enter one of the most established and sort after neighborhoods",
      titleSource: "description-inferred",
    },
    {
      title:
        "We take the quiet roads past some of the world's largest boat storages onto 17th Street lookout point over the port",
      titleSource: "description-inferred",
    },
    {
      title:
        "We then cruise along with the wind blowing in our hair on onto the world-famous 5 miles of palm tree-covered white sands",
      titleSource: "description-inferred",
    },
    {
      title:
        "From here we head back along Las Olas Boulevard, past Mansions, Mega Yachts, and more",
      titleSource: "description-inferred",
    },
  ],
  "76145P2": [
    { title: "Everglades Launch Area", titleSource: "product-override" },
  ],
  "89173P10": [
    {
      title:
        "Kayakers will take a tour out through Wilton Manors to the beautiful hidden mangroves that only the locals know!",
      titleSource: "description-inferred",
    },
  ],
  "231628P7": [
    {
      title:
        "Check in, Safety briefing and depart from Miami Executive Airport, the gateway to a smooth and scenic aerial adventure",
      titleSource: "description-inferred",
    },
    {
      title:
        "Discover the charm of Coconut Grove's shoreline, where lush greenery meets the calm waters of Biscayne Bay",
      titleSource: "description-inferred",
    },
    {
      title:
        "Admire the elegance of Coral Gables from above, with its tree-lined streets and Mediterranean architecture",
      titleSource: "description-inferred",
    },
    {
      title:
        "Soar over Brickell Key and take in breathtaking views of Downtown Miami from a distance",
      titleSource: "description-inferred",
    },
    {
      title:
        "Named after one of the most captivating shorelines on the Spanish coast, Vizcaya Museum & Gardens captures jaw-dropping European extravagance",
      titleSource: "description-inferred",
    },
    { title: "Tahiti Beach", titleSource: "description-inferred" },
    { title: "Biscayne Bay", titleSource: "description-inferred" },
    { title: "Landing at the airport", titleSource: "description-inferred" },
  ],
  "8836P2": [
    {
      title:
        "Nestled in downtown Miami, Bayside Marketplace is the perfect launch point for the Miami Pirate Boat Tour",
      titleSource: "description-inferred",
    },
    {
      title:
        "The best Sightseeing Boat Tour of Miami, we have the only pirate ship in South Florida",
      titleSource: "description-inferred",
    },
    { title: "Departure Pier", titleSource: "product-override" },
    {
      title:
        "Glide past the stunning Venetian Islands, a group of six man-made islands in Biscayne Bay",
      titleSource: "description-inferred",
    },
    {
      title:
        "As we sail through Biscayne Bay, let's talk about one of the most famous destinations in the world-Miami Beach",
      titleSource: "description-inferred",
    },
    {
      title:
        "As you pass by Downtown Miami, prepare to be dazzled by more than just its stunning sunsets",
      titleSource: "description-inferred",
    },
    {
      title:
        "The first theme restaurant chain with music memorabilia decor and a full service menu",
      titleSource: "description-inferred",
    },
    {
      title:
        "As our adventure comes to an end, we arrive at the vibrant Pier 5, located in the heart of Bayside Marketplace",
      titleSource: "description-inferred",
    },
  ],
  "10150P16": [
    {
      title:
        "Biscayne Bay Scenic Cruise - 1 hour | Depart from Venetian Marina and cruise through Biscayne Bay",
      titleSource: "description-inferred",
    },
    {
      title:
        "Sandspur Island (Raccoon Island) - 1 hour 15 minutes | Arrive at the famous Raccoon Island",
      titleSource: "description-inferred",
    },
    {
      title:
        "Guests will cruise to the Haulover Sandbar, located just by the inlet and a short distance from Sandspur Island",
      titleSource: "description-inferred",
    },
    {
      title:
        'Indian Creek Island ("Billionaire Bunker") - pass by | Cruise past the ultra-exclusive homes of Indian Creek Island',
      titleSource: "description-inferred",
    },
    {
      title:
        "Biscayne Bay Scenic Return Cruise - 1 hour 15 minutes | Enjoy a relaxing cruise back across Biscayne Bay",
      titleSource: "description-inferred",
    },
  ],
  "214880P12": [
    { title: "Miami Bus & Boat Combo", titleSource: "explicit" },
    { title: "Coastal Cultural Stops", titleSource: "product-override" },
    {
      title:
        "Biscayne Bay Cruise & Millionaire's Row: Enjoy a scenic boat ride past luxurious mansions and celebrity homes",
      titleSource: "description-inferred",
    },
    { title: "Everglades Adventure", titleSource: "explicit" },
    {
      title:
        "Airboat Ride: Glide across the Everglades marshes on a thrilling airboat ride with expert captains",
      titleSource: "description-inferred",
    },
    { title: "Key West Day Trip", titleSource: "explicit" },
    {
      title:
        "Overseas Highway Journey: Travel across the scenic Florida Keys, with breathtaking ocean views along the way",
      titleSource: "description-inferred",
    },
    {
      title:
        "Key West Exploration (No Snorkeling): Enjoy free time to wander Duval Street, visit landmarks, or relax at the beach",
      titleSource: "description-inferred",
    },
    {
      title: "Return shuttle from Key West to Miami",
      titleSource: "description-inferred",
    },
  ],
  "402171P1": [
    { title: "Miami Excursion | Everglades", titleSource: "explicit" },
    {
      title: "Dive into the heart of the Everglades with this private tour",
      titleSource: "description-inferred",
    },
    { title: "Miami Excursion | City", titleSource: "explicit" },
    {
      title:
        "The Miami city tour is the ideal way to discover Miami's vibrant neighborhoods and beautiful landmarks",
      titleSource: "description-inferred",
    },
  ],
  "408277P4": [
    {
      title:
        "Driving the ATV, you will see beautiful natural landscapes of Miami",
      titleSource: "description-inferred",
    },
  ],
  "5503P21": [
    {
      title: "SPEED BOAT/ BOAT TOUR | This",
      titleSource: "description-inferred",
    },
  ],
  "342209P4": [
    {
      title: "Famous Sandspur Island otherwise known as Raccoon Island",
      titleSource: "description-inferred",
    },
  ],
};

const fixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/engine6/viator"
);

const loadNativeItinerary = (productCode: string) => {
  const fixture = JSON.parse(
    readFileSync(path.join(fixtureDir, `${productCode}.exact-product.json`), "utf8")
  ) as Record<string, unknown>;
  const extraction = extractEngine6Product(fixture);
  const payload: Engine6ApiResponse = {
    source: "bundled-fallback",
    rawProductCode: productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "diverged-fl-ak-title-report-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };

  return mapViatorToEngine6Tour(payload).itinerary;
};

const toNativeTourFromFixture = (fixture: Record<string, unknown>) => {
  const extraction = extractEngine6Product(fixture);
  const productCode =
    typeof extraction.product?.productCode === "string"
      ? extraction.product.productCode
      : "UNKNOWN";

  const payload: Engine6ApiResponse = {
    source: "bundled-fallback",
    rawProductCode: productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "diverged-fl-ak-title-report-test",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };

  return mapViatorToEngine6Tour(payload);
};

describe("diverged Florida/Alaska title authority expansion", () => {
  it("keeps 411138P3 on the reviewed public JSON-LD list", () => {
    const native = loadNativeItinerary("411138P3");
    const live = LIVE_FIXTURES["411138P3"] as Engine6LiveItineraryItem[];

    expect(getEngine6ItineraryMergeMode(native, live)).toBe("diverged");
    expect(
      mergeEngine6NativeItineraryWithLive(native, live, {
        productCode: "411138P3",
      }).map(item => item.title)
    ).toEqual([...EXPECTED_411138P3_REVIEWED_TITLES]);
  });

  it("improves concise titles for high-confidence diverged cohort products", () => {
    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("10150P16"),
        LIVE_FIXTURES["10150P16"] as Engine6LiveItineraryItem[],
        { productCode: "10150P16" }
      ).map(item => item.title)
    ).toEqual([
      "Biscayne Bay Scenic Cruise",
      "Sandspur Island (Raccoon Island)",
      "Haulover Sandbar",
      "Indian Creek Island",
      "Biscayne Bay Scenic Return Cruise",
    ]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("214880P12"),
        LIVE_FIXTURES["214880P12"] as Engine6LiveItineraryItem[],
        { productCode: "214880P12" }
      ).map(item => item.title)
    ).toEqual([
      "Miami Bus & Boat Combo",
      "Coastal Cultural Stops",
      "Biscayne Bay Cruise & Millionaire's Row",
      "Everglades Adventure",
      "Airboat Ride",
      "Key West Day Trip",
      "Overseas Highway Journey",
      "Key West Exploration (No Snorkeling)",
      "Return shuttle from Key West to Miami",
    ]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("231628P7"),
        LIVE_FIXTURES["231628P7"] as Engine6LiveItineraryItem[],
        { productCode: "231628P7" }
      ).map(item => item.title)
    ).toEqual([
      "Miami Executive Airport",
      "Coconut Grove",
      "Coral Gables",
      "Brickell Key",
      "Vizcaya Museum & Gardens",
      "Tahiti Beach",
      "Biscayne Bay",
      "Landing at the airport",
    ]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("8836P2"),
        LIVE_FIXTURES["8836P2"] as Engine6LiveItineraryItem[],
        { productCode: "8836P2" }
      ).map(item => item.title)
    ).toEqual([
      "Bayside Marketplace",
      "The best Sightseeing Boat Tour of Miami, we have the only pirate ship in South Florida and everyone can come to enjoy it",
      "Departure Pier",
      "Venetian Islands",
      "Miami Beach",
      "Downtown Miami",
      "The first theme restaurant chain with music memorabilia decor and a full service menu; signature souvenir items",
      "Pier 5",
    ]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("76145P2"),
        LIVE_FIXTURES["76145P2"] as Engine6LiveItineraryItem[],
        { productCode: "76145P2" }
      ).map(item => item.title)
    ).toEqual(["Everglades Launch Area"]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("342209P4"),
        LIVE_FIXTURES["342209P4"] as Engine6LiveItineraryItem[],
        { productCode: "342209P4" }
      ).map(item => item.title)
    ).toEqual(["Sandspur Island (Raccoon Island)"]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("5503P21"),
        LIVE_FIXTURES["5503P21"] as Engine6LiveItineraryItem[],
        { productCode: "5503P21" }
      ).map(item => item.title)
    ).toEqual(["SPEED BOAT/ BOAT TOUR"]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("89173P10"),
        LIVE_FIXTURES["89173P10"] as Engine6LiveItineraryItem[],
        { productCode: "89173P10" }
      ).map(item => item.title)
    ).toEqual(["Wilton Manors"]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("402171P1"),
        LIVE_FIXTURES["402171P1"] as Engine6LiveItineraryItem[],
        { productCode: "402171P1" }
      ).map(item => item.title)
    ).toEqual([
      "Miami Excursion",
      "Dive into the heart of the Everglades with this private tour",
      "Miami Excursion",
      "The Miami city tour is the ideal way to discover Miami's vibrant neighborhoods and beautiful landmarks",
    ]);

    expect(
      mergeEngine6NativeItineraryWithLive(
        loadNativeItinerary("383300P6"),
        LIVE_FIXTURES["383300P6"] as Engine6LiveItineraryItem[],
        { productCode: "383300P6" }
      ).map(item => item.title)
    ).toEqual([
      "We set off to one of the older parts of Fort Lauderdale",
      "Las Olas Boulevard",
      "We pass by the oldest home in Fort Lauderdale and the old trading post of the Stranahan Family on the river",
      'We gently bike along the 2 miles of the world-famous red brick road taking in the "Venice of the Americas"',
      "Riders get to loop back and capture a great snap on Andrews Bridge heading over to the historic Downtowner",
      "We then enter one of the most established and sort after neighborhoods",
      "We take the quiet roads past some of the world's largest boat storages onto 17th Street lookout point over the port",
      "We then cruise along with the wind blowing in our hair on onto the world-famous 5 miles of palm tree-covered white sands",
      "Las Olas Boulevard",
    ]);
  });

  it("documents remaining prose-heavy rows that still need reviewed manual lists", () => {
    const stillNeedsManualList = DIVERGED_FL_AK_PRODUCT_CODES.flatMap(
      productCode => {
        if (productCode === "411138P3") {
          return [];
        }

        const merged = mergeEngine6NativeItineraryWithLive(
          loadNativeItinerary(productCode),
          LIVE_FIXTURES[productCode] as Engine6LiveItineraryItem[],
          { productCode }
        );

        return merged
          .map((item, index) => ({
            productCode,
            index,
            title: item.title,
          }))
          .filter(entry => isEngine6ProseItineraryTitle(entry.title))
          .map(entry => `${entry.productCode}[${entry.index}]`);
      }
    );

    expect(stillNeedsManualList.sort()).toEqual(
      [
        "383300P6[0]",
        "383300P6[2]",
        "383300P6[3]",
        "383300P6[4]",
        "383300P6[5]",
        "383300P6[6]",
        "383300P6[7]",
        "402171P1[1]",
        "402171P1[3]",
        "408277P4[0]",
        "8836P2[1]",
        "8836P2[6]",
        "214880P12[8]",
        "231628P7[7]",
      ].sort()
    );
  });

  it("keeps aligned Florida products unchanged", () => {
    const native53474 = toNativeTourFromFixture(
      specimen53474p8Payload as Record<string, unknown>
    );
    const live53474 = native53474.itinerary.map((item, index) => ({
      ...item,
      title:
        [
          "Campbell Creek Trail",
          "Chester Creek Trail",
          "Westchester Lagoon",
          "Earthquake Park",
          "Jutting out into Cook Inlet on the western tip of Anchorage, Kincaid Park is one of the largest in the city",
          "Point Woronzof overlook",
          "The Tony Knowles Coastal Trail follows the shore of Cook Inlet",
        ][index] ?? item.title,
      titleSource:
        index <= 3 ? ("product-override" as const) : ("description-inferred" as const),
    }));

    expect(
      mergeEngine6NativeItineraryWithLive(
        native53474.itinerary,
        live53474,
        { productCode: "53474P8" }
      ).map(item => item.title)
    ).toEqual([
      "Campbell Creek Greenbelt",
      "Chester Creek Greenbelt",
      "Westchester Lagoon",
      "Earthquake Park",
      "Kincaid Park",
      "Point Woronzof",
      "Tony Knowles Coastal Trail",
    ]);

    const native57834 = toNativeTourFromFixture(
      specimen57834p1Payload as Record<string, unknown>
    );
    const native57834Titles = native57834.itinerary.map(item => item.title);
    const live57834 = native57834.itinerary.map((item, index) => ({
      ...item,
      title: `Fully narrated cruise prose for stop ${index + 1}`,
      titleSource: "description-inferred" as const,
    }));

    expect(
      mergeEngine6NativeItineraryWithLive(
        native57834.itinerary,
        live57834,
        { productCode: "57834P1" }
      ).map(item => item.title)
    ).toEqual(native57834Titles);

    const native276551 = toNativeTourFromFixture(
      specimen276551p2Payload as Record<string, unknown>
    );
    const live276551 = native276551.itinerary.map((item, index) => ({
      ...item,
      title:
        index === 4 ? "One of the oldest bars in the US" : "Supplier prose title",
      titleSource: "description-inferred" as const,
    }));

    expect(
      mergeEngine6NativeItineraryWithLive(
        native276551.itinerary,
        live276551,
        { productCode: "276551P2" }
      ).map(item => item.title)
    ).toEqual(native276551.itinerary.map(item => item.title));
  });
});
