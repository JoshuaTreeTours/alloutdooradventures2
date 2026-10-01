import { readFile, writeFile } from "node:fs/promises";

const patchFile = async (
  path: string,
  transforms: Array<(source: string) => string>,
) => {
  let source = await readFile(path, "utf8");
  const original = source;
  for (const transform of transforms) source = transform(source);
  if (source === original) {
    console.info(`[fh-rebuild-code] unchanged ${path}`);
    return;
  }
  await writeFile(path, source, "utf8");
  console.info(`[fh-rebuild-code] patched ${path}`);
};

const replaceRequired = (needle: string, replacement: string) => (source: string) => {
  if (source.includes(replacement)) return source;
  if (!source.includes(needle)) {
    throw new Error(`Required patch target not found: ${needle.slice(0, 120)}`);
  }
  return source.replace(needle, replacement);
};

await patchFile("src/engine2/pages/Engine2TourPage.tsx", [
  replaceRequired(
    'import { resolveSafeTourListHref } from "../../utils/tours/tourNavigation";\n',
    'import { resolveSafeTourListHref } from "../../utils/tours/tourNavigation";\nimport {\n  applyFareHarborRebuildToEngine2Tour,\n  hasVerifiedEngine2Price,\n} from "../../data/fareharborRebuild";\n',
  ),
  replaceRequired(
    'export default function Engine2TourPage({\n  tour,\n  isFHPilotEnabled,\n}: Engine2TourPageProps) {\n',
    'export default function Engine2TourPage({\n  tour: sourceTour,\n  isFHPilotEnabled,\n}: Engine2TourPageProps) {\n  const tour = useMemo(\n    () => applyFareHarborRebuildToEngine2Tour(sourceTour),\n    [sourceTour],\n  );\n',
  ),
  replaceRequired(
    '  const basePrice = parsePrice(tour.pricing?.price ?? null);\n  const displayPrice = applyPriceFloor(basePrice);\n  const enginePriceLabel =\n    basePrice === null || basePrice <= 0 || basePrice < PRICE_MIN_THRESHOLD_USD\n      ? undefined\n      : `From $${displayPrice.toFixed(2)} per person`;\n',
    '  const basePrice = parsePrice(tour.pricing?.price ?? null);\n  const displayPrice = applyPriceFloor(basePrice);\n  const hasVerifiedPrice = hasVerifiedEngine2Price(tour);\n  const unresolvedFareHarborPrice = !isViatorTour && !hasVerifiedPrice;\n  const enginePriceLabel =\n    !hasVerifiedPrice ||\n    basePrice === null ||\n    basePrice <= 0 ||\n    basePrice < PRICE_MIN_THRESHOLD_USD\n      ? undefined\n      : `From $${displayPrice.toFixed(2)} per person`;\n',
  ),
  replaceRequired(
    '  const showFallbackPrice = !overridePriceLabel && !enginePriceLabel;\n',
    '  const showFallbackPrice =\n    isViatorTour && !overridePriceLabel && !enginePriceLabel;\n',
  ),
  replaceRequired(
    '            ) : bookingPath ? (\n              <Link href={bookingPath}>\n                <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">\n                  BOOK\n                </a>\n              </Link>\n            ) : null}\n',
    '            ) : unresolvedFareHarborPrice ? (\n              <a\n                href={tour.bookingUrl ?? tour.booking.bookingUrl}\n                target="_blank"\n                rel={EXTERNAL_CTA_REL}\n                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Learn More\n              </a>\n            ) : bookingPath ? (\n              <Link href={bookingPath}>\n                <a className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]">\n                  BOOK\n                </a>\n              </Link>\n            ) : null}\n',
  ),
]);

