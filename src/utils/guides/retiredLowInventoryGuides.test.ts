import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { tours } from "../../data/tours";
import { loadUsCityGuide } from "../loadGuide";
import { getGuidesByState } from "./guideRegistry";
import {
  getRetiredGuideRedirect,
  isProtectedLowInventoryGuide,
  LOW_INVENTORY_GUIDES_REVIEWED,
  PROTECTED_LOW_INVENTORY_GUIDES,
  RETIRED_LOW_INVENTORY_GUIDES,
} from "./retiredLowInventoryGuides";

const readSitemapGuides = () =>
  fs.readFileSync(path.resolve("public/sitemap-guides.xml"), "utf8");

const readVercelConfig = () =>
  JSON.parse(fs.readFileSync(path.resolve("vercel.json"), "utf8")) as {
    redirects: Array<{
      source: string;
      destination: string;
      permanent?: boolean;
    }>;
  };

describe("retired low-inventory city guides", () => {
  it("documents the full audit decision set", () => {
    expect(LOW_INVENTORY_GUIDES_REVIEWED).toBe(
      RETIRED_LOW_INVENTORY_GUIDES.length +
        PROTECTED_LOW_INVENTORY_GUIDES.length
    );
    expect(RETIRED_LOW_INVENTORY_GUIDES.length).toBeGreaterThan(0);
    expect(PROTECTED_LOW_INVENTORY_GUIDES.length).toBeGreaterThan(0);
  });

  it("adds permanent redirects for retired guide URLs", () => {
    expect(getRetiredGuideRedirect("alaska", "fairbanks")).toBe(
      "/guides/us/alaska"
    );

    const redirects = readVercelConfig().redirects;
    expect(redirects).toContainEqual({
      source: "/guides/us/alaska/fairbanks",
      destination: "/guides/us/alaska",
      permanent: true,
    });
  });

  it("removes retired guides from the registry and guide loader", () => {
    const alaskaGuideSlugs = getGuidesByState("alaska").map(
      guide => guide.citySlug
    );

    expect(alaskaGuideSlugs).not.toContain("fairbanks");
    expect(loadUsCityGuide("alaska", "fairbanks")).toBeUndefined();
  });

  it("removes retired guides from sitemap-guides.xml", () => {
    const sitemap = readSitemapGuides();

    expect(sitemap).not.toContain("/guides/us/alaska/fairbanks");
  });

  it("preserves tours from retired guides in marketplace inventory", () => {
    const fairbanksTours = tours.filter(
      tour =>
        tour.destination.stateSlug === "alaska" &&
        tour.destination.citySlug === "fairbanks"
    );

    expect(fairbanksTours).toHaveLength(1);
    expect(fairbanksTours[0]?.slug).toBeTruthy();
  });

  it("keeps protected sub-4 guides live and in sitemap-guides.xml", () => {
    expect(
      isProtectedLowInventoryGuide("wyoming", "yellowstone-national-park")
    ).toBe(true);
    expect(
      loadUsCityGuide("wyoming", "yellowstone-national-park")
    ).toBeTruthy();

    const sitemap = readSitemapGuides();
    expect(sitemap).toContain("/guides/us/wyoming/yellowstone-national-park");
  });
});
