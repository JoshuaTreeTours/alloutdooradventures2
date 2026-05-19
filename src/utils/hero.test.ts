import { describe, expect, it } from "vitest";

import { buildTourSchemaGraph } from "../schema/buildTourSchemaGraph";
import {
  CITY_NEUTRAL_BRAND_IMAGE,
  HOME_HERO_IMAGE,
  isImageInCityTour,
  resolveCityHeroImage,
  resolveHeroImageForRoute,
  resolveTourHeroImage,
} from "./hero";
import { buildImageUrl } from "./seo";

const buildLegacyTourSchema = (heroImage: string | null) =>
  buildTourSchemaGraph({
    url: "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/example",
    pageName: "Example Tour",
    pageDescription: "A real product tour page.",
    heroImage,
    derivedImages: heroImage ? [heroImage] : [],
    place: {
      city: "Palm Springs",
      region: "California",
      countryCode: "US",
    },
    product: {
      id: "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/example#product",
      name: "Example Tour",
      description: "A real product tour page.",
      category: "Tours",
    },
    trip: {
      id: "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/example#trip",
      name: "Example Tour",
      description: "A real product tour page.",
      suppressFallbackItinerary: true,
    },
    offers: {
      url: "https://www.example.com/book",
      price: "100",
      priceCurrency: "USD",
    },
    brandOrgIds: {
      orgId: "https://www.alloutdooradventures.com/#organization",
      brandId: "https://www.alloutdooradventures.com/#brand",
      websiteId: "https://www.alloutdooradventures.com/#website",
    },
  });

const findSchemaNode = (graph: any, type: string) =>
  graph["@graph"].find((node: any) => node["@type"] === type);

describe("resolveCityHeroImage", () => {
  it("prefers a city-bound tour hero image", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "1",
          title: "Joshua Tree Sunset Hike",
          heroImage: "https://cdn.example.com/joshua-tree-tour.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 120, rating: 4.9 },
        },
      ],
    });

    expect(image).toBe("https://cdn.example.com/joshua-tree-tour.jpg");
  });

  it("joshua-tree: rejects other-city and other-country tour images", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "2",
          title: "Paris Day Tour",
          heroImage: "https://cdn.example.com/paris-tour.jpg",
          destination: {
            citySlug: "paris",
            stateSlug: "ile-de-france",
            countryCode: "FR",
          },
          badges: { reviewCount: 500, rating: 5 },
        },
        {
          id: "3",
          title: "Palm Springs Jeep",
          heroImage: "https://cdn.example.com/palm-springs-tour.jpg",
          destination: {
            citySlug: "palm-springs",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 200, rating: 4.8 },
        },
      ],
    });

    expect(image).toBe(buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE));
  });

  it("rejects malformed city hero URLs and falls back to the neutral brand image", () => {
    const image = resolveCityHeroImage({
      citySlug: "las-vegas",
      stateSlug: "nevada",
      countryCode: "US",
      cityTours: [
        {
          id: "bad-image",
          title: "Broken Hero Tour",
          heroImage: "undefined",
          destination: {
            citySlug: "las-vegas",
            stateSlug: "nevada",
            countryCode: "US",
          },
          badges: { reviewCount: 999, rating: 5 },
        },
      ],
    });

    expect(image).toBe(buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE));
  });

  it("never falls back to activity default images like canoe-hero", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "4",
          title: "Default Image Tour",
          heroImage: "/images/canoe-hero.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 1000, rating: 5 },
        },
      ],
    });

    expect(image).toBe(buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE));
    expect(image).not.toContain("/images/canoe-hero.jpg");
  });
});

describe("isImageInCityTour", () => {
  it("requires explicit tour/city binding and rejects defaults", () => {
    expect(
      isImageInCityTour(
        {
          src: "https://cdn.example.com/jt.jpg",
          tourCitySlug: "joshua-tree",
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "US",
        },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" }
      )
    ).toBe(true);

    expect(
      isImageInCityTour(
        {
          src: "/images/canoe-hero.jpg",
          tourCitySlug: "joshua-tree",
          citySlug: "joshua-tree",
        },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" }
      )
    ).toBe(false);

    expect(
      isImageInCityTour(
        { src: "https://cdn.example.com/unbound.jpg" },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" }
      )
    ).toBe(false);
  });
});

