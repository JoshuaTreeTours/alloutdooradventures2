import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import GuideTemplate from "./templates/GuideTemplate";
import { buildCityGuide } from "./data/guideData";
import {
  INTERNATIONAL_GUIDE_CITY_ALIASES,
  getCanonicalInternationalGuideCitySlug,
  getInternationalGuideCityAlias,
} from "./data/internationalGuideAliases";
import { buildSitemap } from "../scripts/generate-sitemap.mjs";
import { buildBreadcrumbList } from "./utils/structuredData";

const repoRoot = process.cwd();
const readRepoFile = (path: string) =>
  readFileSync(join(repoRoot, path), "utf8");

const GUIDE_ALIAS_CASES = [
  ["austria", "vienna", "wien"],
  ["germany", "munich", "mnchen"],
  ["denmark", "copenhagen", "kbenhavn"],
  ["greece", "athens", "athina"],
  ["italy", "florence", "firenze"],
  ["italy", "rome", "roma"],
  ["italy", "venice", "venezia"],
  ["switzerland", "zurich", "zrich"],
  ["netherlands", "the-hague", "den-haag"],
  ["portugal", "lisbon", "lisboa"],
  ["ireland", "dublin", "dublin-2"],
  ["spain", "alcudia", "alcdia"],
  ["spain", "bilbao", "bilbo"],
  ["spain", "calvia", "calvi"],
  ["spain", "deia", "dei"],
  ["spain", "lestartit", "l-estartit"],
  ["spain", "pollenca", "pollena"],
  ["spain", "san-sebastian", "san-sebastin"],
  ["spain", "soller", "sller"],
  ["spain", "valencia", "valncia"],
  ["spain", "xabia", "xbia"],
  ["united-states", "santa-barbara", "santa-brbara"],
] as const;

const guidePath = (countrySlug: string, citySlug: string) =>
  `/guides/world/${countrySlug}/${citySlug}`;

