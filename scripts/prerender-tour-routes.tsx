import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import App from "../src/App";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";

const distDir = path.resolve("dist");
const emptyRoot = '<div id="root"></div>';

const isTourDetailPath = (pathname: string) =>
  /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+$/.test(pathname) ||
  /^\/destinations\/states\/[^/]+\/cities\/[^/]+\/tours\/[^/]+$/.test(pathname) ||
  /^\/destinations\/world\/[^/]+\/[^/]+\/[^/]+\/tours\/[^/]+$/.test(pathname) ||
  /^\/destinations\/europe\/[^/]+\/cities\/[^/]+\/tours\/[^/]+$/.test(pathname) ||
  /^\/tours\/[^/]+\/[^/]+\/[^/]+$/.test(pathname) ||
  /^\/tours\/[^/]+$/.test(pathname);

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const sitemapFiles = (await readdir(distDir)).filter(
  file => file.startsWith("sitemap") && file.endsWith(".xml")
);

const paths = new Set<string>();
for (const file of sitemapFiles) {
  const xml = await readFile(path.join(distDir, file), "utf8");
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const pathname = new URL(match[1]).pathname;
    if (isTourDetailPath(pathname)) paths.add(pathname);
  }
}

let rendered = 0;
let skipped = 0;
const failures: Array<{ pathname: string; message: string }> = [];

for (const pathname of paths) {
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
            <App />
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
  `[prerender-tour-routes] server-rendered ${rendered.toLocaleString()} tour routes; skipped ${skipped.toLocaleString()} routes that already contained body content.`
);
