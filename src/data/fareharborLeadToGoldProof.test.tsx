import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";

import Engine2TourPage from "../engine2/pages/Engine2TourPage";
import {
  getAllEngine2Tours,
  getEngine2CanadaTourBySlug,
  getEngine2TourByPath,
} from "../engine2/data/loadEngine2";
import { buildSchemaGraph } from "../engine2/schema/buildSchemaGraph";
import { buildEngine2Seo } from "../engine2/seo/buildEngine2Seo";
import CityTourDetailRoute from "../pages/destinations/states/tours/CityTourDetailRoute";
import { getTourBySlugs } from "./tours";
import { getExpandedTourDescription } from "./tourNarratives";
import {
  applyFareHarborProofSchema,
  getFareHarborProofByItemId,
  getFareHarborProofFromTour,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";

const captured: { nodes: Array<Record<string, unknown>> | null } = {
  nodes: null,
};

vi.mock("../components/StructuredDataProvider", () => ({
  useStructuredData: (nodes: Array<Record<string, unknown>> | null) => {
    captured.nodes = nodes;
  },
}));

const PROOF_PATHS = [
  ["/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208", "145208", "59.95"],
  ["/destinations/hawaii/paia/tours/haleakala-downhill-self-guided-bike-tour-181765", "181765", "119.00"],
  ["/destinations/new-york/new-york/tours/nycs-underground-subway-tour---private-tour-322210", "322210", null],
  ["/destinations/wyoming/wilson/tours/scenic-float-tour-595701", "595701", null],
  ["/destinations/wyoming/cody/tours/self-guided-adv-motorcycle-rental-klr-650-694384", "694384", null],
  ["/destinations/wyoming/moose/tours/grand-teton-scenic-float---private-tour-646999", "646999", "1200.00"],
  ["/destinations/british-columbia/vancouver/tours/guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500", "612500", null],
  ["/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849", "34849", "183.75"],
  ["/destinations/florida/orlando/tours/date-night-neon-glow-clear-kayak-or-paddleboard-and-champagne-orlando-333279", "333279", "80.00"],
  ["/destinations/california/ensenada/tours/la-bufadora-tour-in-baja-california-193220", "193220", "40.00"],
] as const;

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const productNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => node["@type"] === "Product");

const tripNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => node["@type"] === "TouristTrip");

