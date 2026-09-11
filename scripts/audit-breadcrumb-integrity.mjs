import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.alloutdooradventures.com";
const SITE_HOSTS = new Set(["www.alloutdooradventures.com", "alloutdooradventures.com"]);
const DIST = path.resolve("dist");
const REPORT = path.resolve("reports/breadcrumb-integrity.json");
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
  if (/^\/tours\/(?:[^/]+|[^/]+\/[^/]+\/[^/]+)$/i.test(p)) return true;
  return false;
};

const typeIncludes = (node, wanted) => {
  const type = node?.["@type"];
  return Array.isArray(type) ? type.includes(wanted) : type === wanted;
};

const collectBreadcrumbs = value => {
  const found = [];
  const visit = node => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeIncludes(node, "BreadcrumbList")) found.push(node);
    Object.values(node).forEach(visit);
  };
  visit(value);
  return found;
};

const parseLdJson = html => {
  const scripts = [];
  const parseErrors = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      scripts.push(JSON.parse(raw));
    } catch (error) {
      parseErrors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return { scripts, parseErrors };
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

const breadcrumbItemUrl = item => {
  const value = item?.item;
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if (typeof value["@id"] === "string") return value["@id"];
    if (typeof value.url === "string") return value.url;
  }
  return null;
};

const toSiteUrl = value => {
  if (!value || typeof value !== "string") return null;
  try {
    const parsed = new URL(value, SITE);
    return parsed;
  } catch {
    return null;
  }
};

const sameRoute = (left, right) => normalizePath(left) === normalizePath(right);

const failures = [];
const warn = (pathname, message) => failures.push({ pathname, message });

const auditOne = async ({ url, kind }) => {
  let parsedRoute;
  try {
    parsedRoute = new URL(url);
  } catch {
    warn(url, "sitemap URL is not parseable");
    return;
  }

  const pathname = normalizePath(parsedRoute.pathname);
  const artifact = await readFirstExisting(pathname);
  if (!artifact) {
    warn(pathname, "missing prerendered HTML artifact");
    return;
  }

  const canonicalRaw = canonicalFromHtml(artifact.html);
  const canonical = toSiteUrl(canonicalRaw);
  if (!canonicalRaw || !canonical) {
    warn(pathname, "missing or invalid canonical link");
  } else {
    if (!SITE_HOSTS.has(canonical.hostname)) {
      warn(pathname, `canonical points off-site: ${canonicalRaw}`);
    }
    if (!sameRoute(canonical.pathname, pathname)) {
      warn(pathname, `canonical path mismatch: ${canonical.pathname}`);
    }
  }

  const { scripts, parseErrors } = parseLdJson(artifact.html);
  if (parseErrors.length) {
    warn(pathname, `malformed JSON-LD: ${parseErrors[0]}`);
  }
  if (!scripts.length) {
    warn(pathname, "no parseable JSON-LD scripts in built HTML");
    return;
  }

  const breadcrumbs = scripts.flatMap(collectBreadcrumbs);
  if (!breadcrumbs.length) {
    warn(pathname, "no BreadcrumbList in built HTML");
    return;
  }

  const routeBreadcrumbs = breadcrumbs.filter(node => {
    const items = Array.isArray(node.itemListElement) ? node.itemListElement : [];
    const last = items[items.length - 1];
    const lastUrl = toSiteUrl(breadcrumbItemUrl(last));
    return Boolean(lastUrl && sameRoute(lastUrl.pathname, canonical?.pathname ?? pathname));
  });

  if (!routeBreadcrumbs.length) {
    const endings = breadcrumbs
      .map(node => {
        const items = Array.isArray(node.itemListElement) ? node.itemListElement : [];
        return breadcrumbItemUrl(items[items.length - 1]) ?? "(missing)";
      })
      .join(", ");
    warn(pathname, `BreadcrumbList does not terminate at canonical page; found: ${endings}`);
    return;
  }

  const breadcrumb = routeBreadcrumbs[0];
  const items = Array.isArray(breadcrumb.itemListElement)
    ? breadcrumb.itemListElement
    : [];
  const minimum = kind === "guide" ? 2 : 2;
  if (items.length < minimum) {
    warn(pathname, `breadcrumb is too short (${items.length} items)`);
    return;
  }

  const seen = new Set();
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!typeIncludes(item, "ListItem")) {
      warn(pathname, `breadcrumb item ${index + 1} is not a ListItem`);
      continue;
    }
    if (item.position !== index + 1) {
      warn(pathname, `breadcrumb position ${String(item.position)} should be ${index + 1}`);
    }
    if (typeof item.name !== "string" || !item.name.trim()) {
      warn(pathname, `breadcrumb item ${index + 1} has no usable name`);
    }

    const rawItemUrl = breadcrumbItemUrl(item);
    const itemUrl = toSiteUrl(rawItemUrl);
    if (!rawItemUrl || !itemUrl) {
      warn(pathname, `breadcrumb item ${index + 1} has no usable URL`);
      continue;
    }
    if (itemUrl.protocol !== "https:") {
      warn(pathname, `breadcrumb item ${index + 1} is not HTTPS: ${rawItemUrl}`);
    }
    if (!SITE_HOSTS.has(itemUrl.hostname)) {
      warn(pathname, `breadcrumb item ${index + 1} points off-site: ${rawItemUrl}`);
      continue;
    }
    if (itemUrl.search || itemUrl.hash) {
      warn(pathname, `breadcrumb item ${index + 1} contains query/hash: ${rawItemUrl}`);
    }

    const itemPath = normalizePath(itemUrl.pathname);
    if (seen.has(itemPath)) {
      warn(pathname, `breadcrumb repeats target ${itemPath}`);
    }
    seen.add(itemPath);

    if (index < items.length - 1 && !(await targetExists(itemPath))) {
      warn(pathname, `breadcrumb parent target has no built HTML: ${itemPath}`);
    }
  }
};