describe("resolveHeroImageForRoute city hub", () => {
  it("keeps city hub and city tours routes on the exact same hero URL", () => {
    const cityTours = [
      {
        id: "jt-city-1",
        title: "Joshua Tree Morning Hike",
        heroImage: "https://cdn.example.com/joshua-tree-shared.jpg",
        destination: {
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "US",
        },
        badges: { reviewCount: 350, rating: 4.9 },
      },
    ];

    const cityHubHero = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree",
      city: { slug: "joshua-tree", stateSlug: "california" },
      state: { slug: "california" },
      cityTours,
    });

    const cityToursHero = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree/tours",
      city: { slug: "joshua-tree", stateSlug: "california" },
      state: { slug: "california" },
      cityTours,
    });

    expect(cityHubHero).toBe("https://cdn.example.com/joshua-tree-shared.jpg");
    expect(cityToursHero).toBe(cityHubHero);
    expect(cityToursHero).not.toContain("canoe-hero");
  });
  it("uses same city-tour resolver for destination city routes", () => {
    const image = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree",
      city: {
        slug: "joshua-tree",
        stateSlug: "california",
        heroImages: [HOME_HERO_IMAGE],
      },
      state: {
        heroImage: "https://cdn.example.com/california-state.jpg",
        slug: "california",
      },
      cityTours: [
        {
          id: "jt-city",
          title: "Joshua Tree Stargazing",
          heroImage: "https://cdn.example.com/joshua-tree-city-tour.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 400, rating: 4.9 },
        },
      ],
    });

    expect(image).toBe("https://cdn.example.com/joshua-tree-city-tour.jpg");
    expect(image).not.toContain("canoe-hero");
  });
});

describe("legacy tour hero normalization", () => {
  const tacdnCaption =
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1";
  const spliceImage =
    "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg";

  it("prefers TACDN caption URLs from the tour image set", () => {
    expect(
      resolveTourHeroImage({
        heroImage: spliceImage,
        primaryImageUrl: tacdnCaption,
        galleryImages: [spliceImage],
      })
    ).toBe(tacdnCaption);
  });

  it("removes generic hero fallbacks instead of fabricating a product image", () => {
    expect(
      resolveTourHeroImage({
        heroImage: "/hero.jpg",
        primaryImageUrl: "https://www.alloutdooradventures.com/hero.jpg",
        galleryImages: ["/images/hiking-hero.jpg"],
      })
    ).toBeUndefined();
  });

  it("uses the same normalized image for legacy detail route SEO and page hero", () => {
    const resolved = resolveHeroImageForRoute({
      route: "/destinations/california/palm-springs/tours/example",
      tour: {
        heroImage: spliceImage,
        primaryImageUrl: tacdnCaption,
        galleryImages: [spliceImage],
      },
    });

    expect(resolved).toBe(tacdnCaption);
  });

  it("uses the visible product hero for all legacy metadata contexts when no TACDN caption exists", () => {
    const visibleHero = "https://cdn.example.com/visible-product-hero.jpg";
    const providerImage = "https://cdn.example.com/provider-product-image.jpg";
    const resolved = resolveHeroImageForRoute({
      route: "/destinations/california/palm-springs/tours/example",
      tour: {
        heroImage: visibleHero,
        primaryImageUrl: providerImage,
        galleryImages: [providerImage],
      },
    });

    const ogImage = resolved ? buildImageUrl(resolved) : "";
    const twitterImage = resolved ? buildImageUrl(resolved) : "";
    const schema = buildLegacyTourSchema(resolved);
    const webpage = findSchemaNode(schema, "WebPage");
    const product = findSchemaNode(schema, "Product");
    const trip = findSchemaNode(schema, "TouristTrip");

    expect(resolved).toBe(visibleHero);
    expect(ogImage).toBe(visibleHero);
    expect(twitterImage).toBe(visibleHero);
    expect(webpage.image).toBe(visibleHero);
    expect(webpage.primaryImageOfPage.url).toBe(visibleHero);
    expect(product.image).toBe(visibleHero);
    expect(trip.image).toBe(visibleHero);
    expect(JSON.stringify(schema)).not.toContain("/hero.jpg");
  });

  it("emits no social or schema image when no real product hero exists", () => {
    const resolved = resolveHeroImageForRoute({
      route: "/destinations/california/palm-springs/tours/example",
      tour: {
        heroImage: "/hero.jpg",
        primaryImageUrl: "https://www.alloutdooradventures.com/hero.jpg",
        galleryImages: ["/images/canoe-hero.jpg"],
      },
    });

    const ogImage = resolved ? buildImageUrl(resolved) : "";
    const twitterImage = resolved ? buildImageUrl(resolved) : "";
    const schema = buildLegacyTourSchema(resolved);
    const webpage = findSchemaNode(schema, "WebPage");
    const product = findSchemaNode(schema, "Product");
    const trip = findSchemaNode(schema, "TouristTrip");

    expect(resolved).toBeNull();
    expect(ogImage).toBe("");
    expect(twitterImage).toBe("");
    expect(webpage).not.toHaveProperty("image");
    expect(webpage).not.toHaveProperty("primaryImageOfPage");
    expect(product).not.toHaveProperty("image");
    expect(trip).not.toHaveProperty("image");
    expect(JSON.stringify(schema)).not.toContain("/hero.jpg");
  });
});
