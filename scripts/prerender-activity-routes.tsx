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

const distDir = path.resolve("dist");
const emptyRoot = '<div id="root"></div>';

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const routeDefinitions = getActivityDiscoveryRouteDefinitions();

let rendered = 0;
let skipped = 0;
const failures: Array<{ pathname: string; message: string }> = [];

for (const route of routeDefinitions) {
  const pathname = route.path;
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
  `[prerender-activity-routes] server-rendered ${rendered.toLocaleString()} canonical activity discovery routes; skipped ${skipped.toLocaleString()} routes that already contained body content.`
);
