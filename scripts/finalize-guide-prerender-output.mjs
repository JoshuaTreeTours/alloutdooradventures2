import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { tsImport } from "tsx/esm/api";

const SITE = "https://www.alloutdooradventures.com";
const distDir = path.resolve("dist");
const sitemapPath = path.join(distDir, "sitemap-guides.xml");
const usGuideSourceRoot = path.resolve("src/data/guides/us");
const currentYearModule = await tsImport("../src/lib/seo/currentYear.ts", import.meta.url);
const CURRENT_YEAR = currentYearModule.CURRENT_YEAR;

const titleCase = value =>
  value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const outputPathFor = pathname =>
  path.join(distDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");

const replaceTitle = (html, value) =>
  html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${value}</title>`);

const replaceMetaContent = (html, attrName, attrValue, value) => {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*>`,
    "i"
  );
  return html.replace(pattern, tag => {
    if (/content=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/content=["'][^"']*["']/i, `content="${value}"`);
    }
    return tag.replace(/\s*\/?\s*>$/, ` content="${value}" />`);
  });
};

const replaceCanonical = (html, url) => {
  const pattern = /<link\s+[^>]*rel=["']canonical["'][^>]*>/i;
  return html.replace(pattern, tag => {
    if (/href=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/href=["'][^"']*["']/i, `href="${url}"`);
    }
    return tag.replace(/\s*\/?\s*>$/, ` href="${url}" />`);
  });
};

const updateWebPageStructuredData = (html, seo) => {
  const pattern = /<script\s+id=["']structured-data["'][^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(pattern);
  if (!match) return html;

  try {
    const parsed = JSON.parse(match[1]);
    const updateNode = node => {
      if (Array.isArray(node)) {
        node.forEach(updateNode);
        return;
      }
      if (!node || typeof node !== "object") return;

      if (node["@type"] === "WebPage") {
        node.name = seo.title;
        node.description = seo.description;
        node.url = seo.url;
        if (node["@id"]) node["@id"] = seo.url;
      }

      if (Array.isArray(node["@graph"])) {
        node["@graph"].forEach(updateNode);
      }
    };

    updateNode(parsed);
    return html.replace(
      pattern,
      `<script id="structured-data" type="application/ld+json">${JSON.stringify(parsed).replace(/</g, "\\u003c")}</script>`
    );
  } catch {
    return html;
  }
};

const readUsGuideNames = async (stateSlug, citySlug) => {
  if (citySlug) {
    try {
      const raw = JSON.parse(
        await readFile(
          path.join(usGuideSourceRoot, stateSlug, `${citySlug}.json`),
          "utf8"
        )
      );
      return {
        state: raw.state || titleCase(stateSlug),
        city: raw.city || titleCase(citySlug),
      };
    } catch {
      return { state: titleCase(stateSlug), city: titleCase(citySlug) };
    }
  }

  try {
    const files = (await readdir(path.join(usGuideSourceRoot, stateSlug))).filter(
      file => file.endsWith(".json") && file !== "index.json"
    );
    for (const file of files) {
      try {
        const raw = JSON.parse(
          await readFile(path.join(usGuideSourceRoot, stateSlug, file), "utf8")
        );
        if (raw.state) {
          return { state: raw.state, city: null };
        }
      } catch {
        // Try the next source file.
      }
    }
  } catch {
    // Fall back to the route slug below.
  }

  return { state: titleCase(stateSlug), city: null };
};

const buildSeo = async pathname => {
  let match = /^\/guides\/us\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match) {
    const names = await readUsGuideNames(match[1], match[2]);
    return {
      kind: "us-city",
      stateSlug: match[1],
      citySlug: match[2],
      title: `Top 10 Things to Do in ${names.city} (${CURRENT_YEAR} Guide) | Outdoor Adventures`,
      description: `Plan a trip to ${names.city}, ${names.state} with outdoor activities, tours, local attractions, itineraries, and practical travel tips.`,
      url: `${SITE}${pathname}`,
    };
  }

  match = /^\/guides\/us\/([^/]+)$/.exec(pathname);
  if (match) {
    const names = await readUsGuideNames(match[1], null);
    return {
      kind: "us-state",
      stateSlug: match[1],
      citySlug: null,
      title: `${names.state} Outdoor Adventure Guide | Tours & Tips`,
      description: `Plan outdoor adventures in ${names.state} with guided tours, activities, itineraries, destination ideas, and practical travel tips.`,
      url: `${SITE}${pathname}`,
    };
  }

  match = /^\/guides\/world\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (match) {
    const country = titleCase(match[1]);
    const city = titleCase(match[2]);
    return {
      kind: "world-city",
      stateSlug: match[1],
      citySlug: match[2],
      title: `Top 10 Things to Do in ${city} (${CURRENT_YEAR} Guide) | Outdoor Adventures`,
      description: `Plan a trip to ${city}, ${country} with outdoor activities, tours, local attractions, itineraries, and practical travel tips.`,
      url: `${SITE}${pathname}`,
    };
  }

  match = /^\/guides\/world\/([^/]+)$/.exec(pathname);
  if (match) {
    const country = titleCase(match[1]);
    return {
      kind: "world-country",
      stateSlug: match[1],
      citySlug: null,
      title: `${country} Outdoor Adventure Guide | Tours & Tips`,
      description: `Plan outdoor adventures in ${country} with guided tours, activities, itineraries, destination ideas, and practical travel tips.`,
      url: `${SITE}${pathname}`,
    };
  }

  return null;
};

