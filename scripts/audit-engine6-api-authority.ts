export {};

const originalConsoleLog = console.log;
console.log = () => undefined;
console.warn = () => undefined;

const main = async () => {
  const { buildEngine6SchemaGraph } =
    await import("../src/engine6/schema/buildEngine6SchemaGraph");
  const { engine6ResolvedTours } = await import("../src/engine6/registry");
  const { ENGINE6_CONFIGURED_PRODUCT_CODES } =
    await import("../src/engine6/routes");

  const targetProductCode = "6740P7";
  const target = engine6ResolvedTours.find(
    tour => tour.productCode.toUpperCase() === targetProductCode
  );

  if (!target) {
    throw new Error(`Missing Engine6 target ${targetProductCode}`);
  }

  const schema = buildEngine6SchemaGraph(target);
  const graph = schema["@graph"] as Array<Record<string, unknown>>;
  const canonicalUrl = `https://www.alloutdooradventures.com${target.canonicalPath}`;
  const offer = graph.find(node => node["@id"] === `${canonicalUrl}#offer`);
  const product = graph.find(node => node["@type"] === "Product");
  const aggregateRating = graph.find(
    node => node["@type"] === "AggregateRating"
  );
  const trip = graph.find(node => node["@type"] === "TouristTrip");
  const webpage = graph.find(node => node["@type"] === "WebPage");

  const configured = new Set(
    ENGINE6_CONFIGURED_PRODUCT_CODES.map(code => code.toUpperCase())
  );
  const resolved = new Set(
    engine6ResolvedTours.map(tour => tour.productCode.toUpperCase())
  );
  const productCodeLookupFails = Array.from(configured).filter(
    code => !resolved.has(code)
  );
  const apiUnavailable = engine6ResolvedTours.filter(
    tour => tour.diagnostics.source !== "live-api"
  );

  const authority = (source: string) =>
    source === "live-api" ? "live API response" : "current API snapshot";

  const trace = {
    productCode: target.productCode,
    title: target.title,
    canonicalPath: target.canonicalPath,
    displayedPrice: {
      value: target.priceFormatted,
      amount: target.priceAmount,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.commercialPriceFieldPath,
    },
    schemaOfferPrice: {
      value: offer?.price ?? null,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.commercialPriceFieldPath,
    },
    ratingValue: {
      value:
        aggregateRating?.ratingValue ??
        (product?.aggregateRating as { ratingValue?: unknown } | undefined)
          ?.ratingValue ??
        null,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.ratingFieldPath,
    },
    reviewCount: {
      value:
        aggregateRating?.reviewCount ??
        (product?.aggregateRating as { reviewCount?: unknown } | undefined)
          ?.reviewCount ??
        null,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.reviewCountFieldPath,
    },
    duration: {
      displayedValue: target.durationText,
      schemaValue: trip?.duration ?? null,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.durationFieldPath ?? null,
    },
    offerUrl: {
      displayedValue: target.bookingUrl,
      schemaValue: offer?.url ?? null,
      authority: authority(target.diagnostics.source),
      sourcePath: target.diagnostics.productUrlFieldPath,
    },
    heroImage: {
      displayedValue: target.resolvedHero?.url ?? target.heroImageUrl,
      schemaValue:
        (webpage?.primaryImageOfPage as { url?: unknown } | undefined)?.url ??
        webpage?.image ??
        null,
      authority:
        target.diagnostics.source === "live-api"
          ? "live API response or safe product-scoped snapshot override"
          : "current API snapshot",
      sourcePath: target.diagnostics.heroSourceFieldPath,
    },
  };

  originalConsoleLog(
    JSON.stringify(
      {
        trace,
        audit: {
          totalConfiguredEngine6Pages: configured.size,
          resolvedEngine6Pages: engine6ResolvedTours.length,
          liveApiAuthorityCount: engine6ResolvedTours.filter(
            tour => tour.diagnostics.source === "live-api"
          ).length,
          staticOrFallbackAuthorityCount: apiUnavailable.length,
          productCodeLookupFailCount: productCodeLookupFails.length,
          apiDataUnavailableCount: apiUnavailable.length,
          productCodeLookupFails,
        },
      },
      null,
      2
    )
  );
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
