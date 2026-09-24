import { readFile, writeFile } from "node:fs/promises";

type Patch = { before: string; after: string; label: string };

const patchFile = async (filename: string, patches: Patch[]) => {
  let text = await readFile(filename, "utf8");
  let changed = false;
  for (const patch of patches) {
    if (text.includes(patch.after)) continue;
    if (!text.includes(patch.before)) {
      throw new Error(`[fh-rebuild-patch] Missing expected source for ${patch.label} in ${filename}`);
    }
    text = text.replace(patch.before, patch.after);
    changed = true;
  }
  if (changed) await writeFile(filename, text, "utf8");
  console.info(`[fh-rebuild-patch] ${changed ? "patched" : "already-patched"} ${filename}`);
};

await patchFile("src/engine2/data/loadEngine2.ts", [
  {
    label: "engine2 enrichment import",
    before: 'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";\n',
    after: 'import { isHardDeletedLegacyTour } from "../../utils/tours/hardDeleteLegacyTours";\nimport { getFareHarborRebuildContent } from "../../utils/fh/rebuild";\n',
  },
  {
    label: "engine2 enrichment lookup",
    before: '    const rentalDescription = isRental\n      ? buildRentalDescription({\n          equipment: tour.name,\n          city: tour.geo.city,\n          location: tour.geo.region,\n        })\n      : null;\n\n    return {\n',
    after: '    const rentalDescription = isRental\n      ? buildRentalDescription({\n          equipment: tour.name,\n          city: tour.geo.city,\n          location: tour.geo.region,\n        })\n      : null;\n    const fareHarborRebuild =\n      (tour.bookingProvider ?? "fareharbor") === "fareharbor"\n        ? getFareHarborRebuildContent(tour.seo.canonicalPath)\n        : null;\n    const rebuildParagraphs = fareHarborRebuild?.r\n      ? (fareHarborRebuild.p ?? [])\n      : [];\n    const rebuildImages = fareHarborRebuild?.i ?? [];\n\n    return {\n',
  },
  {
    label: "engine2 rebuilt images",
    before: '      images: {\n        ...tour.images,\n        hero: getBestFareHarborImage(tour),\n      },\n',
    after: '      images: {\n        ...tour.images,\n        hero: rebuildImages[0] ?? getBestFareHarborImage(tour),\n        gallery:\n          rebuildImages.length >= 2\n            ? rebuildImages.slice(1)\n            : tour.images.gallery,\n      },\n',
  },
  {
    label: "engine2 rebuilt seo",
    before: '      seo: {\n        ...tour.seo,\n        description: rentalDescription ?? tour.seo.description,\n      },\n',
    after: '      seo: {\n        ...tour.seo,\n        description:\n          rebuildParagraphs[0] ?? rentalDescription ?? tour.seo.description,\n      },\n',
  },
  {
    label: "engine2 rebuilt experience",
    before: '      content: {\n        ...tour.content,\n        experienceText: rentalDescription ?? tour.content.experienceText,\n',
    after: '      content: {\n        ...tour.content,\n        experienceText:\n          rebuildParagraphs.length\n            ? rebuildParagraphs.join(" ")\n            : rentalDescription ?? tour.content.experienceText,\n',
  },
]);

await patchFile("src/engine2/pages/Engine2TourPage.tsx", [
  {
    label: "remove engine2 fallback price flag",
    before: '  const showFallbackPrice = !overridePriceLabel && !enginePriceLabel;\n',
    after: '  const isFareHarborUnresolvedPrice =\n    !isViatorTour && !overridePriceLabel && !enginePriceLabel;\n',
  },
  {
    label: "remove engine2 visible 129 fallback",
    before: '          {showFallbackPrice ? (\n            <p className="mt-4 text-sm font-semibold text-white/90">\n              From $129 per person\n            </p>\n          ) : null}\n',
    after: '',
  },
  {
    label: "engine2 learn more cta",
    before: '                  BOOK\n',
    after: '                  {isFareHarborUnresolvedPrice ? "Learn More" : "BOOK"}\n',
  },
]);

await patchFile("src/engine2/schema/buildSchemaGraph.ts", [
  {
    label: "schema threshold import",
    before: 'import { DEFAULT_CURRENCY } from "../../constants/merchantDefaults";\n',
    after: 'import {\n  DEFAULT_CURRENCY,\n  PRICE_MIN_THRESHOLD_USD,\n} from "../../constants/merchantDefaults";\n',
  },
  {
    label: "schema no fareharbor synthetic floor",
    before: '  const fallbackPrice = applyPriceFloor(\n    parsePrice(tour.pricing?.price ?? null)\n  );\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;\n',
    after: '  const rawStoredPrice = parsePrice(tour.pricing?.price ?? null);\n  const fallbackPrice = isViatorTour\n    ? applyPriceFloor(rawStoredPrice)\n    : rawStoredPrice !== null && rawStoredPrice >= PRICE_MIN_THRESHOLD_USD\n      ? rawStoredPrice\n      : null;\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;\n',
  },
]);

