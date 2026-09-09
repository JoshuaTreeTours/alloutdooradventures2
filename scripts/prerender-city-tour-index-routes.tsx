import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import { getToursByCityUnified } from "../src/data/tours";
import CityToursIndexRoute from "../src/pages/destinations/states/tours/CityToursIndexRoute";
import WorldCityToursRoute from "../src/pages/destinations/world/WorldCityToursRoute";
import EuropeCityToursRoute from "../src/pages/destinations/europe/EuropeCityToursRoute";

const distDir = path.resolve("dist");
const sitemapPath = path.join(distDir, "sitemap-cities.xml");
const fallbackTemplatePath = path.join(distDir, "destinations", "index.html");
const emptyRootPattern = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
const FLAGSTAFF_PATH = "/destinations/arizona/flagstaff/tours";
const PARIS_PATH = "/destinations/europe/france/cities/paris/tours";
const SITE = (
  process.env.SITE_URL || "https://www.alloutdooradventures.com"
).replace(/\/+$/, "");

type CityTourIndexRoute =
  | { kind: "us"; stateSlug: string; citySlug: string }
  | { kind: "world"; countrySlug: string; citySlug: string }
  | { kind: "europe"; countrySlug: string; citySlug: string };

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const absolute = (pathname: string) =>
  /^https?:\/\//i.test(pathname) ? pathname : `${SITE}${pathname}`;

const escapeAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceOrInsertMeta = (
  html: string,
  attrName: "name" | "property",
  attrValue: string,
  content: string
) => {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}\\s*=\\s*["']${escapeRegExp(
      attrValue
    )}["'][^>]*>`,
    "i"
  );
  const tag = `<meta ${attrName}="${escapeAttribute(
    attrValue
  )}" content="${escapeAttribute(content)}" />`;
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `  ${tag}\n</head>`);
};

const replaceParisHead = (html: string) => {
  const title = "Paris Tours & Activities | Outdoor Adventures";
  const description =
    "Find tours and activities in Paris, France, including guided city experiences, day trips, and outdoor adventures tailored to your travel plans.";
  const canonical = absolute(PARIS_PATH);
  const parisTours = getToursByCityUnified("france", "paris");
  const image =
    parisTours
      .map(({ tour }) =>
        tour.primaryImageUrl ||
        (typeof tour.heroImage === "string" ? tour.heroImage : "")
      )
      .find(Boolean) || `${SITE}/hero.jpg`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: title,
        description,
        image,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Destinations",
            item: absolute("/destinations"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "France",
            item: absolute("/destinations/europe/france"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Paris",
            item: absolute("/destinations/europe/france/cities/paris"),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Tours",
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: parisTours.map(({ tour, href }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebPage",
            name: tour.title,
            url: absolute(href),
          },
        })),
      },
    ],
  };

  let output = html.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(title)}</title>`
  );
  output = replaceOrInsertMeta(output, "name", "description", description);
  output = replaceOrInsertMeta(output, "property", "og:title", title);
  output = replaceOrInsertMeta(output, "property", "og:description", description);
  output = replaceOrInsertMeta(output, "property", "og:url", canonical);
  output = replaceOrInsertMeta(output, "property", "og:image", image);
  output = replaceOrInsertMeta(output, "name", "twitter:title", title);
  output = replaceOrInsertMeta(
    output,
    "name",
    "twitter:description",
    description
  );
  output = replaceOrInsertMeta(output, "name", "twitter:image", image);
  output = replaceOrInsertMeta(
    output,
    "name",
    "robots",
    "index,follow,max-image-preview:large"
  );
  output = replaceOrInsertMeta(
    output,
    "name",
    "googlebot",
    "index,follow,max-image-preview:large"
  );

  const canonicalTag = `<link rel="canonical" href="${escapeAttribute(
    canonical
  )}" />`;
  const canonicalPattern =
    /<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/i;
  output = canonicalPattern.test(output)
    ? output.replace(canonicalPattern, canonicalTag)
    : output.replace("</head>", `  ${canonicalTag}\n</head>`);

  const structuredDataTag = `<script id="structured-data" type="application/ld+json">${JSON.stringify(
    structuredData
  ).replace(/</g, "\\u003c")}</script>`;
  const structuredDataPattern =
    /<script[^>]*id=["']structured-data["'][^>]*>[\s\S]*?<\/script>/i;
  output = structuredDataPattern.test(output)
    ? output.replace(structuredDataPattern, structuredDataTag)
    : output.replace("</head>", `  ${structuredDataTag}\n</head>`);

  return output;
};

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

let sitemap = await readFile(sitemapPath, "utf8");
const parisLoc = `<loc>${absolute(PARIS_PATH)}</loc>`;
if (!sitemap.includes(parisLoc)) {
  if (!sitemap.includes("</urlset>")) {
    throw new Error(
      "Cannot add the canonical Paris city-tour route to sitemap-cities.xml: missing </urlset>."
    );
  }
  sitemap = sitemap.replace(
    "</urlset>",
    `  <url>${parisLoc}<priority>0.6</priority></url>\n</urlset>`
  );
  await writeFile(sitemapPath, sitemap, "utf8");
  console.log(
    `[prerender-city-tour-index-routes] added ${PARIS_PATH} to sitemap-cities.xml.`
  );
}

const pathnames = Array.from(
  new Set(
    Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
      .map(match => new URL(match[1]).pathname.replace(/\/$/, "") || "/")
      .filter(pathname => pathname.endsWith("/tours"))
  )
);

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
    let template: string;
    try {
      template = await readFile(outputPath, "utf8");
    } catch (error) {
      if (pathname !== PARIS_PATH) {
        throw error;
      }
      template = await readFile(fallbackTemplatePath, "utf8");
      await mkdir(path.dirname(outputPath), { recursive: true });
    }

    if (!emptyRootPattern.test(template)) {
      if (pathname === PARIS_PATH) {
        throw new Error(
          "Paris prerender template does not contain an empty React root"
        );
      }
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
    if (pathname === PARIS_PATH) {
      if (!hasVisibleTourCard) {
        throw new Error("Paris SSR did not render any visible tour cards");
      }
      if (!renderedApp.includes("All Tours in Paris")) {
        throw new Error("Paris SSR did not render the Paris city heading");
      }
    }

    let html = template.replace(
      emptyRootPattern,
      `<div id="root">${renderedApp}</div>`
    );
    if (emptyRootPattern.test(html)) {
      throw new Error("empty React root remains after prerender");
    }

    if (pathname === PARIS_PATH) {
      html = replaceParisHead(html);
      const canonical = absolute(PARIS_PATH);
      if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
        throw new Error("Paris prerender did not retain its canonical URL");
      }
      if (html.includes(`<link rel="canonical" href="${SITE}/"`)) {
        throw new Error("Paris prerender still contains the homepage canonical");
      }
      if (!html.includes("Paris Tours &amp; Activities")) {
        throw new Error("Paris prerender did not retain route-specific SEO title");
      }
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
  `[prerender-city-tour-index-routes] server-rendered ${rendered.toLocaleString()} canonical city-tour listing routes; skipped ${skipped.toLocaleString()} routes that already contained body content; Flagstaff and Paris include visible tour cards.`
);

// Canada has a special province/city route hierarchy that is not covered by
// the generic /destinations/world/:country/cities/:city prerender. Render it
// now so Canada hubs never inherit the homepage title/canonical in view-source.
await import("./prerender-canada-destination-routes.tsx");
