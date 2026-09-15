import { readFile, writeFile } from "node:fs/promises";

const patch = async (file, replacements) => {
  let text = await readFile(file, "utf8");
  for (const [from, to] of replacements) {
    if (!text.includes(from)) {
      if (text.includes(to)) continue;
      throw new Error(`Expected patch anchor not found in ${file}: ${from.slice(0, 120)}`);
    }
    text = text.replace(from, to);
  }
  await writeFile(file, text, "utf8");
};

await writeFile("src/data/fareharborContent.ts", `import raw from "./fareharborContent.generated.json";\n\ntype GeneratedItem = {\n  key: string;\n  paragraphs: string[];\n  highlights: string[];\n  seoDescription: string;\n  images: string[];\n};\ntype Generated = { items?: Record<string, GeneratedItem> };\nconst data = raw as Generated;\n\nexport const getFareHarborRebuildForRoute = (route: string) => data.items?.[route] ?? null;\n`, "utf8");

await patch("src/engine2/data/loadEngine2.ts", [
  [
    'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";',
    'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";\nimport { getFareHarborRebuildForRoute } from "../../data/fareharborContent";'
  ],
  [
    '  .map(tour => {\n    const tourType = tour.type ?? detectRental(tour.name);',
    '  .map(tour => {\n    const rebuilt = (tour.bookingProvider ?? "fareharbor") === "fareharbor"\n      ? getFareHarborRebuildForRoute(tour.seo.canonicalPath)\n      : null;\n    const tourType = tour.type ?? detectRental(tour.name);'
  ],
  [
    '      images: {\n        ...tour.images,\n        hero: getBestFareHarborImage(tour),\n      },',
    '      images: rebuilt\n        ? {\n            hero: rebuilt.images[0] ?? getBestFareHarborImage(tour),\n            gallery: rebuilt.images.length >= 2 ? rebuilt.images : tour.images.gallery,\n          }\n        : {\n            ...tour.images,\n            hero: getBestFareHarborImage(tour),\n          },'
  ],
  [
    '      seo: {\n        ...tour.seo,\n        description: rentalDescription ?? tour.seo.description,\n      },',
    '      seo: {\n        ...tour.seo,\n        description: rebuilt?.seoDescription ?? rentalDescription ?? tour.seo.description,\n        ogImage: rebuilt?.images[0] ?? tour.seo.ogImage,\n      },'
  ],
  [
    '      content: {\n        ...tour.content,\n        experienceText: rentalDescription ?? tour.content.experienceText,\n        highlights: isRental\n          ? [\n              `Equipment rental in ${tour.geo.city}`,\n              "Self-guided format with flexible duration options",\n              `Managed by ${tour.provider.name}`,\n            ]\n          : tour.content.highlights,',
    '      content: {\n        ...tour.content,\n        experienceText: rebuilt?.paragraphs.join("\\n\\n") ?? rentalDescription ?? tour.content.experienceText,\n        overview: rebuilt?.paragraphs.join("\\n\\n") ?? tour.content.overview,\n        highlights: rebuilt?.highlights?.length\n          ? rebuilt.highlights\n          : isRental\n            ? [\n                `Equipment rental in ${tour.geo.city}`,\n                "Self-guided format with flexible duration options",\n                `Managed by ${tour.provider.name}`,\n              ]\n            : tour.content.highlights,'
  ],
  [
    '      },\n    };\n  });',
    '      },\n      pricing: rebuilt ? undefined : tour.pricing,\n    };\n  });'
  ]
]);

