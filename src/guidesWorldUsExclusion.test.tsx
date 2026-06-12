import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it } from "vitest";

import InternationalGuidesIndex from "./pages/guides/InternationalGuidesIndex";
import UsGuidesIndex from "./pages/guides/UsGuidesIndex";
import { buildSitemap } from "../scripts/generate-sitemap.mjs";
import { buildCityGuide, buildStateGuide } from "./data/guideData";
import { getInternationalCountries } from "./utils/guides/getInternationalCountries";
import { isUsCountryAlias } from "./utils/guides/usCountryAliases";

const US_COUNTRY_ALIASES = [
  "United States",
  "US",
  "U.S.",
  "USA",
  "usa",
  "united-states",
] as const;

describe("World Guides U.S. country alias exclusion", () => {
  beforeAll(() => {
    (globalThis as { location?: Partial<Location> }).location = {
      pathname: "/guides",
      search: "",
    };
  });

  it("classifies all requested U.S. country aliases", () => {
    US_COUNTRY_ALIASES.forEach(alias => {
      expect(isUsCountryAlias(alias), alias).toBe(true);
    });
  });

  it("excludes United States and usa country tiles from /guides/world", () => {
    const countries = getInternationalCountries();
    const slugs = countries.map(country => country.slug);
    const names = countries.map(country => country.name);
    const html = renderToString(createElement(InternationalGuidesIndex));

    expect(slugs).not.toContain("united-states");
    expect(slugs).not.toContain("usa");
    expect(names).not.toContain("United States");
    expect(names).not.toContain("usa");
    expect(html).not.toContain('href="/guides/world/united-states"');
    expect(html).not.toContain('href="/guides/world/usa"');
    expect(html).not.toContain(">United States<");
    expect(html).not.toContain(">usa<");
  });

  it("keeps /guides/us and U.S. state and city guides available", () => {
    const usIndexHtml = renderToString(createElement(UsGuidesIndex));
    const californiaGuide = buildStateGuide("california");
    const santaBarbaraGuide = buildCityGuide({
      parentSlug: "california",
      citySlug: "santa-barbara",
      regionType: "state",
      sanitize: false,
    });

    expect(usIndexHtml).toContain("US Guides");
    expect(usIndexHtml).toContain('href="/guides/us/california"');
    expect(californiaGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/us/california"
    );
    expect(santaBarbaraGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/us/california/santa-barbara"
    );
  });

  it("keeps valid U.S. guide URLs in sitemap-guides without world U.S. aliases", async () => {
    const sitemap = await buildSitemap();

    expect(sitemap.guideUrls.has("/guides/us/california")).toBe(true);
    expect(sitemap.guideUrls.has("/guides/us/california/santa-barbara")).toBe(
      true
    );
    expect(sitemap.guideUrls.has("/guides/world/united-states")).toBe(false);
    expect(sitemap.guideUrls.has("/guides/world/usa")).toBe(false);
    expect(
      [...sitemap.guideUrls].some(
        url =>
          url.startsWith("/guides/world/united-states/") ||
          url.startsWith("/guides/world/usa/")
      )
    ).toBe(false);
  }, 60_000);
});
