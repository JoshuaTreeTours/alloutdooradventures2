import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import CityTemplate from "../../templates/CityTemplate";
import { getStateBySlug, type City } from "../../data/destinations";
import { loadUsCityGuide } from "../loadGuide";
import {
  resolveMissingUsCityGuideRedirect,
  resolveUsGuideHref,
} from "./guideResolver";

const countGuideSitemapUrls = () => {
  const sitemap = fs.readFileSync("public/sitemap-guides.xml", "utf8");
  return (sitemap.match(/<loc>/g) ?? []).length;
};

const sitemapIncludes = (path: string) => {
  const sitemap = fs.readFileSync("public/sitemap-guides.xml", "utf8");
  return sitemap.includes(`https://www.alloutdooradventures.com${path}`);
};

const bigSkyCity: City = {
  name: "Big Sky",
  slug: "big-sky",
  stateSlug: "montana",
  region: "Southwest Montana",
  lat: 45.2618,
  lng: -111.308,
  shortDescription:
    "Mountain basecamp near Lone Mountain, Gallatin Canyon, and Yellowstone approaches.",
  intro: "Use Big Sky as a mountain basecamp for southwest Montana.",
  heroImages: [],
  activityTags: ["hiking"],
  whereItIs: [],
  experiences: {
    mountains: "Lone Mountain and the Spanish Peaks frame the valley.",
    lakesWater: "The Gallatin River corridor is nearby.",
    desertForest: "High-elevation forests define the surrounding terrain.",
    cycling: "Summer roads and paths support scenic rides.",
    scenicDrives: "US-191 connects Big Sky with Bozeman and Yellowstone.",
    seasonalNotes: "Summer and early fall are best for hiking access.",
  },
  thingsToDo: [],
  toursCopy: [],
  weekendItinerary: { dayOne: [], dayTwo: [] },
  gettingThere: [],
  faq: [],
};

describe("guideResolver", () => {
  it("keeps the guide sitemap at the intentional guide-sized count", () => {
    expect(countGuideSitemapUrls()).toBeGreaterThanOrEqual(770);
    expect(countGuideSitemapUrls()).toBeLessThanOrEqual(800);
  });

  it("does not include a Montana city without a guide in sitemap-guides.xml", () => {
    expect(loadUsCityGuide("montana", "big-sky")).toBeFalsy();
    expect(sitemapIncludes("/guides/us/montana/big-sky")).toBe(false);
  });

  it("falls Montana child destinations without guides back to the Montana parent guide", () => {
    expect(resolveUsGuideHref("montana", "big-sky")).toMatchObject({
      href: "/guides/us/montana",
      hasCityGuide: false,
    });
  });

  it("redirects direct non-guide Montana city guide requests to the Montana parent guide", () => {
    expect(resolveMissingUsCityGuideRedirect("montana", "big-sky")).toBe(
      "/guides/us/montana"
    );
  });

  it("keeps Montana cities with real guides on their own canonical city guide URLs", () => {
    expect(loadUsCityGuide("montana", "bozeman")).toBeTruthy();
    expect(resolveUsGuideHref("montana", "bozeman")).toMatchObject({
      href: "/guides/us/montana/bozeman",
      hasCityGuide: true,
    });
    expect(resolveMissingUsCityGuideRedirect("montana", "bozeman")).toBeNull();
  });

  it("renders fallback guide CTAs to the parent guide and real guide CTAs to city guides", () => {
    const montana = getStateBySlug("montana");
    expect(montana).toBeDefined();

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: {
        pathname: "/destinations/states/montana/big-sky",
        search: "",
      },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;

    const fallbackHtml = renderToString(
      <CityTemplate state={montana!} city={bigSkyCity} toursOverride={[]} />
    );
    const bozeman = montana!.cities.find(city => city.slug === "bozeman");
    expect(bozeman).toBeDefined();
    const cityGuideHtml = renderToString(
      <CityTemplate state={montana!} city={bozeman!} toursOverride={[]} />
    );

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;

    expect(fallbackHtml).toContain('href="/guides/us/montana"');
    expect(fallbackHtml).not.toContain('href="/guides/us/montana/big-sky"');
    expect(cityGuideHtml).toContain('href="/guides/us/montana/bozeman"');
  });
});
