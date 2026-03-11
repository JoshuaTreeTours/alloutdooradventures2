import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RatingStars from "./RatingStars";

describe("RatingStars", () => {
  it("renders visual stars, numeric rating value, and review count", () => {
    const html = renderToStaticMarkup(
      <RatingStars ratingValue={4.8} reviewCount={718} />
    );

    expect(html).toContain('data-testid="rating-stars"');
    expect(html.match(/data-testid="rating-star"/g) ?? []).toHaveLength(5);
    expect(html).toContain('data-testid="rating-value"');
    expect(html).toContain(">4.8<");
    expect(html).toContain("· 718 reviews");
  });

  it("uses singular review label for one review", () => {
    const html = renderToStaticMarkup(<RatingStars ratingValue={5} reviewCount={1} />);

    expect(html).toContain("· 1 review");
  });
});
