import { describe, expect, it } from "vitest";

import { isEngine6ProseItineraryTitle } from "../../api/engine6/divergedItineraryTitle";
import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import specimen3454ye3dPayload from "../../data/engine6/viator/3454YE3D.exact-product.json";
import {
  ENGINE6_ANTELOPE_ROUTE,
  ENGINE6_EMERALD_CAVE_ROUTE,
  ENGINE6_LAS_VEGAS_HELICOPTER_NIGHT_VIP_PRODUCT_CODE,
  ENGINE6_LAS_VEGAS_RED_ROCK_ROCKY_GAP_PRODUCT_CODE,
  ENGINE6_PARAGON_ROUTE,
} from "./routes";
import { engine6ResolvedTours } from "./registry";
import {
  getEngine6ItineraryMergeMode,
  mergeEngine6NativeItineraryWithLive,
  type Engine6LiveItineraryItem,
} from "./mergeEngine6LiveItinerary";

const buildLiveItinerary = (
  descriptions: string[]
): Engine6LiveItineraryItem[] =>
  descriptions.map(description => ({
    title:
      description.split(/(?<=[.!?])\s+/)[0]?.replace(/[.!?]+$/, "").trim() ??
      description,
    titleSource: "description-inferred" as const,
    description,
  }));

describe("Engine6 surgical itinerary title cleanup", () => {
  it("3454YE3D diverged merge uses reviewed overrides instead of supplier prose", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "3454YE3D");
    expect(tour).toBeDefined();

    const liveExtraction = extractEngine6Product(specimen3454ye3dPayload);
    const liveItinerary = liveExtraction.extracted.itinerary.map(item => ({
      ...item,
      titleSource: item.titleSource ?? ("description-inferred" as const),
    }));

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      {
        productCode: "3454YE3D",
        rawProduct: liveExtraction.product as Record<string, unknown> | null,
      }
    );

    expect(merged[1]?.title).toBe("Bay Bridge crossing");
    expect(merged[5]?.title).toBe("Yosemite Village free time");
    expect(merged[13]?.title).toBe("El Capitan Meadow");
    expect(
      merged.some(item => isEngine6ProseItineraryTitle(item.title))
    ).toBe(false);
  });

  it("414460P1 diverged merge replaces screenshot-observed Central Park prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "414460P1");
    expect(tour).toBeDefined();

    const liveTitles = [
      "Winter time (Ice skating) Summer time (Pickle Ball) from the Movies: Home Alone 2, Limitless, Serendipity",
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses",
      "24 game tables shaded by wooden trellis which was built in 1952 to offer visitors of all ages a space to play games",
      "The Dairy",
      "Statues of Shakespeare,Robert Burns & other writers dot this wide promenade shaded by elm trees",
      "Balto was a lead sled dog that delivered medicine to save children from diphtheria in 1925 in Alaska",
    ];
    const liveItinerary = buildLiveItinerary(liveTitles);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "414460P1" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Wollman Rink",
      "Central Park Carousel",
      "Chess & Checkers House",
      "The Dairy",
      "Literary Walk",
      "Balto Statue",
    ]);
    expect(
      merged.some(item => isEngine6ProseItineraryTitle(item.title))
    ).toBe(false);
  });

  it("3156P13 diverged merge replaces screenshot-observed electric bike prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "3156P13");
    expect(tour).toBeDefined();

    const liveItinerary = buildLiveItinerary([
      "Once we make sure you are comfortable on your electric bike, we'll ride to Chinatown, Washington Square Park, the Hudson Greenway, and more!",
      "Explore Central Park, learn about the history and take photos!",
      "See the new vessel",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "3156P13" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "City Hall & Civic Center",
      "Central Park",
      "The Vessel",
    ]);
  });

  it("5614063P8 diverged merge replaces screenshot-observed Washington DC prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "5614063P8");
    expect(tour).toBeDefined();

    const liveItinerary = buildLiveItinerary([
      "Our tour begins when you leave Manhattan with a Spanish-speaking guide who will tell you all the curious details you will see, we will pass through the state of New Jersey, Delaware and Maryland to reach our destination, Virginia and Washington DC",
      "When we meet in Delaware we will stop for breakfast, use toilets and stretch our legs",
      "Then we will head to the state of Virginia to border the Pentagon US Intelligence Center",
      "Our first stop will be Arlington National Cemetery, where we will visit the graves of former President John F",
    ]);

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "5614063P8" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Departure from New York",
      "Delaware Rest Stop",
      "Pentagon",
      "Arlington National Cemetery",
    ]);
  });

  it("3857PHI diverged merge replaces screenshot-observed Philadelphia and Amish prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "3857PHI");
    expect(tour).toBeDefined();

    const liveItinerary = buildLiveItinerary([
      "Depart New York through New Jersey and Pennsylvania for the \"City of Brotherly Love\"-Philadelphia",
      "Arriving in the historical center of Philadelphia, visit the famous Liberty Bell, one of the symbols of freedom in America, as well as Constitution Square and Congress Hall",
      "Stroll Elfreth's Alley, the oldest continuously inhabited street in America",
    ]);

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "3857PHI" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Departure from New York",
      "Liberty Bell",
      "Elfreth's Alley",
    ]);
  });

  it("5119P13 diverged merge replaces live Grand Canyon West prose on the extra stop row", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "5119P13");
    expect(tour?.canonicalPath).toBe(ENGINE6_PARAGON_ROUTE);

    const liveItinerary = buildLiveItinerary([
      "Your full-day guided Grand Canyon West Tour includes an unforgettable Hoover Dam photo stop.",
      "Your adventure continues as you journey through the stunning high desert of Northern Arizona.",
      "At Eagle Point, keep an eye out for the eagle in the rock and explore the Native American village.",
      "Guano Point",
      "At Grand Canyon West, you'll be treated to stunning views of the mighty Colorado River winding through the canyon floor.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "5119P13" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Hoover Dam",
      "Grand Canyon West",
      "Eagle Point and Guano Point",
      "Guano Point",
      "Grand Canyon West",
    ]);
    expect(
      merged.some(item => isEngine6ProseItineraryTitle(item.title))
    ).toBe(false);
  });

  it("5516ST5 diverged merge replaces live helicopter night-flight prose headings", () => {
    const tour = engine6ResolvedTours.find(
      t => t.productCode === ENGINE6_LAS_VEGAS_HELICOPTER_NIGHT_VIP_PRODUCT_CODE
    );
    expect(tour).toBeDefined();

    const liveItinerary = buildLiveItinerary([
      "As your helicopter lifts off, the world-famous Las Vegas Strip unfolds beneath you in a dazzling display of lights, architecture and energy.",
      "Soaring above the skyline, the High Roller stands as one of the most recognizable landmarks in Las Vegas.",
      "Nothing prepares you for the sight of Sphere from above.",
      "Sphere and LINQ District overview from above.",
      "Allegiant Stadium flyover on the return route.",
      "From above, the Bellagio fountains become a mesmerizing work of art, with graceful water displays set against the elegance of the Las Vegas Strip.",
      "Return to the terminal after your flight.",
      "As your flight begins its return toward the heliport, the unmistakable pyramid of Luxor comes into view.",
      "Upgrade your experience with a traditional Brazilian churrascaria dinner at Pampas Brazilian Grille before your helicopter flight.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: ENGINE6_LAS_VEGAS_HELICOPTER_NIGHT_VIP_PRODUCT_CODE }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Las Vegas Strip",
      "High Roller",
      "Sphere",
      "Sphere and LINQ District",
      "Allegiant Stadium Flyover",
      "Bellagio Fountains",
      "Terminal Return",
      "Luxor",
      "Pampas Brazilian Grille",
    ]);
  });

  it("3533P14 diverged merge replaces live Red Rock Canyon prose headings", () => {
    const tour = engine6ResolvedTours.find(
      t => t.productCode === ENGINE6_LAS_VEGAS_RED_ROCK_ROCKY_GAP_PRODUCT_CODE
    );
    expect(tour).toBeDefined();

    const liveItinerary = buildLiveItinerary([
      "Drive from the LV Strip to Red Rock Canyon in an open-air jeep.",
      "Enter the Red Rock Canyon scenic loop for desert overlooks.",
      "Home to an impressive array of plants and wildlife, The Spring Mountains' rich biodiversity thrives thanks to nearby springs that give the mountains their name.",
      "The kaleidoscopic colors of Calico Hills are next.",
      "Make your way up Rocky Gap Road by open-air Jeep wrangler.",
      "Stop by Willow Springs after your off-roading adventure to see the roasting pit and pictographs from the past.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: ENGINE6_LAS_VEGAS_RED_ROCK_ROCKY_GAP_PRODUCT_CODE }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Red Rock Canyon",
      "Scenic Loop Entry",
      "Spring Mountains",
      "Calico Hills",
      "Rocky Gap Road",
      "Willow Springs",
    ]);
  });

  it("60136P1 diverged merge replaces live Antelope Canyon day-tour prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "60136P1");
    expect(tour?.canonicalPath).toBe(ENGINE6_ANTELOPE_ROUTE);

    const liveItinerary = buildLiveItinerary([
      "Drive through the Virgin River Gorge, a dramatic and beautiful canyon carved by the rushing river waters in Northwestern Arizona.",
      "Pass through the town of Kanab, known as Utah's little Hollywood due to being the setting for many Western movies and centrally located to access many national parks and sites.",
      "See views of Glen Canyon Dam and Lake Powell, the 2nd largest man-made lake in the US.",
      "Enjoy views of the 181 mile long Lake Powell, that covers parts of Arizona and Utah, created by the Glen Canyon Dam on the Colorado River.",
      "Enjoy views of colorful rock formation and 80 mile views across the largest National Monument in the United States.",
      "Enjoy views of the Colorado River in Glen Canyon's Horseshoe Bend, with a 1.5 mile round-trip easy hike.",
      "Antelope Canyon's sculpted sandstone walls offer memorable photo opportunities with a walkable corridor at the bottom of the canyon floor.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "60136P1" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Virgin River Gorge",
      "Kanab",
      "Glen Canyon Dam & Lake Powell",
      "Lake Powell",
      "Grand Staircase-Escalante",
      "Horseshoe Bend",
      "Antelope Canyon",
    ]);
  });

  it("26719P8 diverged merge replaces live Emerald Cove kayaking prose headings", () => {
    const tour = engine6ResolvedTours.find(t => t.productCode === "26719P8");
    expect(tour?.canonicalPath).toBe(ENGINE6_EMERALD_CAVE_ROUTE);

    const liveItinerary = buildLiveItinerary([
      "Begin your kayak adventure at Willow Beach Marina, where you'll paddle the clear waters downstream.",
      "Immerse yourself in the breathtaking scenery of Black Canyon as you kayak along the emerald waters.",
      "Discover the magic of Emerald Cove, a breathtaking grotto where sunlight transforms the water into a vibrant emerald green.",
    ]);

    expect(getEngine6ItineraryMergeMode(tour!.itinerary, liveItinerary)).toBe(
      "diverged"
    );

    const merged = mergeEngine6NativeItineraryWithLive(
      tour!.itinerary,
      liveItinerary,
      { productCode: "26719P8" }
    );

    expect(merged.map(item => item.title)).toEqual([
      "Willow Beach Marina",
      "Black Canyon",
      "Emerald Cove",
    ]);
  });
});
