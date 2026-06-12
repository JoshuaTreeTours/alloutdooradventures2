import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";

import CityGuideWorldRoute from "./CityGuideWorldRoute";
import CountryGuideRoute from "./CountryGuideRoute";

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
});
