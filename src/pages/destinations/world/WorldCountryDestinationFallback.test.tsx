import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";

import GuideInternalLinks from "../../../components/GuideInternalLinks";
import {
  buildCountryGuide,
  getCountryDestinationHref,
} from "../../../data/guideData";
import DestinationsIndex from "../DestinationsIndex";
import WorldCountryRoute from "./WorldCountryRoute";

const renderAt = (route: string, component: React.ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [route, () => undefined]}>{component}</Router>
  );

describe("world country destination fallbacks", () => {
  it("renders Hungary from the /destinations/world namespace instead of Destination not found", () => {
    const html = renderAt(
      "/destinations/world/hungary",
      <WorldCountryRoute params={{ countrySlug: "hungary" }} />
    );

    expect(html).toContain("Hungary tours");
    expect(html).not.toContain("Destination not found");
  });

  it("renders Spain from the /destinations/world namespace instead of Destination not found", () => {
    const html = renderAt(
      "/destinations/world/spain",
      <WorldCountryRoute params={{ countrySlug: "spain" }} />
    );

    expect(html).toContain("Spain tours");
    expect(html).not.toContain("Destination not found");
  });

  it("preserves an existing active world destination page", () => {
    const html = renderAt(
      "/destinations/world/morocco",
      <WorldCountryRoute params={{ countrySlug: "morocco" }} />
    );

    expect(html).toContain("Morocco tours");
    expect(html).not.toContain("Destination not found");
  });

  it("keeps country-guide destination CTAs on live destination routes", () => {
    const hungaryGuide = buildCountryGuide("hungary");
    const spainGuide = buildCountryGuide("spain");

    expect(hungaryGuide).toBeTruthy();
    expect(spainGuide).toBeTruthy();
    expect(getCountryDestinationHref("hungary")).toBe(
      "/destinations/europe/hungary"
    );
    expect(getCountryDestinationHref("spain")).toBe(
      "/destinations/europe/spain"
    );

    const hungaryHtml = renderAt(
      "/guides/world/hungary",
      <GuideInternalLinks guide={hungaryGuide!} variant="area" />
    );
    const spainHtml = renderAt(
      "/guides/world/spain",
      <GuideInternalLinks guide={spainGuide!} variant="area" />
    );

    expect(hungaryHtml).toContain('href="/destinations/europe/hungary"');
    expect(hungaryHtml).not.toContain('href="/destinations/world/hungary"');
    expect(spainHtml).toContain('href="/destinations/europe/spain"');
    expect(spainHtml).not.toContain('href="/destinations/world/spain"');
  });

  it("omits non-live country destination links from the destinations index country list", () => {
    const html = renderAt("/destinations", <DestinationsIndex />);

    expect(html).not.toContain('href="/destinations/world/brazil"');
    expect(html).toContain('href="/destinations/world/australia"');
    expect(html).toContain('href="/destinations/world/morocco"');
  });
});
