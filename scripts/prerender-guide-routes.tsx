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
import GuidePageTemplate from "../src/templates/GuidePageTemplate";
import type { GuidePageData } from "../src/utils/loadGuide";
import { withResolvedGuideData } from "../src/utils/guides/loadGuide";

const distDir = path.resolve("dist");
const emptyRoot = '<div id="root"></div>';
const parisGuidePath = "/guides/world/france/paris";

type GuideRoute =
  | { kind: "guides-index" }
  | { kind: "us-index" }
  | { kind: "world-index" }
  | { kind: "us-state"; stateSlug: string }
  | { kind: "us-city"; stateSlug: string; citySlug: string }
  | { kind: "world-country"; countrySlug: string }
  | { kind: "world-city"; countrySlug: string; citySlug: string };

const parseGuideRoute = (pathname: string): GuideRoute | null => {
  if (pathname === "/guides") return { kind: "guides-index" };
  if (pathname === "/guides/us") return { kind: "us-index" };
  if (pathname === "/guides/world") return { kind: "world-index" };

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
  }
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
    if (pathname === parisGuidePath) continue;
    const route = parseGuideRoute(pathname);
    if (route) routes.set(pathname, route);
  }
}

let rendered = 0;
let skipped = 0;
let missingSourceSkipped = 0;
const missingSourceRoutes: string[] = [];
const failures: Array<{ pathname: string; message: string }> = [];

for (const [pathname, route] of routes) {
  const outputPath = outputPathFor(pathname);

  // Some legacy sitemap guide URLs do not have a matching source JSON file.
  // They were already client-rendered before guide SSR was added, so preserve
  // that behavior instead of allowing a stale sitemap/data mismatch to abort
  // the entire production deployment. Unexpected SSR failures remain fatal.
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
    if (renderedApp.includes("Guide not found")) {
      throw new Error("SSR rendered the Guide not found fallback");
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      template.replace(emptyRoot, `<div id="root">${renderedApp}</div>`),
      "utf8"
    );
    rendered += 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ pathname, message });
    if (failures.length >= 20) break;
  }
}

if (missingSourceRoutes.length) {
  console.warn(
    `[prerender-guide-routes] left ${missingSourceRoutes.length} US guide route(s) client-rendered because no matching source JSON exists:`
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
  `[prerender-guide-routes] server-rendered ${rendered.toLocaleString()} canonical guide routes; skipped ${skipped.toLocaleString()} routes that already contained body content; left ${missingSourceSkipped.toLocaleString()} US guide route(s) client-rendered because source JSON is absent; left ${parisGuidePath} client-rendered because its dedicated route depends on Vite-only import.meta.glob.`
);
