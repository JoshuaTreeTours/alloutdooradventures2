import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import {
  citiesByCountry,
  countriesWithTours,
  getEuropeCityTourEntries,
  getEuropeCountryTourEntries,
  type EuropeCitySummary,
  type EuropeCountrySummary,
} from "../src/data/europeIndex";
import type { UnifiedCityTour } from "../src/data/tours";
import EuropeIndex from "../src/pages/destinations/europe/EuropeIndex";
import EuropeCountryRoute from "../src/pages/destinations/europe/EuropeCountryRoute";
import EuropeCityRoute from "../src/pages/destinations/europe/EuropeCityRoute";
import EuropeCityToursRoute from "../src/pages/destinations/europe/EuropeCityToursRoute";

const distDir = path.resolve("dist");
const templatePath = path.join(distDir, "destinations", "index.html");
const destinationSitemapPath = path.join(distDir, "sitemap-destinations.xml");
const citySitemapPath = path.join(distDir, "sitemap-cities.xml");
const BASE_URL = (
  process.env.SITE_URL || "https://www.alloutdooradventures.com"
).replace(/\/+$/, "");
const EUROPE_ROOT = "/destinations/europe";

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

const replaceHead = ({
  html,
  title,
  description,
  canonical,
  image,
  structuredData,
}: {
  html: string;
  title: string;
  description: string;
  canonical: string;
  image: string;
  structuredData: unknown;
}) => {
  let output = html.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeAttribute(title)}</title>`
  );

  output = replaceOrInsertMeta(output, "name", "description", description);
  output = replaceOrInsertMeta(output, "property", "og:title", title);
  output = replaceOrInsertMeta(output, "property", "og:description", description);
  output = replaceOrInsertMeta(output, "property", "og:url", canonical);
  output = replaceOrInsertMeta(output, "name", "twitter:title", title);
  output = replaceOrInsertMeta(
    output,
    "name",
    "twitter:description",
    description
  );
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

  if (image) {
    output = replaceOrInsertMeta(output, "property", "og:image", image);
    output = replaceOrInsertMeta(output, "name", "twitter:image", image);
  }

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

const outputPathFor = (pathname: string) =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const absolute = (pathname: string) =>
  /^https?:\/\//i.test(pathname) ? pathname : `${BASE_URL}${pathname}`;

const firstImage = (entries: UnifiedCityTour[]) => {
  for (const entry of entries) {
    const tour = entry.tour;
    const image =
      tour.primaryImageUrl ||
      (typeof tour.heroImage === "string" ? tour.heroImage : "") ||
      tour.galleryImages?.[0] ||
      "";
    if (image) return image;
  }
  return `${BASE_URL}/hero.jpg`;
};

const breadcrumbList = (items: Array<{ name: string; path: string }>) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absolute(item.path),
  })),
});

const itemList = (items: Array<{ name: string; path: string }>) => ({
  "@type": "ItemList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "WebPage",
      name: item.name,
      url: absolute(item.path),
    },
  })),
});

type Target =
  | { kind: "root"; pathname: string }
  | { kind: "country"; pathname: string; country: EuropeCountrySummary }
  | {
      kind: "countryTours";
      pathname: string;
      country: EuropeCountrySummary;
    }
  | {
      kind: "city";
      pathname: string;
      country: EuropeCountrySummary;
      city: EuropeCitySummary;
    }
  | {
      kind: "cityTours";
      pathname: string;
      country: EuropeCountrySummary;
      city: EuropeCitySummary;
    };

if (!countriesWithTours.length) {
  throw new Error(
    "Europe destination prerender found no inventory-backed countries; refusing to publish homepage SEO on Europe routes."
  );
}

const targets: Target[] = [{ kind: "root", pathname: EUROPE_ROOT }];
for (const country of countriesWithTours) {
  const countryPath = `${EUROPE_ROOT}/${country.slug}`;
  targets.push({ kind: "country", pathname: countryPath, country });
  targets.push({
    kind: "countryTours",
    pathname: `${countryPath}/tours`,
    country,
  });

  for (const city of citiesByCountry[country.slug] ?? []) {
    const cityPath = `${countryPath}/cities/${city.slug}`;
    targets.push({ kind: "city", pathname: cityPath, country, city });
    targets.push({
      kind: "cityTours",
      pathname: `${cityPath}/tours`,
      country,
      city,
    });
  }
}

const expectedDestinationPaths = new Set(
  targets
    .filter(target =>
      ["root", "country", "countryTours"].includes(target.kind)
    )
    .map(target => target.pathname)
);
const expectedCityPaths = new Set(
  targets
    .filter(target => ["city", "cityTours"].includes(target.kind))
    .map(target => target.pathname)
);

const syncSitemapUrls = async ({
  filePath,
  expectedPaths,
  ownsPath,
}: {
  filePath: string;
  expectedPaths: Set<string>;
  ownsPath: (pathname: string) => boolean;
}) => {
  let xml = await readFile(filePath, "utf8");
  let removed = 0;

  xml = xml.replace(/<url>[\s\S]*?<\/url>\s*/g, block => {
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) return block;
    const pathname = new URL(loc).pathname.replace(/\/$/, "") || "/";
    if (ownsPath(pathname) && !expectedPaths.has(pathname)) {
      removed += 1;
      return "";
    }
    return block;
  });

  const additions = Array.from(expectedPaths)
    .filter(pathname => !xml.includes(`<loc>${absolute(pathname)}</loc>`))
    .map(
      pathname =>
        `  <url><loc>${absolute(pathname)}</loc><priority>0.6</priority></url>`
    );

  if (additions.length) {
    if (!xml.includes("</urlset>")) {
      throw new Error(`Cannot sync Europe routes in ${filePath}: missing </urlset>.`);
    }
    xml = xml.replace("</urlset>", `${additions.join("\n")}\n</urlset>`);
  }

  await writeFile(filePath, xml, "utf8");
  return { added: additions.length, removed };
};

const destinationSitemapStats = await syncSitemapUrls({
  filePath: destinationSitemapPath,
  expectedPaths: expectedDestinationPaths,
  ownsPath: pathname =>
    pathname === EUROPE_ROOT ||
    /^\/destinations\/europe\/[^/]+(?:\/tours)?$/.test(pathname),
});
const citySitemapStats = await syncSitemapUrls({
  filePath: citySitemapPath,
  expectedPaths: expectedCityPaths,
  ownsPath: pathname =>
    /^\/destinations\/europe\/[^/]+\/cities\/[^/]+(?:\/tours)?$/.test(
      pathname
    ),
});

const template = await readFile(templatePath, "utf8");
const emptyRootPattern = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
if (!emptyRootPattern.test(template)) {
  throw new Error(
    "Europe destination prerender template does not contain an empty React root."
  );
}

let rendered = 0;
let renderedCountries = 0;
let renderedCities = 0;

for (const target of targets) {
  const pathname = target.pathname;
  const canonical = absolute(pathname);
  let title = "Europe Tours & Activities | All Outdoor Adventures";
  let description =
    "Browse tours across Europe by country and city, compare guided experiences, and plan outdoor adventures with active local inventory.";
  let routeEntries: UnifiedCityTour[] = [];
  let image = `${BASE_URL}/hero.jpg`;
  let content: React.ReactNode = <EuropeIndex />;
  let breadcrumbs = [
    { name: "Destinations", path: "/destinations" },
    { name: "Europe", path: EUROPE_ROOT },
  ];
  let listItems = countriesWithTours.map(country => ({
    name: country.name,
    path: `${EUROPE_ROOT}/${country.slug}`,
  }));

  if (target.kind === "country" || target.kind === "countryTours") {
    const { country } = target;
    routeEntries = getEuropeCountryTourEntries(country.slug);
    image = country.image || firstImage(routeEntries);
    content = <EuropeCountryRoute params={{ countrySlug: country.slug }} />;
    breadcrumbs = [
      { name: "Destinations", path: "/destinations" },
      { name: "Europe", path: EUROPE_ROOT },
      {
        name: country.name,
        path: `${EUROPE_ROOT}/${country.slug}`,
      },
    ];

    if (target.kind === "country") {
      title = `${country.name} Tours & Activities | Europe`;
      description = `Explore active tours across ${country.name}, compare guided experiences by city, and plan outdoor adventures with trusted local operators.`;
      listItems = (citiesByCountry[country.slug] ?? []).map(city => ({
        name: city.name,
        path: `${EUROPE_ROOT}/${country.slug}/cities/${city.slug}`,
      }));
    } else {
      title = `Tours & Activities in ${country.name} | All Outdoor Adventures`;
      description = `Browse active tours and activities in ${country.name}, including guided city experiences, day trips, and outdoor adventures.`;
      breadcrumbs.push({ name: "Tours", path: pathname });
      listItems = routeEntries.map(entry => ({
        name: entry.tour.title,
        path: entry.href,
      }));
    }
  } else if (target.kind === "city" || target.kind === "cityTours") {
    const { country, city } = target;
    routeEntries = getEuropeCityTourEntries(country.slug, city.slug);
    image = city.image || firstImage(routeEntries);
    const cityPath = `${EUROPE_ROOT}/${country.slug}/cities/${city.slug}`;
    content =
      target.kind === "city" ? (
        <EuropeCityRoute
          params={{ countrySlug: country.slug, citySlug: city.slug }}
        />
      ) : (
        <EuropeCityToursRoute
          params={{ countrySlug: country.slug, citySlug: city.slug }}
        />
      );
    breadcrumbs = [
      { name: "Destinations", path: "/destinations" },
      { name: "Europe", path: EUROPE_ROOT },
      {
        name: country.name,
        path: `${EUROPE_ROOT}/${country.slug}`,
      },
      { name: city.name, path: cityPath },
    ];
    listItems = routeEntries.map(entry => ({
      name: entry.tour.title,
      path: entry.href,
    }));

    if (target.kind === "city") {
      title = `${city.name}, ${country.name} Outdoor Guide | All Outdoor Adventures`;
      description = `Discover tours, attractions, and outdoor experiences in ${city.name}, ${country.name}, with active local inventory and trip-planning ideas.`;
    } else {
      title = `${city.name} Tours & Activities | ${country.name}`;
      description = `Find tours in ${city.name}, ${country.name}, including guided city experiences, day trips, attractions, and outdoor adventures.`;
      breadcrumbs.push({ name: "Tours", path: pathname });
    }
  }

  if (target.kind !== "root" && !routeEntries.length) {
    throw new Error(`${pathname} has no backing European tour inventory.`);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical,
        url: canonical,
        name: title,
        description,
        ...(image ? { image } : {}),
      },
      breadcrumbList(breadcrumbs),
      itemList(listItems),
    ],
  };

  const app = (
    <Router ssrPath={pathname}>
      <StructuredDataProvider>
        <Header />
        {content}
        <Footer />
      </StructuredDataProvider>
    </Router>
  );
  const renderedApp = renderToString(app);

  if (!renderedApp.includes("<main")) {
    throw new Error(`${pathname} did not render visible page content.`);
  }
  if (
    renderedApp.includes("Destination not found") ||
    renderedApp.includes("City not found") ||
    renderedApp.includes("Tours not found")
  ) {
    throw new Error(`${pathname} rendered a not-found destination surface.`);
  }

  // Match the Canada integrity pass: route-backed inventory must exist and
  // the destination surface must render real, route-specific content, but do
  // not require one literal CTA label. Europe can legitimately contain
  // rental-only inventory ("View Rental") and some legacy city listings hide
  // rentals from the tour grid while still rendering a valid destination hub.
  // The canonical/title/schema/not-found checks below remain fail-closed.

  let html = replaceHead({
    html: template,
    title,
    description,
    canonical,
    image,
    structuredData,
  });
  html = html.replace(
    emptyRootPattern,
    `<div id="root">${renderedApp}</div>`
  );

  if (emptyRootPattern.test(html)) {
    throw new Error(`${pathname} still contains an empty React root.`);
  }
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
    throw new Error(`${pathname} did not retain its route-specific canonical.`);
  }
  if (
    pathname !== "/" &&
    html.includes(`<link rel="canonical" href="${BASE_URL}/"`)
  ) {
    throw new Error(`${pathname} still contains the homepage canonical.`);
  }
  if (!html.includes('id="structured-data"')) {
    throw new Error(`${pathname} is missing structured data.`);
  }

  const outputPath = outputPathFor(pathname);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
  rendered += 1;
  if (target.kind === "country" || target.kind === "countryTours") {
    renderedCountries += 1;
  }
  if (target.kind === "city" || target.kind === "cityTours") {
    renderedCities += 1;
  }
}

const expectedPaths = new Set(targets.map(target => target.pathname));
for (const pathname of expectedPaths) {
  const html = await readFile(outputPathFor(pathname), "utf8");
  const canonical = absolute(pathname);
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
    throw new Error(`Europe audit failed canonical verification for ${pathname}.`);
  }
  if (html.includes("All Outdoor Adventures | Tours, Guides & Outdoor Experiences")) {
    throw new Error(`Europe audit found homepage title leakage at ${pathname}.`);
  }
}

const totalCities = Object.values(citiesByCountry).reduce(
  (total, cities) => total + cities.length,
  0
);
console.log(
  `[prerender-europe-destination-routes] audited ${countriesWithTours.length.toLocaleString()} inventory-backed countries and ${totalCities.toLocaleString()} cities; rendered ${rendered.toLocaleString()} Europe pages (${renderedCountries.toLocaleString()} country surfaces, ${renderedCities.toLocaleString()} city surfaces). Sitemap sync: destinations +${destinationSitemapStats.added}/-${destinationSitemapStats.removed}, cities +${citySitemapStats.added}/-${citySitemapStats.removed}.`
);
