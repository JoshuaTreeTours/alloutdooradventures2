import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

import { getEngine2TourBySlug } from "../../engine2/data/loadEngine2";
import SlugOnlyTourRoute, {
  resolveSlugOnlyTourCanonicalPath,
} from "./SlugOnlyTourRoute";

vi.mock("../../components/RouteRedirect", () => ({
  default: ({ to }: { to: string }) => (
    <div data-testid="redirect" data-to={to} />
  ),
}));

describe("slug-only tour route canonical redirects", () => {
  it("resolves the valid Alaska tour slug to its destination canonical path", () => {
    expect(
      resolveSlugOnlyTourCanonicalPath("private-hiking-adventure-577765")
    ).toBe(
      "/destinations/united-states/alaska/denali-national-park-and-preserve/tours/private-hiking-adventure-577765"
    );
  });

  it("keeps the destination canonical URL resolvable for the Alaska tour", () => {
    const tour = getEngine2TourBySlug(
      "alaska",
      "denali-national-park-and-preserve",
      "private-hiking-adventure-577765"
    );

    expect(tour?.seo.canonicalPath).toBe(
      "/destinations/united-states/alaska/denali-national-park-and-preserve/tours/private-hiking-adventure-577765"
    );
  });

  it("redirects /tours/private-hiking-adventure-577765 instead of rendering the Flagstaff not-found fallback", () => {
    const html = renderToString(
      <SlugOnlyTourRoute
        params={{ tourSlug: "private-hiking-adventure-577765" }}
      />
    );

    expect(html).toContain('data-testid="redirect"');
    expect(html).toContain(
      'data-to="/destinations/united-states/alaska/denali-national-park-and-preserve/tours/private-hiking-adventure-577765"'
    );
    expect(html).not.toContain("Tour not found");
  });

  it("preserves slug-only Flagstaff tours on the legacy Flagstaff route", () => {
    expect(
      resolveSlugOnlyTourCanonicalPath(
        "ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718"
      )
    ).toBeNull();

    vi.stubGlobal("location", {
      pathname:
        "/tours/ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718",
      search: "",
      hash: "",
    });

    const html = renderToString(
      <SlugOnlyTourRoute
        params={{
          tourSlug:
            "ultimate-tour-of-northern-arizona-from-flagstaff-f-ult-561718",
        }}
      />
    );

    expect(html).not.toContain('data-testid="redirect"');
    expect(html).toContain("Ultimate Tour of Northern Arizona From Flagstaff");
  });
});
