import { extractLegacyFhProductRecord } from "../extractor";

export const CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH =
  "/destinations/new-york/new-york/tours/central-park-bike-tours-16628";

export const CENTRAL_PARK_BIKE_TOURS_BOOK_PATH =
  "/destinations/new-york/new-york/tours/central-park-bike-tours-16628/book";

const CENTRAL_PARK_BIKE_TOURS_PUBLIC_HTML = `
  <main>
  <meta property="og:image" content="https://cdn.filestackcontent.com/5lZqYu5ZTGK2gk66BLVt" />
  <h1>Central Park Bike Tours</h1>
  <img src="https://cdn.filestackcontent.com/5lZqYu5ZTGK2gk66BLVt" />
  <div data-legacy="price">From $85</div>
  <div data-legacy="rating">4.3</div>
  <div data-legacy="reviews">390 reviews</div>
  <section data-legacy="overview">
    <p>See Central Park with a licensed local guide on a bike tour designed for first-time and repeat NYC visitors.</p>
    <p>Routes adapt to group pace while covering iconic park landmarks, filming locations, and neighborhood context.</p>
  </section>
  <section data-legacy="highlights">
    <ul>
      <li>Ride with a local guide through Central Park's most recognizable landmarks</li>
      <li>Stop for photos at Bethesda Terrace, Strawberry Fields, and Cherry Hill</li>
      <li>Hear history and pop-culture context tied to park locations</li>
    </ul>
  </section>
  <section data-legacy="itinerary">
    <article>
      <h3>Columbus Circle departure</h3>
      <p>Meet your guide, complete safety checks, and begin with a short orientation ride.</p>
    </article>
    <article>
      <h3>Bethesda Terrace and Fountain</h3>
      <p>Pause for photos and stories about one of Central Park's best-known gathering spots.</p>
    </article>
    <article>
      <h3>Strawberry Fields and Cherry Hill</h3>
      <p>Continue to scenic stops for skyline views and notable film location callouts.</p>
    </article>
  </section>
  <section data-legacy="meeting">
    <p>Meeting point: Unlimited Biking, 56 W 56th St, New York, NY 10019</p>
  </section>
  <section data-legacy="duration">
    <p>2 hours</p>
  </section>
  <section data-legacy="additional-info">
    <ul>
      <li>Helmets are included and required for riders under 14.</li>
      <li>Arrive 15 minutes before departure for check-in.</li>
    </ul>
  </section>
  <section data-legacy="cancellation">
    <p>Free cancellation available up to 24 hours before the scheduled start time.</p>
  </section>
</main>
`;

const CENTRAL_PARK_BIKE_TOURS_BOOK_HTML = `
<main>
  <section data-fh="pricing">
    <ul>
      <li>Adults: $85</li>
      <li>Youth: $75</li>
    </ul>
  </section>
  <section data-fh="inclusions">
    <ul>
      <li>Bike rental and helmet</li>
      <li>Licensed NYC tour guide</li>
      <li>Route briefing and safety orientation</li>
    </ul>
  </section>
  <section data-fh="exclusions">
    <ul>
      <li>Guide gratuity</li>
      <li>Food and drinks</li>
    </ul>
  </section>
</main>
`;

export const centralParkBikeToursMigratedRecord = extractLegacyFhProductRecord({
  slug: "central-park-bike-tours-16628",
  canonicalPath: CENTRAL_PARK_BIKE_TOURS_PUBLIC_PATH,
  bookingPath: CENTRAL_PARK_BIKE_TOURS_BOOK_PATH,
  operator: "Unlimited Biking",
  publicHtml: CENTRAL_PARK_BIKE_TOURS_PUBLIC_HTML,
  bookingHtml: CENTRAL_PARK_BIKE_TOURS_BOOK_HTML,
  fallback: {
    title: "Central Park Bike Tours",
    heroImageUrl: "https://cdn.filestackcontent.com/5lZqYu5ZTGK2gk66BLVt",
    galleryImages: ["https://cdn.filestackcontent.com/5lZqYu5ZTGK2gk66BLVt"],
    ratingSnapshot: {
      rating: 4.3,
      reviewCount: 390,
    },
  },
});

centralParkBikeToursMigratedRecord.matchedViatorCommercial = {
  productCode: "233384P2",
  confidentMatch: true,
  priceAmount: 52,
  aggregateRating: 4.7,
  reviewCount: 5060,
};
