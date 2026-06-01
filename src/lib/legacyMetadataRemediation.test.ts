import { describe, expect, it } from "vitest";

import { tours } from "../data/tours";
import type { Tour } from "../data/tours.types";
import { buildTourSchemaGraph } from "../schema/buildTourSchemaGraph";
import { isHomeHeroImage, resolveTourHeroImage } from "../utils/hero";
import { DEFAULT_SEO, SITE_URL } from "../utils/seo";
import { buildTourMeta } from "./tourMeta";

const targetedDescriptionClusterSlugs = [
  "micro-brewery-tour-352913",
  "micro-brewery-tour-353504",
  "micro-brewery-tour-353797",
  "taste-of-vt-food-tour-353512",
  "taste-of-vt-food-tour-353513",
  "cider-and-spirits-tour-352903",
  "cider-and-spirits-tour-353798",
  "18-ventura-boston-whaler-51785",
  "18-ventura-boston-whaler-96495",
  "22-dauntless-boston-whaler-251834",
  "22-dauntless-boston-whaler-469534",
];

const targetedTitleCollisionSlugs = [
  "central-park-bike-tour-562552",
  "central-park-bike-tour-441675",
  "central-park-bike-tour-355491",
  "south-beach-bicycle-tour-70874",
  "south-beach-bicycle-tour-266590",
  "calgary-city-bike-tour-378748",
  "calgary-city-bike-tour-529962",
  "the-stanley-park-bike-tour-of-vancouver-118669",
  "the-stanley-park-bike-tour-of-vancouver-530042",
  "all-inclusive-kajakpaket-2-dagar-1-natt-682043",
  "all-inclusive-kajakpaket-7-dagar-6-ntter-682845",
  "all-inclusive-kajakpaket-3-dagar-2-ntter-682838",
  "all-inclusive-kajakpaket-5-dagar-4-ntter-682843",
  "rotterdam-hike-and-bite-food-tour-nl-139135",
  "rotterdam-hike-and-bite-food-tour-eng-139136",
];

const inactivePlaceholderSlugs = [
  "inactive-94293",
  "inactive-94294",
  "inactive-94296",
];

const findTour = (slug: string) => {
  const tour = tours.find(
    entry => entry.slug === slug && entry.engine !== "engine6"
  );
  expect(tour, `Expected public legacy tour for ${slug}`).toBeDefined();
  return tour as Tour;
};

const canonicalUrlFor = (tour: Tour) =>
  `${SITE_URL}/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;

const metaFor = (tour: Tour) => buildTourMeta(tour, canonicalUrlFor(tour));

const schemaDescriptionsFor = (tour: Tour) => {
  const meta = metaFor(tour);
  const graph = buildTourSchemaGraph({
    url: canonicalUrlFor(tour),
    pageName: tour.title,
    pageDescription: meta.description,
    heroImage: resolveTourHeroImage(tour),
    derivedImages: tour.galleryImages,
    place: {
      city: tour.destination.city,
      region: tour.destination.state,
      countryCode: tour.destination.countryCode,
      lat: tour.destination.lat,
      lng: tour.destination.lng,
    },
    product: {
      id: `${canonicalUrlFor(tour)}#product`,
      name: tour.title,
      description: meta.description,
      category: tour.primaryCategory,
    },
    trip: {
      id: `${canonicalUrlFor(tour)}#trip`,
      name: tour.title,
      description: meta.description,
      duration: tour.badges.duration,
      departureLocation: null,
    },
    offers: {
      url: tour.bookingUrl,
      price: tour.startingPrice ?? 1,
      priceCurrency: tour.currency ?? "USD",
    },
    brandOrgIds: {
      orgId: `${SITE_URL}/#organization`,
      brandId: `${SITE_URL}/#brand`,
      websiteId: `${SITE_URL}/#website`,
    },
  })["@graph"] as Array<Record<string, unknown>>;

  return graph
    .map(node => node.description)
    .filter(
      (description): description is string => typeof description === "string"
    );
};

describe("legacy tour metadata remediation", () => {
  it("suppresses inactive placeholder records from public legacy exposure", () => {
    for (const slug of inactivePlaceholderSlugs) {
      expect(tours.find(tour => tour.slug === slug)).toBeUndefined();
    }
  });

  it("does not emit homepage metadata or home hero images for public legacy tours", () => {
    for (const tour of tours.filter(entry => entry.engine !== "engine6")) {
      const meta = metaFor(tour);

      expect(meta.title).not.toBe(DEFAULT_SEO.title);
      expect(meta.description).not.toBe(DEFAULT_SEO.description);
      expect(isHomeHeroImage(resolveTourHeroImage(tour))).toBe(false);
    }
  });

  it("makes targeted duplicate-description clusters variant-specific across meta, social, and JSON-LD descriptions", () => {
    const descriptions = new Set<string>();
    const jsonLdDescriptions = new Set<string>();

    for (const slug of targetedDescriptionClusterSlugs) {
      const tour = findTour(slug);
      const meta = metaFor(tour);

      expect(meta.description).toContain(tour.destination.city);
      expect(meta.description).toMatch(/item \d+/);
      expect(meta.ogDescription).toBe(meta.description);
      expect(meta.twitterDescription).toBe(meta.description);
      expect(descriptions.has(meta.description)).toBe(false);
      descriptions.add(meta.description);

      for (const description of schemaDescriptionsFor(tour)) {
        expect(description).toBe(meta.description);
      }
      expect(jsonLdDescriptions.has(meta.description)).toBe(false);
      jsonLdDescriptions.add(meta.description);
    }
  });

  it("differentiates audited duplicate title variants without touching Engine6 tours", () => {
    const titles = new Set<string>();

    for (const slug of targetedTitleCollisionSlugs) {
      const tour = findTour(slug);
      const meta = metaFor(tour);

      expect(tour.engine).not.toBe("engine6");
      expect(meta.title).toContain(tour.destination.city);
      expect(meta.title).toMatch(
        /\((?:[^)]*item \d+|\d+ days|Dutch-language|English-language)/
      );
      expect(meta.ogTitle).toBe(meta.title);
      expect(meta.twitterTitle).toBe(meta.title);
      expect(titles.has(meta.title)).toBe(false);
      titles.add(meta.title);
    }
  });
});
