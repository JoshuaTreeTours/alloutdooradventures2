import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import ActivityToursPage from "../src/pages/tours/ActivityToursPage";
import { getActivityDiscoveryRouteDefinitions } from "../src/data/activityDiscovery";
import { applyRouteSeo } from "../src/lib/fallbackSeoEmitter";

const distDir = path.resolve("dist");
const rootTemplatePath = path.join(distDir, "index.html");
const emptyRoot = '<div id="root"></div>';
const SITE = "https://www.alloutdooradventures.com";

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const titleCase = (value: string) =>
  value.replace(/-/g, " ").replace(/\b\w/g, character => character.toUpperCase());

const buildActivityFallbackSeo = (pathname: string) => {
  const label = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map(titleCase)
    .join(" / ");

  return {
    title: `${label} | All Outdoor Adventures`,
    description: `Explore ${label} with All Outdoor Adventures.`,
    url: `${SITE}${pathname}`,
    image: "",
  };
};

const rootTemplate = await readFile(rootTemplatePath, "utf8");
const routeDefinitions = getActivityDiscoveryRouteDefinitions();

let rendered = 0;
let createdShells = 0;
let skipped = 0;
const failures: Array<{ pathname: string; message: string }> = [];

for (const route of routeDefinitions) {
  const pathname = route.path;
  const outputPath = outputPathFor(pathname);

  try {
    let template: string;

    try {
      template = await readFile(outputPath, "utf8");
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code ?? "")
          : "";

      if (code !== "ENOENT") {
        throw error;
      }

      // Activity route definitions are the application's canonical activity
      // inventory. Some valid state/city routes are intentionally absent from
      // the category sitemap allowlist, so ensure-prerendered-route-files does
      // not create their HTML shells. Create only those known canonical route
      // files here, with the same generic route SEO fallback used by the route
      // file generator, then SSR the existing ActivityToursPage into the root.
      await mkdir(path.dirname(outputPath), { recursive: true });
      template = applyRouteSeo(rootTemplate, buildActivityFallbackSeo(pathname));
      await writeFile(outputPath, template, "utf8");
      createdShells += 1;
    }

    if (!template.includes(emptyRoot)) {
      skipped += 1;
      continue;
    }

    const app = (
      <React.StrictMode>
        <Router ssrPath={pathname}>
          <StructuredDataProvider>
            <Header />
            <ActivityToursPage params={route.params} />
            <Footer />
          </StructuredDataProvider>
        </Router>
      </React.StrictMode>
    );

    const renderedApp = renderToString(app);
    if (!renderedApp.trim()) {
      throw new Error("SSR returned an empty React tree");
    }

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

if (failures.length) {
  console.error("[prerender-activity-routes] failed routes:");
  for (const failure of failures) {
    console.error(`  ${failure.pathname}: ${failure.message}`);
  }
  throw new Error(
    `Activity route prerender failed for ${failures.length} route(s); refusing partial production output.`
  );
}

console.log(
  `[prerender-activity-routes] server-rendered ${rendered.toLocaleString()} canonical activity discovery routes; created ${createdShells.toLocaleString()} missing canonical route shells; skipped ${skipped.toLocaleString()} routes that already contained body content.`
);
