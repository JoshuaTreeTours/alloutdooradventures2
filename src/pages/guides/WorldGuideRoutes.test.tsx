import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";

import CityGuideWorldRoute from "./CityGuideWorldRoute";
import CountryGuideRoute from "./CountryGuideRoute";
import ParisGuideRoute from "./ParisGuideRoute";

const expectRenderableGuide = (html: string, expectedText: string) => {
  expect(html).toContain(expectedText);
  expect(html).not.toContain("Guide not found");
};

describe("world guide route rendering", () => {
  it("renders the Mexico country guide route", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/mexico", () => undefined]}>
        <CountryGuideRoute params={{ countrySlug: "mexico" }} />
      </Router>
    );

    expectRenderableGuide(html, "Mexico Outdoor Adventure Guide");
  });

  it("renders major Mexico city guide routes", () => {
    const caboHtml = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/mexico/cabo-san-lucas", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "mexico", citySlug: "cabo-san-lucas" }}
        />
      </Router>
    );
    const puertoVallartaHtml = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/mexico/puerto-vallarta", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "mexico", citySlug: "puerto-vallarta" }}
        />
      </Router>
    );

    expectRenderableGuide(caboHtml, "Top 10 Things to Do in Cabo San Lucas");
    expectRenderableGuide(
      puertoVallartaHtml,
      "Top 10 Things to Do in Puerto Vallarta"
    );
  });

  it("renders the Cancun paragon with specific local POIs", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/mexico/cancun", () => undefined]}>
        <CityGuideWorldRoute
          params={{ countrySlug: "mexico", citySlug: "cancun" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Museo Maya de Cancún");
    expect(html).toContain("San Miguelito Archaeological Site");
    expect(html.toLowerCase()).not.toContain("generic checklist item");
    expect(html.toLowerCase()).not.toContain("quick way to add variety");
  });

  it("renders Paris with factual POI copy instead of the former thin cards", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/france/paris", () => undefined]}>
        <ParisGuideRoute />
      </Router>
    );

    expectRenderableGuide(html, "The Eiffel Tower was completed for the 1889");
    expect(html).toContain("Notre-Dame Cathedral and Île de la Cité");
    expect(html).toContain("Arc de Triomphe");
    expect(html).not.toContain(
      "Visit early or near sunset for broad city views, then stroll the lawns"
    );
  });
});