describe("FareHarbor Stage B proof set", () => {
  it("covers exactly the 10 representative products", () => {
    const products = getFareHarborProofProducts();
    expect(products.map(product => product.publicPath)).toEqual(
      PROOF_PATHS.map(([path]) => path)
    );
    expect(products.every(product => product.aggregateRating === null)).toBe(
      true
    );
  });

  it("uses harvested prices and omits offers when the source has none", () => {
    for (const [, itemId, price] of PROOF_PATHS) {
      const product = getFareHarborProofByItemId(itemId);
      expect(product).toBeTruthy();
      expect(product?.offer?.price ?? null).toBe(price);
      expect(JSON.stringify(product)).not.toContain("129.00");
      expect(product?.paragraphs.join(" ")).not.toContain(
        "keeps the logistics simple"
      );
      expect(product?.paragraphs.join(" ")).not.toContain(
        "more than a quick photo stop"
      );
      expect(product?.ratingProvenance).toContain("quality_score");
    }
    expect(getFareHarborProofByItemId("595701")?.exceptionStatus).toBe(
      "SOURCE_NOT_FOUND"
    );
    expect(getFareHarborProofByItemId("612500")?.exceptionStatus).toBe(
      "SOURCE_NOT_FOUND"
    );
    expect(getFareHarborProofByItemId("322210")?.exceptionStatus).toBe(
      "PRICE_NOT_FOUND"
    );
    expect(getFareHarborProofByItemId("694384")?.exceptionStatus).toBe(
      "PRICE_NOT_FOUND"
    );
  });

  it("renders the legacy proof pages without the $129 floor or catalog boilerplate", () => {
    const cases = [
      {
        stateSlug: "colorado",
        citySlug: "breckenridge",
        tourSlug: "country-boy-gold-mine-tour-145208",
        price: "Prices starting at $59.95",
        schemaPrice: "59.95",
        fact: "0542 French Gulch Rd",
      },
      {
        stateSlug: "wyoming",
        citySlug: "wilson",
        tourSlug: "scenic-float-tour-595701",
        price: null,
        schemaPrice: null,
        fact: "does not state a price",
      },
      {
        stateSlug: "wyoming",
        citySlug: "cody",
        tourSlug: "self-guided-adv-motorcycle-rental-klr-650-694384",
        price: null,
        schemaPrice: null,
        fact: "Kawasaki KLR 650",
      },
      {
        stateSlug: "british-columbia",
        citySlug: "vancouver",
        tourSlug:
          "guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500",
        price: null,
        schemaPrice: null,
        fact: "content HTTP 403",
      },
      {
        stateSlug: "hawaii",
        citySlug: "paia",
        tourSlug: "haleakala-downhill-self-guided-bike-tour-181765",
        price: "Prices starting at $119",
        schemaPrice: "119.00",
        fact: "71 Baldwin Ave",
      },
      {
        stateSlug: "new-york",
        citySlug: "new-york",
        tourSlug: "nycs-underground-subway-tour---private-tour-322210",
        price: null,
        schemaPrice: null,
        fact: "200 Broadway",
      },
      {
        stateSlug: "wyoming",
        citySlug: "moose",
        tourSlug: "grand-teton-scenic-float---private-tour-646999",
        price: "Prices starting at $1,200",
        schemaPrice: "1200.00",
        fact: "1 Teton Park Road",
      },
      {
        stateSlug: "florida",
        citySlug: "orlando",
        tourSlug:
          "date-night-neon-glow-clear-kayak-or-paddleboard-and-champagne-orlando-333279",
        price: "Prices starting at $80",
        schemaPrice: "80.00",
        fact: "1600 North Orange Avenue",
      },
    ];

    for (const item of cases) {
      const path = `/destinations/${item.stateSlug}/${item.citySlug}/tours/${item.tourSlug}`;
      captured.nodes = null;
      const html = renderRoute(
        path,
        <CityTourDetailRoute
          params={{
            stateSlug: item.stateSlug,
            citySlug: item.citySlug,
            tourSlug: item.tourSlug,
          }}
        />
      );
      expect(html).toContain(item.fact);
      const main = html.slice(
        html.indexOf("What you’ll experience"),
        html.indexOf("More tours")
      );
      expect(main).not.toContain("keeps the logistics simple");
      expect(main).not.toContain("From $129");
      expect(main).not.toContain("$129");
      if (item.price) {
        expect(html).toContain(item.price);
      } else {
        expect(html).not.toContain("Prices starting at");
      }
      const product = productNode(captured.nodes);
      const trip = tripNode(captured.nodes);
      expect(product?.aggregateRating).toBeUndefined();
      expect(trip?.aggregateRating).toBeUndefined();
      const offer = product?.offers as { price?: string } | undefined;
      expect(offer?.price ?? null).toBe(item.schemaPrice);
    }
  });

  it("renders engine 2 proof pages with harvested prices and no synthetic floor", () => {
    const jeep = getEngine2TourByPath(
      "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849"
    );
    const bufadora = getEngine2TourByPath(
      "/destinations/california/ensenada/tours/la-bufadora-tour-in-baja-california-193220"
    );
    const vancouver = getEngine2CanadaTourBySlug(
      "british-columbia",
      "vancouver",
      "guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500"
    );
    expect(jeep && bufadora && vancouver).toBeTruthy();

    captured.nodes = null;
    const jeepHtml = renderRoute(
      jeep!.seo.canonicalPath,
      <Engine2TourPage tour={jeep!} isFHPilotEnabled={false} />
    );
    expect(jeepHtml).toContain("Prices starting at $183.75");
    expect(jeepHtml).toContain("Metate Ranch");
    expect(jeepHtml).not.toContain("more than a quick photo stop");
    expect(jeepHtml).not.toContain("$129");
    expect((productNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "183.75"
    );

    captured.nodes = null;
    const bufadoraHtml = renderRoute(
      bufadora!.seo.canonicalPath,
      <Engine2TourPage tour={bufadora!} isFHPilotEnabled={false} />
    );
    expect(bufadoraHtml).toContain("Prices starting at $40");
    expect(bufadoraHtml).toContain("Punta Banda");
    expect(bufadoraHtml).not.toContain("$129");
    expect((productNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "40.00"
    );

    captured.nodes = null;
    const vancouverHtml = renderRoute(
      vancouver!.seo.canonicalPath,
      <Engine2TourPage tour={vancouver!} isFHPilotEnabled={false} />
    );
    expect(vancouverHtml).toContain("content HTTP 403");
    expect(vancouverHtml).not.toContain("From $129");
    expect(vancouverHtml).not.toContain("$129");
    expect(productNode(captured.nodes)?.offers).toBeUndefined();
  });

  it("leaves the synthetic floor in place for FareHarbor products outside the proof set", () => {
    const other = getAllEngine2Tours().find(
      tour =>
        tour.bookingProvider !== "viator" &&
        !tour.pricing?.price &&
        getFareHarborProofByItemId(tour.id) === null
    );
    expect(other).toBeTruthy();
    expect(getFareHarborProofFromTour({ id: other!.id, slug: other!.slug })).toBeNull();
    const html = renderRoute(
      other!.seo.canonicalPath,
      <Engine2TourPage tour={other!} isFHPilotEnabled={false} />
    );
    expect(html).toContain("From $129 per person");
    const seo = buildEngine2Seo(other!);
    const nodes = buildSchemaGraph(other!, seo, null, true);
    const offer = productNode(nodes)?.offers as { price?: string };
    expect(offer.price).toBe("129.00");
  });

  it("replaces a floored offer and drops aggregate rating for a proof product", () => {
    const proof = getFareHarborProofByItemId("145208");
    const tour = getTourBySlugs(
      "colorado",
      "breckenridge",
      "country-boy-gold-mine-tour-145208"
    );
    expect(proof && tour).toBeTruthy();
    expect(getExpandedTourDescription(tour!).join(" ")).toContain("Eureka Creek");
    const nodes = applyFareHarborProofSchema(
      [
        {
          "@type": "Product",
          description: "boilerplate",
          aggregateRating: { "@type": "AggregateRating", ratingValue: 3.2, reviewCount: 895 },
          offers: { "@type": "Offer", price: "129.00", priceCurrency: "USD", url: "https://example.com/book" },
        },
        {
          "@type": "TouristTrip",
          offers: { "@type": "Offer", price: "129.00" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: 3.2 },
        },
      ],
      proof!
    );
    expect((productNode(nodes)?.offers as { price: string }).price).toBe("59.95");
    expect((productNode(nodes)?.offers as { url: string }).url).toBe(
      "https://example.com/book"
    );
    expect(productNode(nodes)?.aggregateRating).toBeUndefined();
    expect(tripNode(nodes)?.aggregateRating).toBeUndefined();
    expect(JSON.stringify(nodes)).not.toContain("129.00");
  });
});
