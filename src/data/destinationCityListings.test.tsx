import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import DestinationLandingTemplate from "../templates/DestinationLandingTemplate";
import { getStateBySlug, states } from "./destinations";
import { getDestinationCityCards } from "./destinationCityListings";
import { getFallbackStateBySlug } from "./tourFallbacks";

const getFallbackChildCityPageSlugs = (stateSlug: string) =>
  new Set(
    (getFallbackStateBySlug(stateSlug)?.cities ?? []).map(city => city.slug)
  );

describe("destination city listings", () => {
  it("renders Avalon on the California destination index", () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: { pathname: "/destinations/california", search: "" },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;

    const california = getStateBySlug("california");
    expect(california).toBeDefined();

    const html = renderToString(
      <DestinationLandingTemplate state={california!} tours={[]} />
    );

    expect(html).toContain("Avalon");
    expect(html).toContain("/destinations/california/avalon/tours");
    expect(html).not.toContain("/cities/");

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });

  it("renders state destination city cards alphabetically by display name", () => {
    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: { pathname: "/destinations/california", search: "" },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;

    const california = getStateBySlug("california");
    expect(california).toBeDefined();

    const html = renderToString(
      <DestinationLandingTemplate state={california!} tours={[]} />
    );
    const renderedCitySlugs = Array.from(
      html.matchAll(/href="\/destinations\/california\/([^"/]+)\/tours"/g),
      match => match[1]
    );
    const expectedCityCards = getDestinationCityCards(california!);

    expect(renderedCitySlugs).toEqual(
      expectedCityCards.map(({ city }) => city.slug)
    );
    expect(expectedCityCards.map(({ city }) => city.name)).toEqual(
      [...expectedCityCards]
        .map(({ city }) => city.name)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
    );

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;
  });

  it("includes every eligible fallback child city destination with tours on its parent index", () => {
    const missingByState = states.flatMap(state => {
      const listedSlugs = new Set(
        getDestinationCityCards(state).map(({ city }) => city.slug)
      );

      return [...getFallbackChildCityPageSlugs(state.slug)]
        .filter(citySlug => !listedSlugs.has(citySlug))
        .map(citySlug => `${state.slug}/${citySlug}`);
    });

    expect(missingByState).toEqual([]);
  });

  it("deduplicates destination city links by slug", () => {
    const duplicateSlugsByState = states.flatMap(state => {
      const citySlugs = getDestinationCityCards(state).map(
        ({ city }) => city.slug
      );
      const uniqueSlugs = new Set(citySlugs);

      return citySlugs.length === uniqueSlugs.size ? [] : [state.slug];
    });

    expect(duplicateSlugsByState).toEqual([]);
  });
});