await patch("src/data/tours.ts", [
  [
    'import { resolveTourHeroImage } from "../utils/hero";',
    'import { resolveTourHeroImage } from "../utils/hero";\nimport { getFareHarborRebuildForRoute } from "./fareharborContent";'
  ],
  [
    '  .map(remapMisclassifiedAfricaTours)\n  .filter(',
    '  .map(remapMisclassifiedAfricaTours)\n  .map(tour => {\n    if (tour.bookingProvider !== "fareharbor") return tour;\n    const route = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;\n    const rebuilt = getFareHarborRebuildForRoute(route);\n    if (!rebuilt) return tour;\n    const paragraphText = rebuilt.paragraphs.join("\\n\\n");\n    return {\n      ...tour,\n      shortDescription: rebuilt.paragraphs[0] ?? tour.shortDescription,\n      longDescription: paragraphText || tour.longDescription,\n      heroImage: rebuilt.images[0] ?? tour.heroImage,\n      primaryImageUrl: rebuilt.images[0] ?? tour.primaryImageUrl,\n      galleryImages: rebuilt.images.length >= 2 ? rebuilt.images : tour.galleryImages,\n      startingPrice: undefined,\n      pricing: { ...tour.pricing, isReliable: false },\n      badges: { ...tour.badges, priceFrom: undefined },\n    };\n  })\n  .filter('
  ]
]);

await patch("src/pages/tours/TourDetail.tsx", [
  [
    '  const heroStartingPriceLabel = formatStartingPrice(\n    fareHarborHeroStartingPrice ?? tour.startingPrice,\n    tour.currency\n  );',
    '  const hasVerifiedFareHarborPrice =\n    tour.bookingProvider !== "fareharbor" ||\n    tour.pricing?.isReliable === true ||\n    Number.isFinite(fareHarborHeroStartingPrice);\n  const heroStartingPriceLabel = hasVerifiedFareHarborPrice\n    ? formatStartingPrice(fareHarborHeroStartingPrice ?? tour.startingPrice, tour.currency)\n    : null;'
  ],
  [
    'price: applyPriceFloor(tour.startingPrice ?? null),',
    'price: tour.bookingProvider === "fareharbor" && !hasVerifiedFareHarborPrice\n        ? null\n        : applyPriceFloor(tour.startingPrice ?? null),'
  ],
  [
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;',
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n  const unresolvedFareHarborPrice = tour.bookingProvider === "fareharbor" && !hasVerifiedFareHarborPrice;'
  ],
  [
    '{isPriceFallbackApplied\n                  ? "From $129 per person"\n                  : `From ${startingPriceLabel} per person`}',
    '{unresolvedFareHarborPrice\n                  ? null\n                  : isPriceFallbackApplied\n                    ? "Price shown by provider"\n                    : `From ${startingPriceLabel} per person`}'
  ],
  [
    '>\n                  BOOK\n                </a>',
    '>\n                  {unresolvedFareHarborPrice ? "Learn More" : "BOOK"}\n                </a>'
  ],
  [
    '>\n                Book This Tour\n              </a>',
    '>\n                {unresolvedFareHarborPrice ? "Learn More" : "Book This Tour"}\n              </a>'
  ]
]);

await patch("src/engine2/pages/Engine2TourPage.tsx", [
  [
    '  const showFallbackPrice = !overridePriceLabel && !enginePriceLabel;',
    '  const unresolvedFareHarborPrice = !isViatorTour && !enginePriceLabel && !overridePriceLabel;\n  const showFallbackPrice = !unresolvedFareHarborPrice && !overridePriceLabel && !enginePriceLabel;'
  ],
  [
    '          {showFallbackPrice ? (\n            <p className="mt-4 text-sm font-semibold text-white/90">\n              From $129 per person\n            </p>\n          ) : null}',
    '          {showFallbackPrice ? (\n            <p className="mt-4 text-sm font-semibold text-white/90">\n              Price shown by provider\n            </p>\n          ) : null}'
  ],
  [
    '                  BOOK\n                </a>',
    '                  {unresolvedFareHarborPrice ? "Learn More" : "BOOK"}\n                </a>'
  ]
]);

await patch("src/engine2/schema/buildSchemaGraph.ts", [
  [
    '  const fallbackPrice = applyPriceFloor(\n    parsePrice(tour.pricing?.price ?? null)\n  );\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;',
    '  const parsedPrice = parsePrice(tour.pricing?.price ?? null);\n  const fallbackPrice = parsedPrice == null ? null : applyPriceFloor(parsedPrice);\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;'
  ]
]);

console.info("Applied FareHarbor runtime content, image, price, CTA, and schema integration.");
