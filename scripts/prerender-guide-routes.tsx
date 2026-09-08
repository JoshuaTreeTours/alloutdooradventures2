import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import GuidesIndex from "../src/pages/guides/GuidesIndex";
import UsGuidesIndex from "../src/pages/guides/UsGuidesIndex";
import InternationalGuidesIndex from "../src/pages/guides/InternationalGuidesIndex";
import StateGuideRoute from "../src/pages/guides/StateGuideRoute";
import CountryGuideRoute from "../src/pages/guides/CountryGuideRoute";
import CityGuideWorldRoute from "../src/pages/guides/CityGuideWorldRoute";
import ParisGuideRoute from "../src/pages/guides/ParisGuideRoute";
import GuidePageTemplate from "../src/templates/GuidePageTemplate";
import { getDestinationCityAlias } from "../src/data/destinationAliases";
import { getInternationalGuideCityAlias } from "../src/data/internationalGuideAliases";
import { getTopToursForPlace, type GuidePlace } from "../src/data/tourIndex";
import { getToursByCityUnified } from "../src/data/tours";
import type { GuidePageData } from "../src/utils/loadGuide";
import { withResolvedGuideData } from "../src/utils/guides/loadGuide";
import { getRetiredInternationalGuideRedirect } from "../src/utils/guides/internationalGuideRetention";

const distDir = path.resolve("dist");
const emptyRoot = '<div id="root"></div>';
const parisGuidePath = "/guides/world/france/paris";

const titleCase = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

type GuideRoute =
  | { kind: "guides-index" }
  | { kind: "us-index" }
  | { kind: "world-index" }
  | { kind: "us-state"; stateSlug: string }
  | { kind: "us-city"; stateSlug: string; citySlug: string }
  | { kind: "world-country"; countrySlug: string }
  | { kind: "world-city"; countrySlug: string; citySlug: string }
  | { kind: "paris-city" };

const parseGuideRoute = (pathname: string): GuideRoute | null => {
  if (pathname === "/guides") return { kind: "guides-index" };
  if (pathname === "/guides/us") return { kind: "us-index" };
  if (pathname === "/guides/world") return { kind: "world-index" };
  if (pathname === parisGuidePath) return { kind: "paris-city" };

  let match = /^\/guides\/us\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match) {
    return { kind: "us-city", stateSlug: match[1], citySlug: match[2] };
  }

  match = /^\/guides\/us\/([^/]+)$/.exec(pathname);
  if (match) return { kind: "us-state", stateSlug: match[1] };

  match = /^\/guides\/world\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match) {
    return {
      kind: "world-city",
      countrySlug: match[1],
      citySlug: match[2],
    };
  }

  match = /^\/guides\/world\/([^/]+)$/.exec(pathname);
  if (match) return { kind: "world-country", countrySlug: match[1] };

  return null;
};

const getUsCityGuideSourcePath = (stateSlug: string, citySlug: string) =>
  path.resolve("src/data/guides/us", stateSlug, `${citySlug}.json`);

const loadUsCityGuideForPrerender = (
  stateSlug: string,
  citySlug: string
): GuidePageData => {
  const sourcePath = getUsCityGuideSourcePath(stateSlug, citySlug);
  const raw = JSON.parse(readFileSync(sourcePath, "utf8")) as GuidePageData;
  return withResolvedGuideData(raw);
};

const renderGuideRoute = (route: GuideRoute) => {
  switch (route.kind) {
    case "guides-index":
      return <GuidesIndex />;
    case "us-index":
      return <UsGuidesIndex />;
    case "world-index":
      return <InternationalGuidesIndex />;
    case "us-state":
      return <StateGuideRoute params={{ stateSlug: route.stateSlug }} />;
    case "us-city":
      return (
        <GuidePageTemplate
          guide={loadUsCityGuideForPrerender(route.stateSlug, route.citySlug)}
        />
      );
    case "world-country":
      return <CountryGuideRoute params={{ countrySlug: route.countrySlug }} />;
    case "world-city":
      return (
        <CityGuideWorldRoute
          params={{
            countrySlug: route.countrySlug,
            citySlug: route.citySlug,
          }}
        />
      );
    case "paris-city":
      return <ParisGuideRoute />;
  }
};

const getExpectedVisibleTourCount = (route: GuideRoute): number => {
  if (route.kind === "us-city") {
    return getToursByCityUnified(route.stateSlug, route.citySlug).length;
  }

  let place: GuidePlace | null = null;
  if (route.kind === "us-state") {
    place = {
      type: "state",
      slug: route.stateSlug,
      name: titleCase(route.stateSlug),
    };
  } else if (route.kind === "world-country") {
    place = {
      type: "country",
      slug: route.countrySlug,
      name: titleCase(route.countrySlug),
    };
  } else if (route.kind === "world-city") {
    place = {
      type: "city",
      slug: route.citySlug,
      name: titleCase(route.citySlug),
      parentSlug: route.countrySlug,
      parentName: titleCase(route.countrySlug),
      regionType: "country",
    };
  }

  return place ? getTopToursForPlace(place, { min: 3, max: 8 }).length : 0;
};

