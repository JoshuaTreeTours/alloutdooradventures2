import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import CityTourDetailRoute from "../src/pages/destinations/states/tours/CityTourDetailRoute";

const distDir = path.resolve("dist");
const emptyRoot = '<div id="root"></div>';

type TourRouteParams = {
  stateSlug: string;
  citySlug: string;
  tourSlug: string;
};

const parseTourRoute = (pathname: string): TourRouteParams | null => {
  const patterns = [
    /^\/destinations\/states\/([^/]+)\/cities\/([^/]+)\/tours\/([^/]+)$/,
    /^\/destinations\/united-states\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/,
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(pathname);
    if (match) {
      return {
        stateSlug: match[1],
        citySlug: match[2],
        tourSlug: match[3],
      };
    }
  }

  return null;
};

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const sitemapFiles = (await readdir(distDir)).filter(
  file => file.startsWith("sitemap") && file.endsWith(".xml")
);

const routes = new Map<string, TourRouteParams>();
for (const file of sitemapFiles) {
  const xml = await readFile(path.join(distDir, file), "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = new URL(match[1]).pathname;
    const params = parseTourRoute(pathname);
    if (params) routes.set(pathname, params);
  }
}

let rendered = 0;
let skipped = 0;
const failures: Array<{ pathname: string; message: string }> = [];

for (const [pathname, params] of routes) {
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
            <CityTourDetailRoute params={params} />
            <Footer />
          </StructuredDataProvider>
        </Router>
      </React.StrictMode>
    );

    const renderedApp = renderToString(app);
    if (!renderedApp.trim()) {
      throw new Error("SSR returned an empty React tree");
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(
      outputPath,
      template.replace(emptyRoot, `<div id="root">${renderedApp}</div>`),
      "utf8"
    );
    rendered += 1;
  } catch (error) {
    failures.push({
      pathname,
      message: error instanceof Error ? error.message : String(error),
    });
    if (failures.length >= 20) break;
  }
}

if (failures.length) {
  console.error("[prerender-tour-routes] failed routes:");
  for (const failure of failures) {
    console.error(`  ${failure.pathname}: ${failure.message}`);
  }
  throw new Error(
    `Tour route prerender failed for ${failures.length} route(s); refusing partial production output.`
  );
}

console.log(
  `[prerender-tour-routes] server-rendered ${rendered.toLocaleString()} canonical tour routes; skipped ${skipped.toLocaleString()} routes that already contained body content.`
);