const sitemap = await readFile(sitemapPath, "utf8");
const pathnames = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
  .map(match => new URL(match[1]).pathname.replace(/\/$/, "") || "/")
  .filter(pathname => pathname.startsWith("/guides/"));

const citySlugsByState = new Map();
for (const pathname of pathnames) {
  const match = /^\/guides\/us\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (!match) continue;
  const cities = citySlugsByState.get(match[1]) ?? new Set();
  cities.add(match[2]);
  citySlugsByState.set(match[1], cities);
}

let rewritten = 0;
const failures = [];

for (const pathname of pathnames) {
  const seo = await buildSeo(pathname);
  if (!seo) continue;

  const outputPath = outputPathFor(pathname);
  let html;
  try {
    html = await readFile(outputPath, "utf8");
  } catch {
    failures.push(`${pathname}: missing prerendered index.html`);
    continue;
  }

  html = replaceTitle(html, seo.title);
  html = replaceMetaContent(html, "name", "description", seo.description);
  html = replaceMetaContent(html, "property", "og:title", seo.title);
  html = replaceMetaContent(html, "property", "og:description", seo.description);
  html = replaceMetaContent(html, "property", "og:url", seo.url);
  html = replaceMetaContent(html, "name", "twitter:title", seo.title);
  html = replaceMetaContent(html, "name", "twitter:description", seo.description);
  html = replaceCanonical(html, seo.url);
  html = updateWebPageStructuredData(html, seo);

  if (seo.kind === "us-state") {
    const cityCount = citySlugsByState.get(seo.stateSlug)?.size ?? 0;
    if (cityCount > 0) {
      html = html.replace(
        /(has\s+\d+\s+tours\s+across\s+)\d+(\s+cities)/i,
        `$1${cityCount}$2`
      );
    } else {
      html = html.replace(
        /has\s+(\d+)\s+tours\s+across\s+0\s+cities/i,
        "has $1 tours across the state"
      );
    }
  }

  await writeFile(outputPath, html, "utf8");
  rewritten += 1;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";
  if (!title || /Guides\s*\//i.test(title) || /\/\s*(Us|World)\s*\//i.test(title)) {
    failures.push(`${pathname}: generic breadcrumb-style title remains (${title || "missing"})`);
  }
  if (/Explore\s+Guides\s*\//i.test(html)) {
    failures.push(`${pathname}: generic breadcrumb-style description remains`);
  }
  if (/across\s+0\s+cities/i.test(html)) {
    failures.push(`${pathname}: state guide still reports 0 cities`);
  }
  if (!html.includes(`href="${seo.url}"`)) {
    failures.push(`${pathname}: canonical URL mismatch`);
  }
}

if (failures.length) {
  console.error("[finalize-guide-prerender-output] audit failures:");
  failures.slice(0, 50).forEach(failure => console.error(`  ${failure}`));
  throw new Error(
    `Guide prerender finalization failed for ${failures.length} route(s); refusing production output.`
  );
}

console.log(
  `[finalize-guide-prerender-output] rewrote and audited ${rewritten.toLocaleString()} state/city/country guide HTML files; no breadcrumb-style guide titles or 0-city state copy remain.`
);
