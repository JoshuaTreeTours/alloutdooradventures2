import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const DIST = path.resolve("dist");
const SITEMAPS = ["sitemap-guides.xml", "sitemap-tours.xml"];

const normalizePath = value => {
  const pathname = value || "/";
  const normalized = pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return normalized || "/";
};

const outputCandidatesFor = pathname => {
  const clean = normalizePath(pathname).replace(/^\//, "");
  if (!clean) return [path.join(DIST, "index.html")];
  return [
    path.join(DIST, clean, "index.html"),
    path.join(DIST, `${clean}.html`),
  ];
};

const readFirstExisting = async pathname => {
  for (const candidate of outputCandidatesFor(pathname)) {
    try {
      return { path: candidate, html: await readFile(candidate, "utf8") };
    } catch {
      // Try the next supported prerender layout.
    }
  }
  return null;
};

const targetExists = async pathname => Boolean(await readFirstExisting(pathname));

const decodeXml = value =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const decodeHtml = value =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const sitemapUrls = async file => {
  const xml = await readFile(path.join(DIST, file), "utf8");
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map(match => decodeXml(match[1].trim()))
    .filter(Boolean);
};

const isIndividualGuide = pathname =>
  /^\/guides\/(?:us|world)\/[^/]+(?:\/[^/]+)?$/.test(normalizePath(pathname));

const isTourProductUrl = pathname => {
  const p = normalizePath(pathname);
  if (/\/book$/i.test(p)) return false;
  if (/^\/destinations\/.+\/tours\/[^/]+$/i.test(p)) return true;
  if (/^\/tours\/[^/]+$/i.test(p)) return true;
  return false;
};

const typeIncludes = (node, wanted) => {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(wanted) : type === wanted;
};

const stripBreadcrumbLists = value => {
  if (Array.isArray(value)) {
    return value
      .map(stripBreadcrumbLists)
      .filter(item => item !== null && item !== undefined);
  }
  if (!value || typeof value !== "object") return value;
  if (typeIncludes(value, "BreadcrumbList")) return null;

  const next = {};
  for (const [key, child] of Object.entries(value)) {
    const stripped = stripBreadcrumbLists(child);
    if (stripped === null || stripped === undefined) {
      if (key === "@graph") next[key] = [];
      continue;
    }
    next[key] = stripped;
  }
  return next;
};

const stripExistingBreadcrumbJsonLd = html => {
  const pattern = /<script\b([^>]*)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi;
  return html.replace(pattern, (full, before, after, raw) => {
    const body = raw.trim();
    if (!body) return full;
    try {
      const parsed = JSON.parse(body);
      const stripped = stripBreadcrumbLists(parsed);
      if (stripped === null) return "";
      return `<script${before}type="application/ld+json"${after}>${JSON.stringify(stripped).replace(/</g, "\\u003c")}</script>`;
    } catch {
      return full;
    }
  });
};

const canonicalFromHtml = html => {
  const tags = html.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!/\brel=["']canonical["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]?.trim();
    if (href) return href;
  }
  return null;
};

const specialLabel = new Map([
  ["guides", "Guides"],
  ["us", "United States"],
  ["world", "International"],
  ["destinations", "Destinations"],
  ["tours", "Tours"],
  ["united-states", "United States"],
  ["united-kingdom", "United Kingdom"],
  ["usa", "United States"],
]);

const titleCaseSlug = slug =>
  specialLabel.get(slug.toLowerCase()) ??
  slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const cleanText = value =>
  decodeHtml(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const pageNameFromHtml = (html, pathname) => {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (h1) {
    const name = cleanText(h1);
    if (name) return name;
  }

  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) {
    const name = cleanText(title)
      .replace(/\s*[|–—-]\s*(?:All )?Outdoor Adventures.*$/i, "")
      .replace(/^Top \d+ Things to Do in\s+/i, "")
      .replace(/\s*\(\d{4} Guide\).*$/i, "")
      .trim();
    if (name) return name;
  }

  const segments = normalizePath(pathname).split("/").filter(Boolean);
  return titleCaseSlug(segments[segments.length - 1] ?? "Home");
};