const isRedirectOnlyWorldCityRoute = (route: GuideRoute) => {
  if (route.kind !== "world-city") {
    return false;
  }

  return Boolean(
    getInternationalGuideCityAlias(route.countrySlug, route.citySlug) ||
      getDestinationCityAlias(route.countrySlug, route.citySlug) ||
      getRetiredInternationalGuideRedirect(route.countrySlug, route.citySlug)
  );
};

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const sitemapFiles = (await readdir(distDir)).filter(
  file => file.startsWith("sitemap") && file.endsWith(".xml")
);

const routes = new Map<string, GuideRoute>();
for (const file of sitemapFiles) {
  const xml = await readFile(path.join(distDir, file), "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = new URL(match[1]).pathname.replace(/\/$/, "") || "/";
    const route = parseGuideRoute(pathname);
    if (route) routes.set(pathname, route);
  }
}

let rendered = 0;
let skipped = 0;
let missingSourceSkipped = 0;
let redirectOnlySkipped = 0;
let tourBearingGuideAudits = 0;
const missingSourceRoutes: string[] = [];
const redirectOnlyRoutes: string[] = [];
const failures: Array<{ pathname: string; message: string }> = [];

for (const [pathname, route] of routes) {
  const outputPath = outputPathFor(pathname);

  // Redirect-only aliases and explicitly retired international guides are not
  // canonical content pages. Do not require them to render a <main> or tour cards.
  if (isRedirectOnlyWorldCityRoute(route)) {
    redirectOnlySkipped += 1;
    redirectOnlyRoutes.push(pathname);
    continue;
  }

  // Legacy sitemap guide URLs without source JSON are retained as client-side
  // redirect/fallback routes. Every source-backed canonical guide is audited
  // below and must ship visible SSR content.
  if (
    route.kind === "us-city" &&
    !existsSync(getUsCityGuideSourcePath(route.stateSlug, route.citySlug))
  ) {
    missingSourceSkipped += 1;
    missingSourceRoutes.push(pathname);
    continue;
  }

  try {
    const template = await readFile(outputPath, "utf8");
    if (!template.includes(emptyRoot)) {
      skipped += 1;
      continue;
    }

    const app = (
      <React.StrictMode>
        <Router ssrPath={pathname}>
          <StructuredDataProvider>
            <Header />
            {renderGuideRoute(route)}
            <Footer />
          </StructuredDataProvider>
        </Router>
      </React.StrictMode>
    );

    const renderedApp = renderToString(app);
    if (!renderedApp.trim()) {
      throw new Error("SSR returned an empty React tree");
    }
    if (!renderedApp.includes("<main")) {
      throw new Error("SSR output does not contain visible page content");
    }
    if (renderedApp.includes("Guide not found")) {
      throw new Error("SSR rendered the Guide not found fallback");
    }

    const expectedVisibleTours = getExpectedVisibleTourCount(route);
    if (expectedVisibleTours > 0) {
      tourBearingGuideAudits += 1;
      if (!/(View Tour|View Rental|View tour)/.test(renderedApp)) {
        throw new Error(
          `guide has ${expectedVisibleTours} current/top tour(s) but SSR contains no visible tour cards`
        );
      }
    }

    if (route.kind === "paris-city" && !/View tour/i.test(renderedApp)) {
      throw new Error("Paris guide SSR contains no visible tour cards");
    }

    const html = template.replace(
      emptyRoot,
      `<div id="root">${renderedApp}</div>`
    );
    if (html.includes(emptyRoot)) {
      throw new Error("empty React root remains after prerender");
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html, "utf8");
    rendered += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ pathname, message });
    if (failures.length >= 20) break;
  }
}

if (redirectOnlyRoutes.length) {
  console.warn(
    `[prerender-guide-routes] ${redirectOnlyRoutes.length} international guide redirect route(s) were excluded from canonical content auditing:`
  );
  for (const pathname of redirectOnlyRoutes) {
    console.warn(`  ${pathname}`);
  }
}

if (missingSourceRoutes.length) {
  console.warn(
    `[prerender-guide-routes] ${missingSourceRoutes.length} legacy US guide route(s) have no matching source JSON and remain client-side redirect/fallback routes:`
  );
  for (const pathname of missingSourceRoutes) {
    console.warn(`  ${pathname}`);
  }
}

if (failures.length) {
  console.error("[prerender-guide-routes] failed routes:");
  for (const failure of failures) {
    console.error(`  ${failure.pathname}: ${failure.message}`);
  }
  throw new Error(
    `Guide route prerender failed for ${failures.length} route(s); refusing partial production output.`
  );
}

console.log(
  `[prerender-guide-routes] server-rendered ${rendered.toLocaleString()} canonical guide routes; audited ${tourBearingGuideAudits.toLocaleString()} tour-bearing state/city/country guides for visible SSR tour cards; skipped ${skipped.toLocaleString()} routes that already contained body content; ${redirectOnlySkipped.toLocaleString()} international redirect-only route(s) excluded from content auditing; ${missingSourceSkipped.toLocaleString()} legacy US guide route(s) remain client-side redirect/fallback routes; Paris now prerenders with visible tour content.`
);
