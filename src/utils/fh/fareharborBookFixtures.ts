export const BOOK_PATH_34849 =
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849/book";

export const FAREHARBOR_URL_34849 =
  "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no";

const HTML_34849 = `
<main>
  <h1>Shared San Andreas Fault Jeep Tour</h1>
  <section data-fh="category">
    <p>Jeep tour (geology + nature walk)</p>
  </section>
  <section data-fh="overview">
    <p>Explore the San Andreas Fault zone with a naturalist guide on an open-air Jeep route through the Coachella Valley's geologically active terrain.</p>
    <p>Stops include fault-line viewpoints, Indio Hills canyons, slot-canyon passages, and palm oasis areas where guests can walk short segments and discuss local geology.</p>
  </section>
  <section data-fh="highlights">
    <ul>
      <li>Guided Jeep access into the active San Andreas Fault system</li>
      <li>Interpretation of tectonic movement, desert ecology, and Coachella Valley geology</li>
      <li>Short ground stops for photos and close-up geology observation</li>
      <li>Palm oasis and wash-system viewpoints in the Coachella Valley</li>
      <li>Cahuilla village history and land-use context at select stops</li>
    </ul>
  </section>
  <section data-fh="details">
    <p><strong>Duration:</strong> 3 hours</p>
    <p><strong>Meeting Point:</strong> Metate Ranch — 38635 Monroe St, Indio, CA 92203</p>
  </section>
  <section data-fh="pricing">
    <ul>
      <li>Adults (18+): $175</li>
      <li>Children (17 and under, parent required): $150</li>
    </ul>
  </section>
  <section data-fh="inclusions">
    <ul>
      <li>Professional naturalist guide</li>
      <li>Open-air Jeep transportation</li>
      <li>Ice water during the tour</li>
    </ul>
  </section>
  <section data-fh="exclusions">
    <ul>
      <li>Guide gratuity</li>
      <li>Hotel pickup and drop-off</li>
    </ul>
  </section>
  <section data-fh="faq">
    <article><h3>Is this tour suitable for kids?</h3><p>Yes, children are welcome when they meet the operator's minimum age and safety requirements.</p></article>
    <article><h3>What should I wear?</h3><p>Wear closed-toe shoes, sun protection, and layered clothing for changing desert temperatures.</p></article>
  </section>
</main>
`;

export const BOOK_PATH_459591 =
  "/destinations/california/joshua-tree/tours/hike-and-climb-459591/book";

export const FAREHARBOR_URL_459591 =
  "https://fareharbor.com/embeds/book/joshuatreeexcursions/items/459591/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no";

const HTML_459591 = `
<main>
  <h1>Hike & Climb</h1>
  <section data-fh="category">
    <p>Guided hiking and climbing tour in Joshua Tree</p>
  </section>
  <section data-fh="overview">
    <p>Join a local guide for a Joshua Tree hike approach followed by a beginner-friendly climbing session on desert granite formations.</p>
    <p>This experience blends movement coaching, route planning, and park interpretation for guests who want a guided day on trail and rock.</p>
  </section>
  <section data-fh="highlights">
    <ul>
      <li>Guided hike through Joshua Tree desert terrain to selected climbing zones</li>
      <li>Hands-on movement coaching and climbing technique instruction</li>
      <li>Small-group format with time for questions and route adjustments</li>
      <li>Safety-focused progression from briefing through climbing session</li>
      <li>Scenic boulder fields and granite formations in Joshua Tree</li>
    </ul>
  </section>
  <section data-fh="details">
    <p><strong>Duration:</strong> 4 hours</p>
    <p><strong>Meeting Point:</strong> Joshua Tree Visitor Center — 6554 Park Blvd, Joshua Tree, CA 92252</p>
  </section>
  <section data-fh="pricing">
    <ul>
      <li>Adults: $229</li>
    </ul>
  </section>
  <section data-fh="inclusions">
    <ul>
      <li>Professional guide</li>
      <li>Climbing instruction</li>
      <li>Technical climbing gear for the session</li>
    </ul>
  </section>
  <section data-fh="faq">
    <article><h3>Do I need climbing experience?</h3><p>No. Beginners are welcome, and your guide adapts instruction to your comfort level.</p></article>
    <article><h3>What should I bring?</h3><p>Bring supportive shoes, water, sun protection, and weather-appropriate layers.</p></article>
    <article><h3>What is your cancellation policy?</h3><p>Cancellations are accepted with advance notice as listed during checkout.</p></article>
    <article><h3>Is there a minimum age?</h3><p>Minimum age requirements are listed on the booking page for each departure.</p></article>
  </section>
</main>
`;

export const fareHarborHtmlByUrl: Record<string, string> = {
  [FAREHARBOR_URL_34849]: HTML_34849,
  [FAREHARBOR_URL_459591]: HTML_459591,
};

export const fareHarborUrlByBookPath: Record<string, string> = {
  [BOOK_PATH_34849]: FAREHARBOR_URL_34849,
  [BOOK_PATH_459591]: FAREHARBOR_URL_459591,
};