await patchFile("src/pages/tours/TourDetail.tsx", [
  {
    label: "route rebuild import",
    before: 'import { parseFareHarborHtml } from "../../utils/fh/parseFareHarborHtml";\n',
    after: 'import { parseFareHarborHtml } from "../../utils/fh/parseFareHarborHtml";\nimport { getFareHarborRebuildContent } from "../../utils/fh/rebuild";\n',
  },
  {
    label: "route rebuild lookup",
    before: '  const detailUrl = tour ? getTourDetailPath(tour) : "";\n  const heroImage =\n    resolveHeroImageForRoute({\n      route: detailUrl,\n      tour,\n    }) ?? undefined;\n  const structuredImages = heroImage ? [heroImage] : [];\n',
    after: '  const detailUrl = tour ? getTourDetailPath(tour) : "";\n  const fareHarborRebuild =\n    tour?.bookingProvider === "fareharbor"\n      ? getFareHarborRebuildContent(detailUrl)\n      : null;\n  const rebuildParagraphs = fareHarborRebuild?.r\n    ? (fareHarborRebuild.p ?? [])\n    : [];\n  const rebuildImages = fareHarborRebuild?.i ?? [];\n  const heroImage =\n    rebuildImages[0] ??\n    resolveHeroImageForRoute({\n      route: detailUrl,\n      tour,\n    }) ??\n    undefined;\n  const resolvedGalleryImages =\n    rebuildImages.length >= 2 ? rebuildImages.slice(1) : (tour?.galleryImages ?? []);\n  const structuredImages = rebuildImages.length\n    ? rebuildImages\n    : heroImage\n      ? [heroImage]\n      : [];\n',
  },
  {
    label: "route rebuilt meta",
    before: '  const metaDescription = tour\n    ? buildTourMetaDescription(tour, {\n        isDuplicate: isTourDescriptionDuplicate(tour),\n        diagnosticsLabel: `tour:${tour.id}`,\n      })\n    : undefined;\n',
    after: '  const metaDescription = rebuildParagraphs[0]\n    ? rebuildParagraphs[0].slice(0, 180)\n    : tour\n      ? buildTourMetaDescription(tour, {\n          isDuplicate: isTourDescriptionDuplicate(tour),\n          diagnosticsLabel: `tour:${tour.id}`,\n        })\n      : undefined;\n',
  },
  {
    label: "route live price resolution",
    before: '  const structuredDataNodes = useMemo(() => {\n',
    after: '  const fareHarborLivePrice =\n    fareHarborParsed?.priceAdult ?? fareHarborParsed?.priceChild ?? null;\n  const isFareHarborUnresolvedPrice =\n    tour?.bookingProvider === "fareharbor" &&\n    (fareHarborLivePrice === null ||\n      !Number.isFinite(fareHarborLivePrice) ||\n      fareHarborLivePrice < PRICE_MIN_THRESHOLD_USD);\n\n  const structuredDataNodes = useMemo(() => {\n',
  },
  {
    label: "route schema price",
    before: '            price: applyPriceFloor(tour.startingPrice ?? null),\n',
    after: '            price:\n              tour.bookingProvider === "fareharbor"\n                ? fareHarborLivePrice\n                : applyPriceFloor(tour.startingPrice ?? null),\n',
  },
  {
    label: "route schema deps",
    before: '    detailUrl,\n    heroImage,\n',
    after: '    detailUrl,\n    fareHarborLivePrice,\n    heroImage,\n',
  },
  {
    label: "route hero live price",
    before: '  const fareHarborHeroStartingPrice =\n    fareHarborParsed?.priceAdult ?? fareHarborParsed?.priceChild;\n',
    after: '  const fareHarborHeroStartingPrice = fareHarborLivePrice ?? undefined;\n',
  },
  {
    label: "route hero price source",
    before: '    fareHarborHeroStartingPrice ?? tour.startingPrice,\n',
    after: '    tour.bookingProvider === "fareharbor"\n      ? fareHarborHeroStartingPrice\n      : tour.startingPrice,\n',
  },
  {
    label: "route sidebar price",
    before: '              <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                {isPriceFallbackApplied\n                  ? "From $129 per person"\n                  : `From ${startingPriceLabel} per person`}\n              </p>\n',
    after: '              {!isFareHarborUnresolvedPrice && (\n                <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                  {tour.bookingProvider === "fareharbor"\n                    ? `From ${heroStartingPriceLabel} per person`\n                    : isPriceFallbackApplied\n                      ? "From $129 per person"\n                      : `From ${startingPriceLabel} per person`}\n                </p>\n              )}\n',
  },
  {
    label: "route primary learn more",
    before: '                  BOOK\n',
    after: '                  {isFareHarborUnresolvedPrice ? "Learn More" : "BOOK"}\n',
  },
  {
    label: "route rebuilt prose",
    before: '          {getExpandedTourDescription(tour).map(paragraph => (\n            <p key={paragraph}>{paragraph}</p>\n          ))}\n',
    after: '          {(rebuildParagraphs.length\n            ? rebuildParagraphs\n            : getExpandedTourDescription(tour)\n          ).map(paragraph => (\n            <p key={paragraph}>{paragraph}</p>\n          ))}\n',
  },
  {
    label: "route rebuilt gallery condition",
    before: '        {tour.galleryImages?.length ? (\n',
    after: '        {resolvedGalleryImages.length ? (\n',
  },
  {
    label: "route rebuilt gallery map",
    before: '            {tour.galleryImages.map(image => (\n',
    after: '            {resolvedGalleryImages.map(image => (\n',
  },
  {
    label: "route bottom learn more",
    before: '                Book This Tour\n',
    after: '                {isFareHarborUnresolvedPrice ? "Learn More" : "Book This Tour"}\n',
  },
]);

console.info("[fh-rebuild-patch] renderer patches complete");