const ancestorPathsFor = pathname => {
  const segments = normalizePath(pathname).split("/").filter(Boolean);
  const ancestors = [];
  for (let index = 1; index < segments.length; index += 1) {
    ancestors.push(`/${segments.slice(0, index).join("/")}`);
  }
  return ancestors;
};

const breadcrumbNameForPath = pathname => {
  const segments = normalizePath(pathname).split("/").filter(Boolean);
  return titleCaseSlug(segments[segments.length - 1] ?? "Home");
};

const buildBreadcrumb = async ({ pathname, canonical, html }) => {
  const items = [];
  for (const ancestor of ancestorPathsFor(pathname)) {
    if (!(await targetExists(ancestor))) continue;
    items.push({
      "@type": "ListItem",
      position: items.length + 1,
      name: breadcrumbNameForPath(ancestor),
      item: `${SITE}${ancestor}`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: items.length + 1,
    name: pageNameFromHtml(html, pathname),
    item: canonical,
  });

  // Every guide/tour route should have at least a built /guides, /destinations,
  // or /tours parent. Keep the build strict if that architecture ever breaks.
  if (items.length < 2) {
    throw new Error(`${pathname}: fewer than two locally resolvable breadcrumb items`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${canonical}#breadcrumb`,
    itemListElement: items,
  };
};

const injectBreadcrumb = (html, breadcrumb) => {
  const script = `<script id="breadcrumb-structured-data" type="application/ld+json">${JSON.stringify(breadcrumb).replace(/</g, "\\u003c")}</script>`;
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${script}</head>`);
  }
  return `${script}${html}`;
};

const urls = [];
for (const sitemap of SITEMAPS) {
  for (const url of await sitemapUrls(sitemap)) {
    const parsed = new URL(url);
    if (sitemap === "sitemap-guides.xml" && isIndividualGuide(parsed.pathname)) {
      urls.push(url);
    }
    if (sitemap === "sitemap-tours.xml" && isTourProductUrl(parsed.pathname)) {
      urls.push(url);
    }
  }
}

const uniqueUrls = [...new Set(urls)];
let rewritten = 0;
const failures = [];

for (const url of uniqueUrls) {
  const parsed = new URL(url);
  const pathname = normalizePath(parsed.pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    failures.push(`${pathname}: missing prerendered HTML artifact`);
    continue;
  }

  const canonicalRaw = canonicalFromHtml(artifact.html);
  if (!canonicalRaw) {
    failures.push(`${pathname}: missing canonical link`);
    continue;
  }

  let canonical;
  try {
    canonical = new URL(canonicalRaw, SITE);
  } catch {
    failures.push(`${pathname}: invalid canonical ${canonicalRaw}`);
    continue;
  }

  if (normalizePath(canonical.pathname) !== pathname) {
    failures.push(`${pathname}: canonical path mismatch ${canonical.pathname}`);
    continue;
  }

  try {
    const breadcrumb = await buildBreadcrumb({
      pathname,
      canonical: `${SITE}${pathname}`,
      html: artifact.html,
    });
    const withoutOldBreadcrumbs = stripExistingBreadcrumbJsonLd(artifact.html);
    const output = injectBreadcrumb(withoutOldBreadcrumbs, breadcrumb);
    await writeFile(artifact.path, output, "utf8");
    rewritten += 1;
  } catch (error) {
    failures.push(
      error instanceof Error ? error.message : `${pathname}: ${String(error)}`
    );
  }
}

if (failures.length) {
  console.error("[finalize-breadcrumbs] failures:");
  failures.slice(0, 100).forEach(failure => console.error(`  ${failure}`));
  throw new Error(
    `Breadcrumb finalization failed for ${failures.length} route(s); refusing production output.`
  );
}

console.log(
  `[finalize-breadcrumbs] normalized canonical built-HTML BreadcrumbList markup for ${rewritten.toLocaleString()} sitemap-listed guide and tour pages.`
);
