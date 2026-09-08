import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { Router } from "wouter";

import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { StructuredDataProvider } from "../src/components/StructuredDataProvider";
import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTours,
  type Engine2CanadaProvinceIndexEntry,
  type Engine2Tour,
} from "../src/engine2/data/loadEngine2";
import CanadaCountryRoute from "../src/pages/destinations/world/CanadaCountryRoute";
import CanadaProvinceRoute from "../src/pages/destinations/world/CanadaProvinceRoute";
import CanadaCityRoute from "../src/pages/destinations/world/CanadaCityRoute";

const distDir = path.resolve("dist");
const templatePath = path.join(distDir, "destinations", "index.html");
const destinationSitemapPath = path.join(distDir, "sitemap-destinations.xml");
const citySitemapPath = path.join(distDir, "sitemap-cities.xml");
const BASE_URL = (
  process.env.SITE_URL || "https://www.alloutdooradventures.com"
).replace(/\/+$/, "");

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

const absolute = (pathname: string) => `${BASE_URL}${pathname}`;

const firstImage = (tours: Engine2Tour[]) => {
  for (const tour of tours) {
    const image =
      tour.images?.hero || tour.images?.gallery?.[0] || tour.seo?.ogImage || "";
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
  | { kind: "country"; pathname: string }
  | {
      kind: "province";
      pathname: string;
      province: Engine2CanadaProvinceIndexEntry;
    }
  | {
      kind: "city";
      pathname: string;
      province: Engine2CanadaProvinceIndexEntry;
      city: Engine2CanadaProvinceIndexEntry["cities"][number];
    };

const provinces = getEngine2CanadaProvinceIndex();
const canadaTours = getEngine2CanadaTours();

if (!provinces.length) {
  throw new Error(
    "Canada destination prerender found no province index; refusing to publish homepage SEO on Canada routes."
  );
}

const targets: Target[] = [{ kind: "country", pathname: "/destinations/world/canada" }];
for (const province of provinces) {
  targets.push({
    kind: "province",
    pathname: `/destinations/world/canada/${province.provinceSlug}`,
    province,
  });
  for (const city of province.cities) {
    targets.push({
      kind: "city",
      pathname: `/destinations/world/canada/${province.provinceSlug}/${city.citySlug}`,
      province,
      city,
    });
  }
}

const appendSitemapUrls = async (filePath: string, paths: string[]) => {
  let xml = await readFile(filePath, "utf8");
  const additions = paths
    .filter(pathname => !xml.includes(`<loc>${absolute(pathname)}</loc>`))
    .map(
      pathname =>
        `  <url><loc>${absolute(pathname)}</loc><priority>0.6</priority></url>`
    );

  if (!additions.length) return 0;
  if (!xml.includes("</urlset>")) {
    throw new Error(`Cannot append Canada routes to ${filePath}: missing </urlset>.`);
  }
  xml = xml.replace("</urlset>", `${additions.join("\n")}\n</urlset>`);
  await writeFile(filePath, xml, "utf8");
  return additions.length;
};

const provincePaths = targets
  .filter((target): target is Extract<Target, { kind: "province" }> =>
    target.kind === "province"
  )
  .map(target => target.pathname);
const cityPaths = targets
  .filter((target): target is Extract<Target, { kind: "city" }> =>
    target.kind === "city"
  )
  .map(target => target.pathname);

const addedDestinationUrls = await appendSitemapUrls(destinationSitemapPath, [
  "/destinations/world/canada",
  ...provincePaths,
]);
const addedCityUrls = await appendSitemapUrls(citySitemapPath, cityPaths);

const template = await readFile(templatePath, "utf8");
const emptyRootPattern = /<div\s+id=["']root["']\s*>\s*<\/div>/i;
if (!emptyRootPattern.test(template)) {
  throw new Error(
    "Canada destination prerender template does not contain an empty React root."
  );
}

let rendered = 0;
for (const target of targets) {
  const pathname = target.pathname;
  const canonical = absolute(pathname);
  let title = "Canada Tours & Activities | All Outdoor Adventures";
  let description =
    "Browse Canada tours by province and city, compare activities, and find curated outdoor experiences for every season and travel style.";
  let routeTours = canadaTours;
  let content: React.ReactNode = <CanadaCountryRoute />;
  let breadcrumbs = [
    { name: "Destinations", path: "/destinations" },
    { name: "Canada", path: "/destinations/world/canada" },
  ];
  let listItems = provinces.map(province => ({
    name: province.provinceName,
    path: `/destinations/world/canada/${province.provinceSlug}`,
  }));

  if (target.kind === "province") {
    const { province } = target;
    title = `${province.provinceName} Tours & Activities | Canada`;
    description = `Browse tours in ${province.provinceName}, compare top activities by city, and find guided outdoor experiences for your Canada itinerary.`;
    routeTours = canadaTours.filter(
      tour => tour.sourceProvinceSlug === province.provinceSlug
    );
    content = <CanadaProvinceRoute params={{ province: province.provinceSlug }} />;
    breadcrumbs = [
      { name: "Destinations", path: "/destinations" },
      { name: "Canada", path: "/destinations/world/canada" },
      { name: province.provinceName, path: pathname },
    ];
    listItems = province.cities.map(city => ({
      name: city.cityName,
      path: `/destinations/world/canada/${province.provinceSlug}/${city.citySlug}`,
    }));
  } else if (target.kind === "city") {
    const { province, city } = target;
    title = `${city.cityName} Tours & Activities | Canada`;
    description = `Find tours in ${city.cityName}, ${province.provinceName}, including outdoor adventures, attractions, and guided experiences matched to your travel plans.`;
    routeTours = canadaTours.filter(
      tour =>
        tour.sourceProvinceSlug === province.provinceSlug &&
        tour.sourceCitySlug === city.citySlug
    );
    content = (
      <CanadaCityRoute
        params={{ province: province.provinceSlug, city: city.citySlug }}
      />
    );
    breadcrumbs = [
      { name: "Destinations", path: "/destinations" },
      { name: "Canada", path: "/destinations/world/canada" },
      {
        name: province.provinceName,
        path: `/destinations/world/canada/${province.provinceSlug}`,
      },
      { name: city.cityName, path: pathname },
    ];
    listItems = routeTours.map(tour => ({
      name: tour.name,
      path: tour.seo.canonicalPath,
    }));
  }

  if (target.kind !== "country" && !routeTours.length) {
    throw new Error(`${pathname} has no backing Canada tour inventory.`);
  }

  const image = firstImage(routeTours);
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
  if (!renderedApp.includes("<main") || renderedApp.includes("Destination not found")) {
    throw new Error(`${pathname} did not render valid visible destination content.`);
  }

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
  if (!html.includes(`<title>${escapeAttribute(title)}</title>`)) {
    throw new Error(`${pathname} does not contain its Canada-specific title.`);
  }
  if (!html.includes(`rel="canonical" href="${escapeAttribute(canonical)}"`)) {
    throw new Error(`${pathname} does not contain its self-canonical URL.`);
  }
  if (html.includes(`rel="canonical" href="${BASE_URL}/"`)) {
    throw new Error(`${pathname} still carries the homepage canonical.`);
  }

  const outputPath = outputPathFor(pathname);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
  rendered += 1;
}

console.log(
  `[prerender-canada-destination-routes] rendered ${rendered.toLocaleString()} Canada country/province/city destination routes with route-specific HTML, added ${addedDestinationUrls.toLocaleString()} destination sitemap URL(s) and ${addedCityUrls.toLocaleString()} city sitemap URL(s).`
);
