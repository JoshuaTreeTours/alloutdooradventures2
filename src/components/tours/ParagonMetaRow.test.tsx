import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ParagonMetaRow from "./ParagonMetaRow";

describe("ParagonMetaRow", () => {
  it("renders all Viator paragon rows", () => {
    const html = renderToStaticMarkup(
      <ParagonMetaRow
        bookingProvider="viator"
        priceFrom={149}
        currency="USD"
        ratingValue={4.8}
        reviewCount={216}
        meetingPointText="1590 S Palm Canyon Dr, Palm Springs, CA 92264, USA"
      />
    );

    expect(html).toContain("From $149.00 per person");
    expect(html).toContain("★★★★⯨");
    expect(html).toContain("216 reviews");
    expect(html).toContain("Meeting point:");
  });

  it("shows stars when only review count is available", () => {
    const html = renderToStaticMarkup(
      <ParagonMetaRow bookingProvider="viator" reviewCount={216} />
    );

    expect(html).toContain("★★★★★");
    expect(html).toContain("216 reviews");
  });

  it("hides row for non-viator providers", () => {
    const html = renderToStaticMarkup(
      <ParagonMetaRow bookingProvider="fareharbor" reviewCount={216} />
    );

    expect(html).toBe("");
  });
});
