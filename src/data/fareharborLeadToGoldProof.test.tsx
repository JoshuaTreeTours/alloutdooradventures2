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
  buildTourProductStructuredData,
  buildTourTripStructuredData,
} from "../utils/structuredData";
import {
  applyFareHarborProofSchema,
  applyFareHarborProofToHtml,
  applyFareHarborProofToPrerender,
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

const MEETING_LOCATIONS: Record<string, string | null> = {
  "145208": "Country Boy Mine, 0542 French Gulch Road, Breckenridge, CO 80424",
  "181765": "Maui Sunriders, 71 Baldwin Avenue, Suite D3, Paia, HI 96779",
  "322210":
    "Outside 200 Broadway, at Broadway and Fulton Street, New York, NY 10038",
  "595701": null,
  "694384": null,
  "646999": "1 Teton Park Road, Moose, WY 83012",
  "612500": null,
  "34849": "Metate Ranch, 38635 Monroe Street, Indio, CA 92203",
  "333279": "Epic Paddle Adventures, 1600 North Orange Avenue, Orlando, FL 32804",
  "193220":
    "Miguel Aleman Avenue 512, Colonia Ampliacion Moderna, Ensenada, Mexico 22879",
};

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const typeIncludes = (node: Record<string, unknown>, type: string) => {
  const value = node["@type"];
  return value === type || (Array.isArray(value) && value.includes(type));
};

const productNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => typeIncludes(node, "Product"));

const tripNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => typeIncludes(node, "TouristTrip"));

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
      expect(product?.meetingLocation ?? null).toBe(MEETING_LOCATIONS[itemId]);
      if (product?.offer) {
        expect("availability" in product.offer).toBe(false);
      }
      expect(JSON.stringify(product)).not.toContain("129.00");
      expect(JSON.stringify(product?.offer)).not.toContain("InStock");
      const copy = product?.paragraphs.join(" ") ?? "";
      const schema = product?.schemaDescription ?? "";
      expect(schema.length).toBeGreaterThan(0);
      expect(schema).not.toMatch(/\$\d/);
      expect(schema).not.toContain("The operator lists");
      if (product?.exceptionStatus === "SOURCE_NOT_FOUND") {
        expect(schema).toBe(copy);
      } else {
        expect(schema.length).toBeLessThan(copy.length);
      }
      expect(copy).not.toContain("keeps the logistics simple");
      expect(copy).not.toContain("The operator lists");
      expect(copy).not.toContain("Included items listed");
      expect(copy).not.toContain("The stored price preview");
      expect(copy).not.toContain("HTTP");
      expect(product?.ratingProvenance).toContain("quality_score");
      if (product?.exceptionStatus === "SOURCE_NOT_FOUND") {
        expect(product.wordCount).toBeLessThan(80);
      } else {
        expect(product.wordCount).toBeGreaterThanOrEqual(150);
      }
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
        price: "From $59.95",
        schemaPrice: "59.95",
        fact: "Eureka Creek",
        duration: "1 hour",
      },
      {
        stateSlug: "wyoming",
        citySlug: "wilson",
        tourSlug: "scenic-float-tour-595701",
        price: null,
        schemaPrice: null,
        fact: "Those details are not added here.",
        duration: null,
      },
      {
        stateSlug: "wyoming",
        citySlug: "cody",
        tourSlug: "self-guided-adv-motorcycle-rental-klr-650-694384",
        price: null,
        schemaPrice: null,
        fact: "Kawasaki KLR 650",
        duration: "1 day",
      },
      {
        stateSlug: "british-columbia",
        citySlug: "vancouver",
        tourSlug:
          "guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500",
        price: null,
        schemaPrice: null,
        fact: "Those details are not added here.",
        duration: null,
      },
      {
        stateSlug: "hawaii",
        citySlug: "paia",
        tourSlug: "haleakala-downhill-self-guided-bike-tour-181765",
        price: "From $119",
        schemaPrice: "119.00",
        fact: "71 Baldwin Avenue",
        duration: "4-5 hours",
      },
      {
        stateSlug: "new-york",
        citySlug: "new-york",
        tourSlug: "nycs-underground-subway-tour---private-tour-322210",
        price: null,
        schemaPrice: null,
        fact: "200 Broadway",
        duration: "2 hours",
      },
      {
        stateSlug: "wyoming",
        citySlug: "moose",
        tourSlug: "grand-teton-scenic-float---private-tour-646999",
        price: "From $1,200",
        schemaPrice: "1200.00",
        fact: "1 Teton Park Road",
        duration: "2.5 hours",
      },
      {
        stateSlug: "florida",
        citySlug: "orlando",
        tourSlug:
          "date-night-neon-glow-clear-kayak-or-paddleboard-and-champagne-orlando-333279",
        price: "From $80",
        schemaPrice: "80.00",
        fact: "1600 North Orange Avenue",
        duration: "2 hour experience",
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
      const experienceStart = Math.max(
        html.indexOf("What you’ll experience"),
        html.indexOf("What you'll experience")
      );
      const experienceEnd = html.indexOf("Tour snapshot", experienceStart);
      const experience =
        experienceEnd > experienceStart
          ? html.slice(experienceStart, experienceEnd)
          : html.slice(experienceStart, html.indexOf("More tours"));
      expect(experience).not.toContain("keeps the logistics simple");
      expect(experience).not.toContain("The operator lists");
      expect(experience).not.toContain("The stored price preview");
      expect(experience).not.toMatch(/\$\d/);
      const relatedAt = html.indexOf("More tours");
      const beforeRelated = relatedAt === -1 ? html : html.slice(0, relatedAt);
      expect(beforeRelated).not.toContain("From $129");
      expect(beforeRelated).not.toContain("$129");
      expect(beforeRelated).not.toContain("HTTP");
      if (item.price) {
        expect(beforeRelated).toContain(item.price);
      } else {
        expect(beforeRelated).not.toContain("From $");
      }
      if (item.duration) {
        const durationHits = beforeRelated.split(item.duration).length - 1;
        expect(durationHits).toBeGreaterThanOrEqual(2);
      } else {
        expect(beforeRelated).not.toContain("Check booking page");
      }
      const meetingLocation = MEETING_LOCATIONS[item.tourSlug.match(/(\d+)$/)![1]];
      if (meetingLocation) {
        expect(beforeRelated).toContain("Meeting location");
        expect(beforeRelated).toContain(meetingLocation);
      } else {
        expect(beforeRelated).not.toContain("Meeting location");
      }
      const product = productNode(captured.nodes);
      const trip = tripNode(captured.nodes);
      expect(product?.aggregateRating).toBeUndefined();
      expect(trip?.aggregateRating).toBeUndefined();
      const proof = getFareHarborProofFromTour({ slug: item.tourSlug });
      expect(product?.description).toBe(proof?.schemaDescription);
      expect(trip?.description).toBe(proof?.schemaDescription);
      expect(product?.description).toContain(item.fact);
      expect(trip?.description).toContain(item.fact);
      const productOffer = product?.offers as
        | { price?: string; availability?: string }
        | undefined;
      const tripOffer = trip?.offers as
        | { price?: string; availability?: string }
        | undefined;
      expect(productOffer?.price ?? null).toBe(item.schemaPrice);
      expect(tripOffer?.price ?? null).toBe(item.schemaPrice);
      expect(productOffer?.availability).toBeUndefined();
      expect(tripOffer?.availability).toBeUndefined();
      expect(JSON.stringify(captured.nodes)).not.toContain("InStock");
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
    expect(jeepHtml).toContain("From $183.75");
    expect(jeepHtml).toContain("Metate Ranch");
    expect(jeepHtml).toContain("Meeting location");
    expect(jeepHtml).toContain(MEETING_LOCATIONS["34849"]);
    expect(jeepHtml).not.toContain("more than a quick photo stop");
    expect(jeepHtml).not.toContain("$129");
    expect(jeepHtml.split("3 hours").length - 1).toBeGreaterThanOrEqual(2);
    expect((productNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "183.75"
    );
    expect(
      (tripNode(captured.nodes)?.offers as { price?: string }).price
    ).toBe("183.75");
    expect(JSON.stringify(captured.nodes)).not.toContain("InStock");

    captured.nodes = null;
    const bufadoraHtml = renderRoute(
      bufadora!.seo.canonicalPath,
      <Engine2TourPage tour={bufadora!} isFHPilotEnabled={false} />
    );
    expect(bufadoraHtml).toContain("From $40");
    expect(bufadoraHtml).toContain("Punta Banda");
    expect(bufadoraHtml).toContain("Meeting location");
    expect(bufadoraHtml).toContain(MEETING_LOCATIONS["193220"]);
    expect(bufadoraHtml).not.toContain("$129");
    expect((productNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "40.00"
    );
    expect((tripNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "40.00"
    );

    captured.nodes = null;
    const vancouverHtml = renderRoute(
      vancouver!.seo.canonicalPath,
      <Engine2TourPage tour={vancouver!} isFHPilotEnabled={false} />
    );
    expect(vancouverHtml).toContain("Those details are not added here.");
    expect(vancouverHtml).not.toContain("Meeting location");
    expect(vancouverHtml).not.toContain("HTTP");
    expect(vancouverHtml).not.toContain("From $129");
    expect(vancouverHtml).not.toContain("$129");
    expect(productNode(captured.nodes)?.offers).toBeUndefined();
    expect(tripNode(captured.nodes)?.offers).toBeUndefined();
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
          "@type": ["TouristTrip", "Thing"],
          offers: { "@type": "Offer", price: "129.00", availability: "https://schema.org/InStock" },
          aggregateRating: { "@type": "AggregateRating", ratingValue: 3.2 },
        },
        {
          "@type": "Offer",
          price: "129.00",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      ],
      proof!
    );
    expect((productNode(nodes)?.offers as { price: string }).price).toBe("59.95");
    expect((tripNode(nodes)?.offers as { price: string }).price).toBe("59.95");
    expect(
      (productNode(nodes)?.offers as { availability?: string }).availability
    ).toBeUndefined();
    expect((productNode(nodes)?.offers as { url: string }).url).toBe(
      "https://example.com/book"
    );
    expect(productNode(nodes)?.description).toBe(proof!.schemaDescription);
    expect(tripNode(nodes)?.description).toBe(proof!.schemaDescription);
    expect(proof!.schemaDescription.length).toBeLessThan(proof!.paragraphs.join(" ").length);
    expect(productNode(nodes)?.aggregateRating).toBeUndefined();
    expect(tripNode(nodes)?.aggregateRating).toBeUndefined();
    expect(JSON.stringify(nodes)).not.toContain("129.00");
    expect(JSON.stringify(nodes)).not.toContain("InStock");
  });

  it("removes the prerender floor from Product and TouristTrip before HTML is written", () => {
    const proof = getFareHarborProofByItemId("145208");
    const tour = getTourBySlugs(
      "colorado",
      "breckenridge",
      "country-boy-gold-mine-tour-145208"
    );
    expect(proof && tour).toBeTruthy();
    const detailUrl = `https://alloutdooradventures.com${proof!.publicPath}`;
    const graph = {
      "@context": "https://schema.org",
      "@graph": [
        buildTourProductStructuredData({
          tour: tour!,
          detailUrl,
          description: "Enjoy Country Boy.",
        }),
        buildTourTripStructuredData({
          tour: tour!,
          detailUrl,
          description: "Enjoy Country Boy.",
        }),
      ],
    };
    expect(JSON.stringify(graph)).toContain("129.00");
    const result = applyFareHarborProofToPrerender(
      { description: "Enjoy Country Boy." },
      graph,
      { id: tour!.id, slug: tour!.slug, bookingUrl: tour!.bookingUrl }
    );
    expect(result.seo.description).toBe(proof!.schemaDescription);
    const product = productNode(result.structuredData["@graph"]);
    const trip = tripNode(result.structuredData["@graph"]);
    expect((product?.offers as { price?: string }).price).toBe("59.95");
    expect((trip?.offers as { price?: string }).price).toBe("59.95");
    expect(JSON.stringify(result.structuredData)).not.toContain("129.00");
    expect(JSON.stringify(result.structuredData)).not.toContain("InStock");
    expect(trip?.duration).toBe("PT1H");
  });

  it("rewrites static HTML so Product and TouristTrip stay on the harvested price", () => {
    const proof = getFareHarborProofByItemId("145208");
    expect(proof).toBeTruthy();
    const html = `<!doctype html><html><head>
<meta name="description" content="Long editorial that should not be the meta description." />
<meta property="og:description" content="Long editorial that should not be the meta description." />
<meta name="twitter:description" content="Long editorial that should not be the meta description." />
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","description":"Long editorial","offers":{"@type":"Offer","price":"129.00","priceCurrency":"USD","availability":"https://schema.org/InStock"}},{"@type":"TouristTrip","description":"Long editorial","offers":{"@type":"Offer","price":"129.00","priceCurrency":"USD","availability":"https://schema.org/InStock"}}]}</script>
</head><body><p>${proof!.paragraphs[0]}</p></body></html>`;
    const patched = applyFareHarborProofToHtml(html, proof!);
    const again = applyFareHarborProofToHtml(patched, proof!);
    expect(again).toBe(patched);
    expect(patched).toContain(`content="${proof!.schemaDescription}"`);
    expect(patched).not.toContain("129.00");
    expect(patched).not.toContain("InStock");
    expect(patched).toContain(proof!.paragraphs[0]);
    const json = patched.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
    )?.[1];
    const graph = JSON.parse(json ?? "{}")["@graph"] as Array<Record<string, unknown>>;
    expect((productNode(graph)?.offers as { price?: string }).price).toBe("59.95");
    expect((tripNode(graph)?.offers as { price?: string }).price).toBe("59.95");
    expect(productNode(graph)?.description).toBe(proof!.schemaDescription);
  });
});
