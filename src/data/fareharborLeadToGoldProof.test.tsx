import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
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
import { getTourBySlugs, tours } from "./tours";
import { getExpandedTourDescription } from "./tourNarratives";
import {
  buildTourProductStructuredData,
  buildTourTripStructuredData,
} from "../utils/structuredData";
import {
  applyFareHarborProofSchema,
  applyFareHarborProofToHtml,
  applyFareHarborProofToPrerender,
  collectFareHarborMigratedRoutePaths,
  FAREHARBOR_PROOF_PRIMARY_CTA_LABEL,
  getFareHarborProofByItemId,
  getFareHarborProofFromTour,
  getFareHarborProofProducts,
} from "./fareharborLeadToGoldProof";
import { isStageBBookingPageNotFound } from "../utils/fareharbor/stageBTerminalBookingPages";
import { isHardDeletedLegacyTour } from "../utils/tours/hardDeleteLegacyTours";
import { isRemovedTourSlug } from "../utils/tours/isTourRemoved";

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

const BOOKING_PAGE_NOT_FOUND_IDS = new Set(["595701", "612500"]);

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

const REDUNDANT_EDITORIAL_ADDRESSES: Record<string, string> = {
  "145208": "0542 French Gulch Road",
  "181765": "71 Baldwin Avenue",
  "322210": "200 Broadway",
  "694384": "1108 14th Street",
  "646999": "1 Teton Park Road",
  "34849": "38635 Monroe Street",
  "333279": "1600 North Orange Avenue",
  "193220": "Miguel Aleman Avenue 512",
};

const RETAINED_NARRATIVE_CONTEXT: Record<string, string> = {
  "145208": "Breckenridge, Colorado",
  "181765": "Paia",
  "322210": "Lower Manhattan",
  "694384": "greater Cody area",
  "646999": "Grand Teton National Park",
  "34849": "Indio Hills",
  "333279": "Orlando",
  "193220": "Ensenada",
};

const PROOF_VISIBLE_IMAGES: Record<
  string,
  { hero: string; gallery: string[] }
> = {
  "145208": {
    hero: "https://cdn.filestackcontent.com/ZAorPKGTRJ2GipYchR2a",
    gallery: ["https://cdn.filestackcontent.com/wv2yejIATRCfMF7m4uiN"],
  },
  "181765": {
    hero: "https://cdn.filestackcontent.com/yKJVfFDYQx2y2o1QxkOc",
    gallery: [],
  },
  "322210": {
    hero: "https://cdn.filestackcontent.com/H6rPQHbQzSOkvhT38mo3",
    gallery: ["https://cdn.filestackcontent.com/4t7ODYY9S6yIHGZPjky8"],
  },
  "694384": {
    hero: "https://cdn.filestackcontent.com/snwT49muSizlVxLw1Slg",
    gallery: ["https://cdn.filestackcontent.com/J4Y4vvxbTzmcEKMpIVwa"],
  },
  "646999": {
    hero: "https://cdn.filestackcontent.com/AKtx67FCRhSR9ISqvgSw",
    gallery: [],
  },
  "34849": {
    hero: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
    gallery: [],
  },
  "333279": {
    hero: "https://cdn.filestackcontent.com/LRpu9FH3Tu2ZCUdGCgaK",
    gallery: ["https://cdn.filestackcontent.com/LkmxXm7tRpSfcUhaPjuz"],
  },
  "193220": {
    hero: "https://cdn.filestackcontent.com/1TOuejtgTaUS5d5Hus4q",
    gallery: [],
  },
};

const renderRoute = (path: string, node: ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [path, () => undefined]}>{node}</Router>
  );

const typeIncludes = (node: Record<string, unknown>, type: string) => {
  const value = node["@type"];
  return value === type || (Array.isArray(value) && value.includes(type));
};

const visibleImageSources = (html: string) =>
  Array.from(html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g), match => match[1]);

const productNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => typeIncludes(node, "Product"));

const tripNode = (nodes: Array<Record<string, unknown>> | null) =>
  nodes?.find(node => typeIncludes(node, "TouristTrip"));

const STAGE_B_ITEM_IDS = new Set(PROOF_PATHS.map(([, itemId]) => itemId));

