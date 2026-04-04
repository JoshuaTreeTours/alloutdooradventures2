import { extractLegacyFhProductRecord } from "../extractor";

export const FORT_LAUDERDALE_EBIKE_PUBLIC_PATH =
  "/destinations/florida/fort-lauderdale/tours/guided-ebike-tours-of-fort-lauderdale";

export const FORT_LAUDERDALE_EBIKE_BOOK_PATH =
  "/destinations/florida/fort-lauderdale/tours/guided-ebike-tours-of-fort-lauderdale/book";

const FORT_LAUDERDALE_EBIKE_PUBLIC_HTML = `
  <main>
    <meta property="og:image" content="https://cdn.filestackcontent.com/fortlauderdale-ebike-primary" />
    <h1>Guided eBike Tours of Fort Lauderdale</h1>
    <img src="https://cdn.filestackcontent.com/fortlauderdale-ebike-primary" />
    <section data-legacy="overview">
      <p>Ride a guided electric-bike route through canals, neighborhoods, and waterfront viewpoints in Fort Lauderdale.</p>
    </section>
    <section data-legacy="highlights">
      <ul>
        <li>Small-group eBike route with local guide narration</li>
        <li>Stops at Las Olas and Intracoastal viewpoints</li>
      </ul>
    </section>
    <section data-legacy="meeting">
      <p>Meeting point: Las Olas Boulevard, Fort Lauderdale, FL</p>
    </section>
    <section data-legacy="duration">
      <p>2.5 hours</p>
    </section>
  </main>
`;

const FORT_LAUDERDALE_EBIKE_BOOK_HTML = `
  <main>
    <section data-fh="pricing">
      <ul>
        <li>Adult: $94</li>
      </ul>
    </section>
    <section data-fh="inclusions">
      <ul>
        <li>Electric bike and helmet</li>
        <li>Local guide</li>
      </ul>
    </section>
  </main>
`;

export const fortLauderdaleEBikeMigratedRecord = extractLegacyFhProductRecord({
  slug: "guided-ebike-tours-of-fort-lauderdale",
  canonicalPath: FORT_LAUDERDALE_EBIKE_PUBLIC_PATH,
  bookingPath: FORT_LAUDERDALE_EBIKE_BOOK_PATH,
  operator: "Fort Lauderdale eBike Tours",
  publicHtml: FORT_LAUDERDALE_EBIKE_PUBLIC_HTML,
  bookingHtml: FORT_LAUDERDALE_EBIKE_BOOK_HTML,
  fallback: {
    title: "Guided eBike Tours of Fort Lauderdale",
    heroImageUrl: "https://cdn.filestackcontent.com/fortlauderdale-ebike-primary",
    ratingSnapshot: {
      rating: 4.5,
      reviewCount: 44,
    },
  },
});

fortLauderdaleEBikeMigratedRecord.matchedViatorCommercial = {
  productCode: "383300P4",
  confidenceSignals: {
    productCodeMatched: true,
  },
  priceAmount: 89,
  aggregateRating: 4.8,
  reviewCount: 1200,
};
