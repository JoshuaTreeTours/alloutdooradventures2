export const BOOK_PATH_34849 =
  "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849/book";

export const FAREHARBOR_URL_34849 =
  "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn&asn-ref=alloutdooradventures&ref=alloutdooradventures&bookable-only=yes&full-items=yes&marketplace=yes&flow=no";

const HTML_34849 = `
<main>
  <h1>Shared San Andreas Fault Jeep Tour</h1>
  <section data-fh="overview">
    <p>Explore the San Andreas Fault zone with a naturalist guide on an open-air Jeep route through the Coachella Valley's geologically active terrain.</p>
    <p>Stops include fault-line viewpoints, eroded canyons, and palm oases where guests can walk short segments and discuss the landscape.</p>
  </section>
  <section data-fh="highlights">
    <ul>
      <li>Guided Jeep access into the active San Andreas Fault system</li>
      <li>Interpretation of tectonic movement, desert ecology, and local history</li>
      <li>Short ground stops for photos and close-up geology observation</li>
      <li>Palm oasis and wash-system viewpoints in the Coachella Valley</li>
    </ul>
  </section>
  <section data-fh="details">
    <p><strong>Duration:</strong> 3 hours</p>
    <p><strong>Meeting Point:</strong> Desert Adventures Metate Ranch base near Palm Desert</p>
  </section>
  <section data-fh="pricing">
    <ul><li>From $98 per person</li></ul>
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

export const fareHarborHtmlByUrl: Record<string, string> = {
  [FAREHARBOR_URL_34849]: HTML_34849,
};

export const fareHarborUrlByBookPath: Record<string, string> = {
  [BOOK_PATH_34849]: FAREHARBOR_URL_34849,
};