describe("FareHarbor Stage B proof set", () => {
  it("keeps terminal booking pages out of the runtime proof set", () => {
    const products = getFareHarborProofProducts();
    const stageB = products.filter(product => STAGE_B_ITEM_IDS.has(product.itemId));
    expect(stageB.map(product => product.publicPath)).toEqual(
      PROOF_PATHS.filter(([, itemId]) => !BOOKING_PAGE_NOT_FOUND_IDS.has(itemId))
        .map(([path]) => path)
    );
    expect(products.every(product => product.aggregateRating === null)).toBe(
      true
    );
    expect(
      products.every(
        product => product.exceptionStatus !== "BOOKING_PAGE_NOT_FOUND"
      )
    ).toBe(true);
    const inventory = collectFareHarborMigratedRoutePaths();
    expect(inventory).toHaveLength(
      new Set(
        products.flatMap(product =>
          [product.publicPath, product.engine2Path].filter(Boolean)
        )
      ).size
    );
    expect(
      inventory.some(routePath =>
        BOOKING_PAGE_NOT_FOUND_IDS.has(routePath.split("-").pop() ?? "")
      )
    ).toBe(false);
  });

  it("removes terminal booking pages from every public inventory surface", () => {
    const terminalCases = [
      {
        itemId: "595701",
        stateSlug: "wyoming",
        citySlug: "wilson",
        tourSlug: "scenic-float-tour-595701",
        title: "Scenic Float Tour",
      },
      {
        itemId: "612500",
        stateSlug: "british-columbia",
        citySlug: "vancouver",
        tourSlug:
          "guided-4-hr-e-bike-tour-of-vancouver-seawall---jw-marriott-612500",
        title: "(Guided) 4-Hr E-Bike Tour of Vancouver Seawall - JW Marriott",
      },
    ];

    for (const item of terminalCases) {
      const path = `/destinations/${item.stateSlug}/${item.citySlug}/tours/${item.tourSlug}`;
      expect(isStageBBookingPageNotFound(item.itemId)).toBe(true);
      expect(isRemovedTourSlug(item.tourSlug)).toBe(true);
      expect(
        isHardDeletedLegacyTour({
          productId: item.itemId,
          slug: item.tourSlug,
          canonicalPath: path,
        })
      ).toBe(true);
      expect(
        getTourBySlugs(item.stateSlug, item.citySlug, item.tourSlug)
      ).toBeUndefined();
      expect(getFareHarborProofByItemId(item.itemId)).toBeNull();

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
      expect(html).not.toContain(item.title);
      expect(html).not.toContain("Tour snapshot");
      expect(html).not.toContain("Meeting point");
      expect(html).not.toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
      expect(html).not.toContain("fareharbor-proof-facts");
      expect(captured.nodes).toBeNull();
    }

    const publicInventories = JSON.stringify([tours, getAllEngine2Tours()]);
    for (const item of terminalCases) {
      expect(publicInventories).not.toContain(item.itemId);
    }

    const sitemap = readFileSync("public/sitemap-tours.xml", "utf8");
    const merchantFeed = readFileSync("data/merchantFeed.csv", "utf8");
    for (const item of terminalCases) {
      expect(sitemap).not.toContain(item.itemId);
      expect(merchantFeed).not.toContain(item.itemId);
    }
  });

  it("uses harvested prices and omits offers when the source has none", () => {
    for (const [, itemId, price] of PROOF_PATHS) {
      if (BOOKING_PAGE_NOT_FOUND_IDS.has(itemId)) {
        expect(getFareHarborProofByItemId(itemId)).toBeNull();
        continue;
      }
      const product = getFareHarborProofByItemId(itemId);
      expect(product).toBeTruthy();
      expect(product?.offer?.price ?? null).toBe(price);
      expect(product?.meetingLocation ?? null).toBe(MEETING_LOCATIONS[itemId]);
      expect(product?.galleryImages).toEqual(PROOF_VISIBLE_IMAGES[itemId].gallery);
      expect(new Set(product?.galleryImages).size).toBe(
        product?.galleryImages.length
      );
      if (product?.offer) {
        expect("availability" in product.offer).toBe(false);
      }
      expect(JSON.stringify(product)).not.toContain("129.00");
      expect(JSON.stringify(product?.offer)).not.toContain("InStock");
      const copy = product?.paragraphs.join(" ") ?? "";
      const schema = product?.schemaDescription ?? "";
      const redundantAddress = REDUNDANT_EDITORIAL_ADDRESSES[itemId];
      if (redundantAddress) {
        expect(copy).not.toContain(redundantAddress);
        expect(copy).toContain(RETAINED_NARRATIVE_CONTEXT[itemId]);
      }
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
    expect(getFareHarborProofByItemId("595701")).toBeNull();
    expect(getFareHarborProofByItemId("612500")).toBeNull();
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
        citySlug: "cody",
        tourSlug: "self-guided-adv-motorcycle-rental-klr-650-694384",
        price: null,
        schemaPrice: null,
        fact: "Kawasaki KLR 650",
        duration: "1 day",
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
      expect(html).toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
      expect(html).not.toContain(">BOOK<");
      expect(html).not.toContain("Book This Tour");
      expect(html).not.toContain("Tour snapshot");
      expect(html).not.toContain("Meeting location");
      const experienceStart = Math.max(
        html.indexOf("What you’ll experience"),
        html.indexOf("What you'll experience")
      );
      const experienceEnd = html.indexOf(
        'data-testid="fareharbor-proof-facts"',
        experienceStart
      );
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
      const itemId = item.tourSlug.match(/(\d+)$/)![1];
      const images = PROOF_VISIBLE_IMAGES[itemId];
      const imageSources = visibleImageSources(beforeRelated);
      expect(new Set(imageSources).size).toBe(imageSources.length);
      expect(imageSources.filter(source => source === images.hero)).toHaveLength(
        1
      );
      for (const galleryImage of images.gallery) {
        expect(
          imageSources.filter(source => source === galleryImage)
        ).toHaveLength(1);
      }
      expect(beforeRelated).not.toContain("From $129");
      expect(beforeRelated).not.toContain("$129");
      expect(beforeRelated).not.toContain("HTTP");
      if (item.price) {
        expect(beforeRelated).toContain(item.price);
        expect(beforeRelated).toContain(`Price:</strong> ${item.price}`);
      } else {
        expect(beforeRelated).not.toContain("From $");
        expect(beforeRelated).not.toContain("<strong>Price:</strong>");
      }
      if (item.duration) {
        const durationHits = beforeRelated.split(item.duration).length - 1;
        expect(durationHits).toBeGreaterThanOrEqual(2);
      } else {
        expect(beforeRelated).not.toContain("Check booking page");
      }
      const meetingLocation = MEETING_LOCATIONS[itemId];
      if (meetingLocation) {
        expect(beforeRelated).toContain("Meeting point");
        expect(beforeRelated).toContain(meetingLocation);
      } else {
        expect(beforeRelated).not.toContain("Meeting point");
      }
      expect(beforeRelated).not.toContain("quality_score");
      expect(beforeRelated).not.toContain("availability_count");
      expect(beforeRelated).not.toMatch(/AggregateRating/i);
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
    expect(jeep && bufadora).toBeTruthy();
    expect(vancouver).toBeNull();

    captured.nodes = null;
    const jeepHtml = renderRoute(
      jeep!.seo.canonicalPath,
      <Engine2TourPage tour={jeep!} isFHPilotEnabled={false} />
    );
    expect(jeepHtml).toContain("From $183.75");
    expect(jeepHtml).toContain("Price:</strong> From $183.75");
    expect(jeepHtml).toContain("Metate Ranch");
    expect(jeepHtml).toContain("Meeting point");
    expect(jeepHtml).toContain(MEETING_LOCATIONS["34849"]);
    expect(jeepHtml).toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
    expect(jeepHtml).not.toContain(">BOOK<");
    expect(jeepHtml).not.toContain("Tour snapshot");
    expect(jeepHtml).not.toContain("Meeting location");
    expect(jeepHtml).not.toContain("more than a quick photo stop");
    expect(jeepHtml).not.toContain("$129");
    const jeepImageSources = visibleImageSources(
      jeepHtml.slice(0, jeepHtml.indexOf("More tours"))
    );
    expect(new Set(jeepImageSources).size).toBe(jeepImageSources.length);
    expect(
      jeepImageSources.filter(
        source => source === PROOF_VISIBLE_IMAGES["34849"].hero
      )
    ).toHaveLength(1);
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
    expect(bufadoraHtml).toContain("Price:</strong> From $40");
    expect(bufadoraHtml).toContain("Punta Banda");
    expect(bufadoraHtml).toContain("Meeting point");
    expect(bufadoraHtml).toContain(MEETING_LOCATIONS["193220"]);
    expect(bufadoraHtml).toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
    expect(bufadoraHtml).not.toContain(">BOOK<");
    expect(bufadoraHtml).not.toContain("Tour snapshot");
    expect(bufadoraHtml).not.toContain("Meeting location");
    expect(bufadoraHtml).not.toContain("$129");
    const bufadoraImageSources = visibleImageSources(
      bufadoraHtml.slice(0, bufadoraHtml.indexOf("More tours"))
    );
    expect(new Set(bufadoraImageSources).size).toBe(
      bufadoraImageSources.length
    );
    expect(
      bufadoraImageSources.filter(
        source => source === PROOF_VISIBLE_IMAGES["193220"].hero
      )
    ).toHaveLength(1);
    expect((productNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "40.00"
    );
    expect((tripNode(captured.nodes)?.offers as { price?: string }).price).toBe(
      "40.00"
    );

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
    expect(html).toContain("BOOK");
    expect(html).not.toContain(FAREHARBOR_PROOF_PRIMARY_CTA_LABEL);
    expect(html).not.toContain("fareharbor-proof-facts");
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