describe("international guide alias canonicalization", () => {
  beforeAll(() => {
    (globalThis as { location?: Partial<Location> }).location = {
      pathname: "/guides",
      search: "",
    };
  });

  it("maps audited international guide aliases to the selected canonical slugs", () => {
    expect(INTERNATIONAL_GUIDE_CITY_ALIASES).toHaveLength(
      GUIDE_ALIAS_CASES.length
    );

    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of GUIDE_ALIAS_CASES) {
      expect(
        getCanonicalInternationalGuideCitySlug(countrySlug, aliasCitySlug)
      ).toBe(canonicalCitySlug);
      expect(
        getCanonicalInternationalGuideCitySlug(countrySlug, canonicalCitySlug)
      ).toBe(canonicalCitySlug);
      expect(
        getInternationalGuideCityAlias(countrySlug, aliasCitySlug)
      ).toEqual(
        expect.objectContaining({
          countrySlug,
          aliasCitySlug,
          canonicalCitySlug,
        })
      );
    }
  });

  it("declares permanent guide redirects for every audited alias route", () => {
    const vercelConfig = JSON.parse(readRepoFile("vercel.json")) as {
      redirects?: Array<{
        source: string;
        destination: string;
        permanent: boolean;
      }>;
    };

    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining(
        GUIDE_ALIAS_CASES.map(
          ([countrySlug, canonicalCitySlug, aliasCitySlug]) => ({
            source: guidePath(countrySlug, aliasCitySlug),
            destination: guidePath(countrySlug, canonicalCitySlug),
            permanent: true,
          })
        )
      )
    );
  });

  it("renders canonical city guides without Guide not found and with canonical breadcrumbs", () => {
    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of GUIDE_ALIAS_CASES) {
      const guide = buildCityGuide({
        parentSlug: countrySlug,
        citySlug: canonicalCitySlug,
        regionType: "country",
        sanitize: false,
      });

      expect(guide, guidePath(countrySlug, canonicalCitySlug)).toBeTruthy();
      expect(guide?.slug).toBe(canonicalCitySlug);
      expect(guide?.breadcrumbs.at(-1)?.href).toBe(
        guidePath(countrySlug, canonicalCitySlug)
      );
      expect(guide?.breadcrumbs.map(crumb => crumb.href)).not.toContain(
        guidePath(countrySlug, aliasCitySlug)
      );

      const html = renderToString(
        createElement(GuideTemplate, { guide: guide! })
      );
      expect(html).not.toContain("Guide not found");
      expect(html).toContain(
        `href="${guidePath(countrySlug, canonicalCitySlug)}"`
      );
      expect(html).not.toContain(
        `href="${guidePath(countrySlug, aliasCitySlug)}"`
      );
    }
  });

  it("builds JSON-LD BreadcrumbList items from canonical guide URLs", () => {
    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of GUIDE_ALIAS_CASES) {
      const guide = buildCityGuide({
        parentSlug: countrySlug,
        citySlug: canonicalCitySlug,
        regionType: "country",
        sanitize: false,
      });
      expect(guide).toBeTruthy();

      const breadcrumbList = buildBreadcrumbList(
        guide!.breadcrumbs.map(crumb => ({
          name: crumb.label,
          url: crumb.href,
        }))
      );
      const breadcrumbItems = breadcrumbList.itemListElement.map(
        item => item.item
      );

      expect(breadcrumbItems).toContain(
        guidePath(countrySlug, canonicalCitySlug)
      );
      expect(breadcrumbItems).not.toContain(
        guidePath(countrySlug, aliasCitySlug)
      );
    }
  });

  it("keeps audited Bilbao and Dublin duplicate routes on canonical guide pages", () => {
    const bilbaoGuide = buildCityGuide({
      parentSlug: "spain",
      citySlug: "bilbo",
      regionType: "country",
      sanitize: false,
    });
    const dublinGuide = buildCityGuide({
      parentSlug: "ireland",
      citySlug: "dublin-2",
      regionType: "country",
      sanitize: false,
    });

    expect(bilbaoGuide?.slug).toBe("bilbao");
    expect(bilbaoGuide?.name).toBe("Bilbao");
    expect(bilbaoGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/world/spain/bilbao"
    );
    expect(dublinGuide?.slug).toBe("dublin");
    expect(dublinGuide?.name).toBe("Dublin");
    expect(dublinGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/world/ireland/dublin"
    );
  });

  it("uses canonical guide URLs from destination CTA rendering", () => {
    const guide = buildCityGuide({
      parentSlug: "spain",
      citySlug: "alcudia",
      regionType: "country",
      sanitize: false,
    });
    expect(guide).toBeTruthy();

    const html = renderToString(
      createElement(GuideTemplate, { guide: guide! })
    );
    expect(html).toContain("/destinations/europe/spain/cities/alcudia/tours");
    expect(html).not.toContain("/destinations/europe/spain/cities/alcdia");
    expect(html).not.toContain("/guides/world/spain/alcdia");
  });

  it("emits only canonical guide URLs for audited duplicate clusters in the sitemap", async () => {
    const sitemap = await buildSitemap();

    for (const [
      countrySlug,
      canonicalCitySlug,
      aliasCitySlug,
    ] of GUIDE_ALIAS_CASES) {
      if (countrySlug === "united-states") {
        expect(
          sitemap.guideUrls.has(guidePath(countrySlug, canonicalCitySlug))
        ).toBe(false);
        expect(
          sitemap.guideUrls.has(guidePath(countrySlug, aliasCitySlug))
        ).toBe(false);
        continue;
      }

      expect(
        sitemap.guideUrls.has(guidePath(countrySlug, canonicalCitySlug))
      ).toBe(true);
      expect(sitemap.guideUrls.has(guidePath(countrySlug, aliasCitySlug))).toBe(
        false
      );
    }
  }, 60_000);
});