await patchFile("src/engine2/schema/buildSchemaGraph.ts", [
  replaceRequired(
    'import { DEFAULT_CURRENCY } from "../../constants/merchantDefaults";\n',
    'import {\n  DEFAULT_CURRENCY,\n  PRICE_MIN_THRESHOLD_USD,\n} from "../../constants/merchantDefaults";\n',
  ),
  replaceRequired(
    '  const imageGallery = normalizeStringArray(tour.images.gallery);\n  const isViatorTour = tour.bookingProvider === "viator";\n  const effectiveHeroImage = tour.images.hero || undefined;\n  const fallbackPrice = applyPriceFloor(\n    parsePrice(tour.pricing?.price ?? null)\n  );\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;\n',
    '  const imageGallery = normalizeStringArray(tour.images.gallery);\n  const isViatorTour = tour.bookingProvider === "viator";\n  const effectiveHeroImage = tour.images.hero || undefined;\n  const parsedPrice = parsePrice(tour.pricing?.price ?? null);\n  const fallbackPrice = isViatorTour\n    ? applyPriceFloor(parsedPrice)\n    : parsedPrice !== null && parsedPrice >= PRICE_MIN_THRESHOLD_USD\n      ? parsedPrice\n      : undefined;\n  const schemaPrice = rewriteV3Content?.schemaPrice ?? fallbackPrice;\n',
  ),
]);

await patchFile("src/pages/tours/TourDetail.tsx", [
  replaceRequired(
    'import { applyPriceFloor } from "../../utils/merchantPricing";\n',
    'import { applyPriceFloor } from "../../utils/merchantPricing";\nimport {\n  applyFareHarborRebuildToTour,\n  hasVerifiedTourPrice,\n} from "../../data/fareharborRebuild";\n',
  ),
  replaceRequired(
    '  const tour = getTourBySlugs(params.stateSlug, params.citySlug, params.slug);\n',
    '  const rawTour = getTourBySlugs(params.stateSlug, params.citySlug, params.slug);\n  const tour = rawTour ? applyFareHarborRebuildToTour(rawTour) : null;\n',
  ),
  replaceRequired(
    '  const structuredImages = heroImage ? [heroImage] : [];\n',
    '  const structuredImages = tour\n    ? Array.from(\n        new Set(\n          [heroImage, ...(tour.galleryImages ?? [])].filter(\n            (image): image is string => Boolean(image),\n          ),\n        ),\n      )\n    : [];\n',
  ),
  replaceRequired(
    '            price: applyPriceFloor(tour.startingPrice ?? null),\n',
    '            price:\n              tour.bookingProvider === "fareharbor" &&\n              !hasVerifiedTourPrice(tour)\n                ? undefined\n                : applyPriceFloor(tour.startingPrice ?? null),\n',
  ),
  replaceRequired(
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n',
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n  const unresolvedFareHarborPrice =\n    tour.bookingProvider === "fareharbor" && !hasVerifiedTourPrice(tour);\n',
  ),
  replaceRequired(
    '              <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                {isPriceFallbackApplied\n                  ? "From $129 per person"\n                  : `From ${startingPriceLabel} per person`}\n              </p>\n',
    '              {!unresolvedFareHarborPrice ? (\n                <p className="mt-4 text-sm font-semibold text-[#1f2a1f]">\n                  {isPriceFallbackApplied\n                    ? "From $129 per person"\n                    : `From ${startingPriceLabel} per person`}\n                </p>\n              ) : null}\n',
  ),
  replaceRequired(
    '              <Link href={bookingUrl}>\n                <a\n                  rel="nofollow"\n                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                >\n                  BOOK\n                </a>\n              </Link>\n',
    '              {unresolvedFareHarborPrice ? (\n                <a\n                  href={tour.bookingUrl}\n                  target="_blank"\n                  rel="nofollow sponsored noopener noreferrer"\n                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                >\n                  Learn More\n                </a>\n              ) : (\n                <Link href={bookingUrl}>\n                  <a\n                    rel="nofollow"\n                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                  >\n                    BOOK\n                  </a>\n                </Link>\n              )}\n',
  ),
  replaceRequired(
    '        {bookingUrl ? (\n          <div className="mt-12 text-center">\n            <Link href={bookingUrl}>\n              <a\n                rel="nofollow"\n                className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Book This Tour\n              </a>\n            </Link>\n          </div>\n        ) : null}\n',
    '        {bookingUrl ? (\n          <div className="mt-12 text-center">\n            {unresolvedFareHarborPrice ? (\n              <a\n                href={tour.bookingUrl}\n                target="_blank"\n                rel="nofollow sponsored noopener noreferrer"\n                className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Learn More\n              </a>\n            ) : (\n              <Link href={bookingUrl}>\n                <a\n                  rel="nofollow"\n                  className="inline-flex items-center justify-center rounded-full bg-[#2f8a3d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                >\n                  Book This Tour\n                </a>\n              </Link>\n            )}\n          </div>\n        ) : null}\n',
  ),
]);

