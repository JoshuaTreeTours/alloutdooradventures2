import { extractLegacyFhProductRecord } from "../extractor";

export const SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_PUBLIC_PATH =
  "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603";

export const SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_BOOK_PATH =
  "/destinations/california/san-diego/tours/san-diego-whale-watching-cruise-60603/book";

const SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_PUBLIC_HTML = `
  <main>
    <meta property="og:image" content="https://cdn.filestackcontent.com/sAU7BSh9Tpe0mkLgku0W" />
    <h1>San Diego Whale Watching Cruise</h1>
    <img src="https://cdn.filestackcontent.com/sAU7BSh9Tpe0mkLgku0W" />
    <div data-legacy="price">From $72</div>
    <div data-legacy="rating">3.0</div>
    <div data-legacy="reviews">184 reviews</div>
    <section data-legacy="overview">
      <p>Cruise along San Diego Bay and the Pacific migration corridor with onboard naturalist narration focused on local marine life.</p>
      <p>Each trip is timed around active whale season windows, with deck-level viewing for dolphins, seabirds, and larger marine mammals.</p>
    </section>
    <section data-legacy="highlights">
      <ul>
        <li>Watch for gray whales and dolphins with a marine-life-focused crew</li>
        <li>Enjoy skyline and harbor views from spacious outdoor viewing decks</li>
        <li>Learn migration and ecology facts inspired by Birch Aquarium expertise</li>
      </ul>
    </section>
    <section data-legacy="itinerary">
      <article>
        <h3>Check-in at the San Diego waterfront</h3>
        <p>Arrive early for boarding, safety orientation, and departure updates based on harbor conditions.</p>
      </article>
      <article>
        <h3>Open-ocean whale search</h3>
        <p>Head offshore toward known migration lanes while guides share wildlife-spotting context and seasonal behavior notes.</p>
      </article>
      <article>
        <h3>Scenic return through the bay</h3>
        <p>Return past city landmarks and naval waterfront points before disembarkation.</p>
      </article>
    </section>
    <section data-legacy="meeting">
      <p>Meeting point: 990 North Harbor Drive, San Diego, CA 92101</p>
    </section>
    <section data-legacy="duration">
      <p>3 hours</p>
    </section>
    <section data-legacy="additional-info">
      <ul>
        <li>Dress in layers; open-water temperatures can feel cooler than onshore conditions.</li>
        <li>Arrive 20 minutes prior to departure for boarding and seat selection.</li>
      </ul>
    </section>
    <section data-legacy="cancellation">
      <p>Free cancellation is typically available up to 24 hours before departure time.</p>
    </section>
  </main>
`;

const SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_BOOK_HTML = `
  <main>
    <section data-fh="pricing">
      <ul>
        <li>Adult: $72</li>
        <li>Child: $57</li>
      </ul>
    </section>
    <section data-fh="inclusions">
      <ul>
        <li>Whale watching cruise ticket</li>
        <li>Onboard marine-life narration</li>
        <li>Access to indoor and outdoor viewing areas</li>
      </ul>
    </section>
    <section data-fh="exclusions">
      <ul>
        <li>Parking fees at the harbor</li>
        <li>Food and drinks purchased onboard</li>
      </ul>
    </section>
  </main>
`;

export const sanDiegoWhaleWatchingCruise60603MigratedRecord =
  extractLegacyFhProductRecord({
    slug: "san-diego-whale-watching-cruise-60603",
    canonicalPath: SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_PUBLIC_PATH,
    bookingPath: SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_BOOK_PATH,
    operator: "Flagship Cruises & Events",
    publicHtml: SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_PUBLIC_HTML,
    bookingHtml: SAN_DIEGO_WHALE_WATCHING_CRUISE_60603_BOOK_HTML,
    fallback: {
      title: "San Diego Whale Watching Cruise",
      heroImageUrl: "https://cdn.filestackcontent.com/sAU7BSh9Tpe0mkLgku0W",
      galleryImages: ["https://cdn.filestackcontent.com/sAU7BSh9Tpe0mkLgku0W"],
      ratingSnapshot: {
        rating: 3.0,
        reviewCount: 184,
      },
    },
  });
