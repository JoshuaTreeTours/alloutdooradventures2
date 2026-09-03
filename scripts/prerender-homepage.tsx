import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Footer from "../src/components/Footer";
import Header from "../src/components/Header";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import Home from "../src/pages/Home";

const outputPath = path.resolve("dist/index.html");
const emptyRoot = '<div id="root"></div>';

const homepage = (
  <React.StrictMode>
    <Router ssrPath="/">
      <StructuredDataProvider>
        <Header />
        <Home />
        <Footer />
      </StructuredDataProvider>
    </Router>
  </React.StrictMode>
);

const template = await readFile(outputPath, "utf8");

if (!template.includes(emptyRoot)) {
  throw new Error(
    "Homepage prerender expected one empty React root in dist/index.html."
  );
}

if (template.includes('id="manus-runtime"')) {
  throw new Error("Development Manus runtime leaked into the production HTML.");
}

const renderedHomepage = renderToString(homepage);

if (!renderedHomepage.includes("Find Your Next Adventure")) {
  throw new Error("Homepage prerender did not contain the existing hero heading.");
}

if (!renderedHomepage.includes("Featured Best Selling Tours")) {
  throw new Error("Homepage prerender did not contain the existing tour section.");
}

const output = template.replace(
  emptyRoot,
  `<div id="root">${renderedHomepage}</div>`
);

await writeFile(outputPath, output, "utf8");

console.log(
  `[prerender-homepage] wrote ${renderedHomepage.length.toLocaleString()} characters of existing homepage content to dist/index.html.`
);
