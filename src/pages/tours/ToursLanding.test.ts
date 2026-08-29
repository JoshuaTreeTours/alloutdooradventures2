import { describe, expect, it } from "vitest";

import { getToursByCityUnified, tours } from "../../data/tours";
import { getEngine2MexicoTours } from "../../engine2/data/loadEngine2";
import type { Engine6LiveProductFields } from "../../engine6/liveProductFields";
import {
  hydrateEngine6ListingEntries,
  resolveInternationalCitySelectionRoute,
} from "./ToursLanding";
import {
  buildInternationalCityOptions,
  buildInternationalCountryOptions,
} from "./internationalSelectorData";

describe("ToursLanding Engine6 filtered listing hydration", () => {
  it("hydrates /tours?state=california&city=joshua-tree card fields from live Engine6 data", () => {
    const entries = getToursByCityUnified("california", "joshua-tree");
    const target = entries.find(entry => entry.tour.productCode === "6740P7");
    expect(target).toBeDefined();

    const liveFieldsByProductCode: Record<string, Engine6LiveProductFields> = {
      "6740P7": {
        priceAmount: 127.2,
        priceFormatted: "From $127.20",
        aggregateRating: 4.7,
        reviewCount: 565,
        durationText: "6 hours",
        meetingPointText: null,
      },
    };

    const hydrated = hydrateEngine6ListingEntries(
      entries,
      liveFieldsByProductCode
    );
    const hydratedTarget = hydrated.find(
      entry => entry.tour.productCode === "6740P7"
    );
    expect(hydratedTarget).toBeDefined();

    expect(hydratedTarget?.tour.badges.priceFrom).toBe("From $127.20");
    expect(hydratedTarget?.tour.badges.rating).toBe(4.7);
    expect(hydratedTarget?.tour.badges.reviewCount).toBe(565);
    expect(hydratedTarget?.tour.badges.duration).toBe("6 hours");
    expect(hydratedTarget?.tour.productCode).toBe(target?.tour.productCode);
    expect(hydratedTarget?.href).toBe(target?.href);
    expect(hydratedTarget?.tour.primaryImageUrl).toBe(
      target?.tour.primaryImageUrl
    );
    expect(hydratedTarget?.tour.heroImage).toBe(target?.tour.heroImage);
  });
});

describe("ToursLanding activity selector routing", () => {
  it("routes Activity → State → City selections to crawlable activity discovery pages", async () => {
    const { resolveActivitySelectorRoute } = await import("./ToursLanding");

    expect(resolveActivitySelectorRoute({ activitySlug: "cycling" })).toBe(
      "/tours/cycling"
    );
    expect(
      resolveActivitySelectorRoute({
        activitySlug: "cycling",
        stateSlug: "california",
      })
    ).toBe("/tours/cycling/california");
    expect(
      resolveActivitySelectorRoute({
        activitySlug: "cycling",
        stateSlug: "california",
        citySlug: "santa-barbara",
      })
    ).toBe("/tours/cycling/california/santa-barbara");
  });

  it("keeps existing /tours state/city query selection working", async () => {
    const { resolveToursLandingInitialSelection } =
      await import("./ToursLanding");

    expect(
      resolveToursLandingInitialSelection(
        "?state=california&city=santa-barbara"
      )
    ).toEqual({
      stateSlug: "california",
      citySlug: "santa-barbara",
      type: "tours",
    });
  });
});

describe("ToursLanding international inventory selector", () => {
  it("lists low-inventory international cities from active tour inventory", () => {
    const germanyCities = buildInternationalCityOptions({
      selectedCountry: "Germany",
      selectedCanadaProvinceSlug: "",
      internationalTours: tours,
      canadaProvinces: [],
      mexicoTours: [],
    });
    const citySlugs = germanyCities.map(city => city.slug);

    expect(citySlugs).toContain("kirchzarten");
    expect(citySlugs).toContain("berlin");
    expect(citySlugs).toContain("munich");
  });

  it("routes low-inventory international city selections to destination inventory, not guides", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Germany",
        citySlug: "kirchzarten",
      })
    ).toBe("/destinations/europe/germany/cities/kirchzarten/tours");
  });

  it("preserves an originating activity filter in international city inventory routes", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Germany",
        citySlug: "kirchzarten",
        activitySlug: "cycling",
      })
    ).toBe(
      "/destinations/europe/germany/cities/kirchzarten/tours?activity=cycling"
    );
  });

  it("adds Scotland alphabetically to the International Locations country dropdown", () => {
    const countries = buildInternationalCountryOptions(tours, []);
    const scotlandIndex = countries.indexOf("Scotland");
    const unitedKingdomIndex = countries.indexOf("United Kingdom");

    expect(scotlandIndex).toBeGreaterThan(-1);
    expect(unitedKingdomIndex).toBeGreaterThan(-1);
    expect(scotlandIndex).toBeLessThan(unitedKingdomIndex);
    expect(countries).toEqual([...countries].sort((a, b) => a.localeCompare(b)));
  });

  it("shows Edinburgh when Scotland is selected and keeps London under United Kingdom", () => {
    const scotlandCities = buildInternationalCityOptions({
      selectedCountry: "Scotland",
      selectedCanadaProvinceSlug: "",
      internationalTours: tours,
      canadaProvinces: [],
      mexicoTours: [],
    });
    const unitedKingdomCities = buildInternationalCityOptions({
      selectedCountry: "United Kingdom",
      selectedCanadaProvinceSlug: "",
      internationalTours: tours,
      canadaProvinces: [],
      mexicoTours: [],
    });

    expect(scotlandCities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Edinburgh", slug: "edinburgh" }),
      ])
    );
    expect(unitedKingdomCities.map(city => city.slug)).toContain("london");
  });

  it("routes Scotland → Edinburgh to the canonical destination path", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Scotland",
        citySlug: "edinburgh",
      })
    ).toBe("/destinations/scotland/edinburgh/");
  });
});

describe("Mexico City destination-selector normalization", () => {
  it("exposes one Mexico City destination and no competing Ciudad De México entry", () => {
    const mexicoTours = getEngine2MexicoTours();
    const mexicoCities = buildInternationalCityOptions({
      selectedCountry: "Mexico",
      selectedCanadaProvinceSlug: "",
      internationalTours: tours,
      canadaProvinces: [],
      mexicoTours,
    });

    const mexicoCityEntries = mexicoCities.filter(
      city =>
        city.slug === "mexico-city" ||
        city.slug === "ciudad-de-mexico" ||
        /ciudad de m[eé]xico/i.test(city.name) ||
        /mexico city/i.test(city.name)
    );

    expect(mexicoCityEntries).toHaveLength(1);
    expect(mexicoCityEntries[0]).toEqual({
      name: "Mexico City",
      slug: "mexico-city",
    });
    expect(mexicoCities.map(city => city.name)).not.toContain(
      "Ciudad De México"
    );
    expect(mexicoCities.map(city => city.slug)).not.toContain(
      "ciudad-de-mexico"
    );
  });

  it("routes Mexico → Mexico City to the canonical destination path", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Mexico",
        citySlug: "mexico-city",
      })
    ).toBe("/destinations/mexico/mexico-city/tours");
  });

  it("keeps the old Ciudad De México slug backward-compatible via alias routing", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Mexico",
        citySlug: "ciudad-de-mexico",
      })
    ).toBe("/destinations/mexico/ciudad-de-mexico/tours");
  });
});