await patchFile("src/pages/tours/FlagstaffTourDetailRoute.tsx", [
  replaceRequired(
    'import { applyPriceFloor } from "../../utils/merchantPricing";\n',
    'import { applyPriceFloor } from "../../utils/merchantPricing";\nimport {\n  applyFareHarborRebuildToTour,\n  hasVerifiedTourPrice,\n} from "../../data/fareharborRebuild";\n',
  ),
  replaceRequired(
    '  const tour = getFlagstaffTourBySlug(params.tourSlug);\n',
    '  const rawTour = getFlagstaffTourBySlug(params.tourSlug);\n  const tour = rawTour ? applyFareHarborRebuildToTour(rawTour) : null;\n',
  ),
  replaceRequired(
    '            price: applyPriceFloor(tour.startingPrice ?? null),\n',
    '            price:\n              tour.bookingProvider === "fareharbor" &&\n              !hasVerifiedTourPrice(tour)\n                ? undefined\n                : applyPriceFloor(tour.startingPrice ?? null),\n',
  ),
  replaceRequired(
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n',
    '  const isPriceFallbackApplied =\n    tour.startingPrice === undefined ||\n    tour.startingPrice === null ||\n    !Number.isFinite(tour.startingPrice) ||\n    tour.startingPrice < PRICE_MIN_THRESHOLD_USD;\n  const unresolvedFareHarborPrice =\n    tour.bookingProvider === "fareharbor" && !hasVerifiedTourPrice(tour);\n',
  ),
  replaceRequired(
    '            <p className="mt-3 text-sm font-semibold text-white/90">\n              {isPriceFallbackApplied\n                ? "From $129 per person"\n                : `From ${startingPriceLabel} per person`}\n            </p>\n',
    '            {!unresolvedFareHarborPrice ? (\n              <p className="mt-3 text-sm font-semibold text-white/90">\n                {isPriceFallbackApplied\n                  ? "From $129 per person"\n                  : `From ${startingPriceLabel} per person`}\n              </p>\n            ) : null}\n',
  ),
  replaceRequired(
    '            <Link href={bookingUrl}>\n              <a\n                rel="nofollow"\n                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Book Now\n              </a>\n            </Link>\n',
    '            {unresolvedFareHarborPrice ? (\n              <a\n                href={tour.bookingUrl}\n                target="_blank"\n                rel="nofollow sponsored noopener noreferrer"\n                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Learn More\n              </a>\n            ) : (\n              <Link href={bookingUrl}>\n                <a\n                  rel="nofollow"\n                  className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                >\n                  Book Now\n                </a>\n              </Link>\n            )}\n',
  ),
  replaceRequired(
    '        {bookingUrl ? (\n          <div className="mt-12 text-center">\n            <Link href={bookingUrl}>\n              <a\n                rel="nofollow"\n                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Book This Tour\n              </a>\n            </Link>\n          </div>\n        ) : null}\n',
    '        {bookingUrl ? (\n          <div className="mt-12 text-center">\n            {unresolvedFareHarborPrice ? (\n              <a\n                href={tour.bookingUrl}\n                target="_blank"\n                rel="nofollow sponsored noopener noreferrer"\n                className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n              >\n                Learn More\n              </a>\n            ) : (\n              <Link href={bookingUrl}>\n                <a\n                  rel="nofollow"\n                  className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"\n                >\n                  Book This Tour\n                </a>\n              </Link>\n            )}\n          </div>\n        ) : null}\n',
  ),
]);

console.info("[fh-rebuild-code] source patches complete");
