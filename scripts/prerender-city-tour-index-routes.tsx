import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import CityToursIndexRoute from "../src/pages/destinations/states/tours/CityToursIndexRoute";
import WorldCityToursRoute from "../src/pages/destinations/world/WorldCityToursRoute";
import EuropeCityToursRoute from "../src/pages/destinations/europe/EuropeCityToursRoute";

const distDir = path.resolve("dist");
const sitemapPath = path.join(distDir, "sitemap-cities.xml");
const emptyRoot = '<div id="root"></div>';
const FLAGSTAFF_PATH = "/destinations/arizona/flagstaff/tours";

type CityTourIndexRoute =
  | { kind: "us"; stateSlug: string; citySlug: string }
  | { kind: "world"; countrySlug: string; citySlug: string }
  | { kind: "europe"; countrySlug: string; citySlug: string };

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const parseRoute = (pathname: string): CityTourIndexRoute | null => {
  let match = /^\/destinations\/europe\/([^/]+)\/cities\/([^/]+)\/tours$/.exec(
    pathname
  );
  if (match) {
    return { kind: "europe", countrySlug: match[1], citySlug: match[2] };
  }

  match = /^\/destinations\/world\/([^/]+)\/cities\/([^/]+)\/tours$/.exec(
    pathname
  );
  if (match) {
    return { kind: "world", countrySlug: match[1], citySlug: match[2] };
  }

  match = /^\/destinations\/([^/]+)\/([^/]+)\/tours$/.exec(pathname);
  if (match) {
    return { kind: "us", stateSlug: match[1], citySlug: match[2] };
  }

  return null;
};

const renderRoute = (route: CityTourIndexRoute) => {
  switch (route.kind) {
    case "us":
      return (
        <CityToursIndexRoute
          params={{ stateSlug: route.stateSlug, citySlug: route.citySlug }}
        />
      );
    case "world":
      return (
        <WorldCityToursRoute
          params={{ countrySlug: route.countrySlug, citySlug: route.citySlug }}
        />
      );
    case "europe":
      return (
        <EuropeCityToursRoute
          params={{ countrySlug: route.countrySlug, citySlug: route.citySlug }}
        />
      );
  }
};

const sitemap = await readFile(sitemapPath, "utf8");
const pathnames = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
  .map(match => new URL(match[1]).pathname.replace(/\/$/, "") || "/")
  .filter(pathname => pathname.endsWith("/tours"));

let rendered = 0;
let skipped = 0;
let noVisibleTourCards = 0;
const noVisibleTourCardPaths: string[] = [];
const failures: Array<{ pathname: string; message: string }> = [];

for (const pathname of pathnames) {
  const route = parseRoute(pathname);
  if (!route) {
    failures.push({ pathname, message: "unsupported canonical city-tour route shape" });
    continue;
  }

  const outputPath = outputPathFor(pathname);

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
            {renderRoute(route)}
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

    const hasVisibleTourCard = renderedApp.includes("View Tour");
    if (!hasVisibleTourCard) {
      noVisibleTourCards += 1;
      noVisibleTourCardPaths.push(pathname);
    }

    if (pathname === FLAGSTAFF_PATH && !hasVisibleTourCard) {
      throw new Error("Flagstaff SSR did not render any visible tour cards");
    }

    const html = template.replace(
      emptyRoot,
      `<div id="root">${renderedApp}</div>`
    );
    if (html.includes(emptyRoot)) {
      throw new Error("empty React root remains after prerender");
    }

    await writeFile(outputPath, html, "utf8");
    rendered += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ pathname, message });
    if (failures.length >= 25) break;
  }
}

if (failures.length) {
  console.error("[prerender-city-tour-index-routes] failed routes:");
  for (const failure of failures) {
    console.error(`  ${failure.pathname}: ${failure.message}`);
  }
  throw new Error(
    `City-tour index prerender failed for ${failures.length} route(s); refusing partial production output.`
  );
}

if (noVisibleTourCardPaths.length) {
  console.warn(
    `[prerender-city-tour-index-routes] ${noVisibleTourCards.toLocaleString()} canonical city-tour route(s) rendered page content but no visible tour cards. These are retained for review because the page may currently contain only filtered, rental, or unavailable inventory.`
  );
  for (const pathname of noVisibleTourCardPaths.slice(0, 50)) {
    console.warn(`  ${pathname}`);
  }
}

console.log(
  `[prerender-city-tour-index-routes] server-rendered ${rendered.toLocaleString()} canonical city-tour listing routes; skipped ${skipped.toLocaleString()} routes that already contained body content; Flagstaff includes visible tour cards.`
);