const guideUrls = (await sitemapUrls(SITEMAPS[0])).filter(url =>
  isIndividualGuide(new URL(url).pathname)
);
const tourUrls = (await sitemapUrls(SITEMAPS[1])).filter(url =>
  isTourProductUrl(new URL(url).pathname)
);

const duplicateGuideUrls = guideUrls.length - new Set(guideUrls).size;
const duplicateTourUrls = tourUrls.length - new Set(tourUrls).size;
if (duplicateGuideUrls) failures.push({ pathname: SITEMAPS[0], message: `${duplicateGuideUrls} duplicate guide sitemap URL(s)` });
if (duplicateTourUrls) failures.push({ pathname: SITEMAPS[1], message: `${duplicateTourUrls} duplicate tour sitemap URL(s)` });

for (const url of new Set(guideUrls)) await auditOne({ url, kind: "guide" });
for (const url of new Set(tourUrls)) await auditOne({ url, kind: "tour" });

const report = {
  generatedAt: new Date().toISOString(),
  site: SITE,
  scope: {
    guideUrls: new Set(guideUrls).size,
    tourUrls: new Set(tourUrls).size,
    totalUrls: new Set(guideUrls).size + new Set(tourUrls).size,
  },
  failures,
};
await mkdir(path.dirname(REPORT), { recursive: true });
await writeFile(REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (failures.length) {
  console.error(`[breadcrumb-audit] FAILED: ${failures.length} defect(s) across ${report.scope.totalUrls.toLocaleString()} crawled guide/tour URLs.`);
  failures.slice(0, 100).forEach(failure =>
    console.error(`  ${failure.pathname}: ${failure.message}`)
  );
  if (failures.length > 100) console.error(`  ... ${failures.length - 100} more; see reports/breadcrumb-integrity.json`);
  process.exit(1);
}

console.log(
  `[breadcrumb-audit] PASS: ${report.scope.guideUrls.toLocaleString()} guide URLs + ${report.scope.tourUrls.toLocaleString()} tour URLs = ${report.scope.totalUrls.toLocaleString()} built HTML pages with canonical, parseable, sequential, locally resolvable BreadcrumbList markup.`
);
