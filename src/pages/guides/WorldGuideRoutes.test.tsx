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

  it("renders Cabo San Lucas and Puerto Vallarta through the Paragon treatment", () => {
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

    expectRenderableGuide(caboHtml, "Things to Do in Cabo San Lucas");
    expect(caboHtml).toContain("El Arco and Land&#x27;s End");
    expect(caboHtml).toContain("Sierra de la Laguna Foothills");
    expectRenderableGuide(
      puertoVallartaHtml,
      "Things to Do in Puerto Vallarta"
    );
    expect(puertoVallartaHtml).toContain("Río Cuale and Isla Cuale");
    expect(puertoVallartaHtml).toContain("Banderas Bay");
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

  it("renders the legacy Mexico City guide slug with the canonical Phase 3 profile", () => {
    const html = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/mexico/ciudad-de-mexico", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "mexico", citySlug: "ciudad-de-mexico" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Templo Mayor");
    expect(html).toContain("National Museum of Anthropology");
    expect(html).toContain("Basin of Mexico");
  });

  it("renders Cusco and Rio de Janeiro as Latin America Paragons", () => {
    const cuscoHtml = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/peru/cusco", () => undefined]}>
        <CityGuideWorldRoute params={{ countrySlug: "peru", citySlug: "cusco" }} />
      </Router>
    );
    const rioHtml = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/brazil/rio-de-janeiro", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "brazil", citySlug: "rio-de-janeiro" }}
        />
      </Router>
    );

    expectRenderableGuide(cuscoHtml, "Things to Do in Cusco");
    expect(cuscoHtml).toContain("Qorikancha and Santo Domingo");
    expect(cuscoHtml).toContain("Sacsayhuamán");
    expectRenderableGuide(rioHtml, "Things to Do in Rio de Janeiro");
    expect(rioHtml).toContain("Christ the Redeemer and Corcovado");
    expect(rioHtml).toContain("Tijuca National Park");
  });

  it("renders Berlin Phase 2 as image-backed Santa Monica-style POI cards", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/germany/berlin", () => undefined]}>
        <CityGuideWorldRoute
          params={{ countrySlug: "germany", citySlug: "berlin" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Things to Do in Berlin");
    expect(html).toContain("Brandenburg Gate");
    expect(html).toContain("Understand Berlin");
    expect(html).toContain("Approach Brandenburg Gate");
    expect((html.match(/<img/g) ?? []).length).toBeGreaterThanOrEqual(7);
    expect(html.toLowerCase()).not.toContain("generic checklist item");
  });

  it("renders Paris with Phase 2 narrative depth and image-backed POI cards", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/france/paris", () => undefined]}>
        <ParisGuideRoute />
      </Router>
    );

    expectRenderableGuide(html, "Things to Do in Paris");
    expect(html).toContain("The Eiffel Tower was completed for the 1889");
    expect(html).toContain("Notre-Dame Cathedral and Île de la Cité");
    expect(html).toContain("Arc de Triomphe");
    expect((html.match(/<img/g) ?? []).length).toBeGreaterThanOrEqual(9);
    expect(html).not.toContain(
      "Visit early or near sunset for broad city views, then stroll the lawns"
    );
  });

  it("renders the Vancouver Phase 3 guide with destination-specific POIs", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/canada/vancouver", () => undefined]}>
        <CityGuideWorldRoute
          params={{ countrySlug: "canada", citySlug: "vancouver" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Things to Do in Vancouver");
    expect(html).toContain("Stanley Park");
    expect(html).toContain("Museum of Anthropology at UBC");
    expect(html).toContain("How to plan Vancouver");
    expect(html.toLowerCase()).not.toContain("generic checklist item");
  });

  it("renders Port Douglas Phase 3 as a reef-and-rainforest guide", () => {
    const html = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/australia/port-douglas", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "australia", citySlug: "port-douglas" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Things to Do in Port Douglas");
    expect(html).toContain("Four Mile Beach");
    expect(html).toContain("Mossman Gorge");
    expect(html).toContain("Great Barrier Reef");
  });

  it("renders Cairns and Melbourne through the Australian Paragon treatment", () => {
    const cairnsHtml = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/australia/cairns", () => undefined]}>
        <CityGuideWorldRoute
          params={{ countrySlug: "australia", citySlug: "cairns" }}
        />
      </Router>
    );
    const melbourneHtml = renderToStaticMarkup(
      <Router
        hook={() => ["/guides/world/australia/melbourne", () => undefined]}
      >
        <CityGuideWorldRoute
          params={{ countrySlug: "australia", citySlug: "melbourne" }}
        />
      </Router>
    );

    expectRenderableGuide(cairnsHtml, "Things to Do in Cairns");
    expect(cairnsHtml).toContain("Barron Gorge National Park");
    expect(cairnsHtml).toContain("Cairns Marina and Reef Fleet Terminal");
    expectRenderableGuide(melbourneHtml, "Things to Do in Melbourne");
    expect(melbourneHtml).toContain("Queen Victoria Market");
    expect(melbourneHtml).toContain("Royal Botanic Gardens Victoria");
  });

  it("renders Hamburg Phase 3 through the international Paragon template", () => {
    const html = renderToStaticMarkup(
      <Router hook={() => ["/guides/world/germany/hamburg", () => undefined]}>
        <CityGuideWorldRoute
          params={{ countrySlug: "germany", citySlug: "hamburg" }}
        />
      </Router>
    );

    expectRenderableGuide(html, "Things to Do in Hamburg");
    expect(html).toContain("Speicherstadt");
    expect(html).toContain("Elbphilharmonie");
    expect(html).toContain("How to plan Hamburg");
  });

  it("renders Tokyo, Kyoto, Osaka, Seoul and Queenstown as final Paragon guides", () => {
    const routes = [
      {
        countrySlug: "japan",
        citySlug: "tokyo",
        expected: ["Things to Do in Tokyo", "Sensō-ji and Asakusa"],
      },
      {
        countrySlug: "japan",
        citySlug: "kyoto",
        expected: ["Things to Do in Kyoto", "Fushimi Inari Taisha"],
      },
      {
        countrySlug: "japan",
        citySlug: "osaka",
        expected: ["Things to Do in Osaka", "Dōtonbori and the Namba Canal District"],
      },
      {
        countrySlug: "south-korea",
        citySlug: "seoul",
        expected: ["Things to Do in Seoul", "Gyeongbokgung Palace"],
      },
      {
        countrySlug: "new-zealand",
        citySlug: "queenstown",
        expected: [
          "Things to Do in Queenstown",
          "Glenorchy and the Head of Lake Wakatipu",
        ],
      },
    ];

    for (const route of routes) {
      const path = `/guides/world/${route.countrySlug}/${route.citySlug}`;
      const html = renderToStaticMarkup(
        <Router hook={() => [path, () => undefined]}>
          <CityGuideWorldRoute
            params={{
              countrySlug: route.countrySlug,
              citySlug: route.citySlug,
            }}
          />
        </Router>
      );

      expectRenderableGuide(html, route.expected[0]);
      expect(html).toContain(route.expected[1]);
      expect(html).toContain(`How to plan ${route.expected[0].replace("Things to Do in ", "")}`);
      expect(html.toLowerCase()).not.toContain("generic checklist item");
    }
  });
});
