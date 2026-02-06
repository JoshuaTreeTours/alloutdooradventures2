import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const SITE_URL = "https://www.alloutdooradventures.com";

const TOUR_ROUTE_PATHS = [
  "/tours/tennessee/nashville/nashvilles-hidden-gems-e-bike-tour-432832",
  "/tours/new-hampshire/portsmouth/islands-and-harbor-sightseeing-bike-tour---explore-the-must-see-sites-26123",
  "/tours/hawaii/maui/haleakala-downhill-self-guided-bike-tour-181765",
];

const getAttr = (tag, name) => {
  if (!tag) return null;
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1] ?? null;
};

const getTagByAttr = (html, tagName, attrName, attrValue) => {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<${tagName}\\s+[^>]*${attrName}\\s*=\\s*["']${escaped}["'][^>]*>`,
    "i"
  );
  return html.match(pattern)?.[0] ?? null;
};

const getMetaContent = (html, metaKey, metaValue) => {
  const escaped = metaValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+[^>]*${metaKey}\\s*=\\s*["']${escaped}["'][^>]*>`,
    "i"
  );
  const tag = html.match(pattern)?.[0] ?? null;
  return getAttr(tag, "content");
};

const getTitle = html => html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";

const parseJsonLdBlocks = html => {
  const scripts = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  const nodes = [];
  for (const match of scripts) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.["@graph"])) {
      nodes.push(...parsed["@graph"]);
      continue;
    }
    if (Array.isArray(parsed)) {
      nodes.push(...parsed);
      continue;
    }
    nodes.push(parsed);
  }
  return nodes;
};

const hasType = (node, type) => {
  const currentType = node?.["@type"];
  if (Array.isArray(currentType)) return currentType.includes(type);
  return currentType === type;
};

const findNode = (nodes, type) => nodes.find(node => hasType(node, type));

const asId = value => (typeof value === "string" ? value : value?.["@id"] ?? null);

const fail = message => {
  throw new Error(message);
};

const warn = message => {
  console.warn(`[SEO WARN] ${message}`);
};

const assertRoute = async routePath => {
  const tourUrl = `${SITE_URL}${routePath}`;
  const htmlPath = path.join(distDir, routePath.slice(1), "index.html");
  const html = await readFile(htmlPath, "utf8");

  const title = getTitle(html);
  const canonical = getAttr(getTagByAttr(html, "link", "rel", "canonical"), "href");
  const ogUrl = getMetaContent(html, "property", "og:url");
  const ogImage = getMetaContent(html, "property", "og:image");

  const nodes = parseJsonLdBlocks(html);
  const webPage = findNode(nodes, "WebPage");
  const trip = findNode(nodes, "TouristTrip");
  const product = findNode(nodes, "Product");

  if (!trip) fail(`${routePath}: Missing TouristTrip node.`);

  const tripName = trip.name ?? "";
  if (!title || !tripName || !title.includes(tripName)) {
    warn(`${routePath}: SSR title does not contain tour name.`);
  }

  if (!canonical || canonical === `${SITE_URL}/` || canonical === "/") {
    fail(`${routePath}: Tour page emitted homepage canonical.`);
  }

  if (canonical !== tourUrl) {
    fail(`${routePath}: canonical mismatch (${canonical}).`);
  }

  if (ogUrl !== tourUrl) {
    fail(`${routePath}: og:url mismatch (${ogUrl}).`);
  }

  if (!ogImage || ogImage.includes("/hero.jpg")) {
    fail(`${routePath}: og:image fell back to site default.`);
  }

  if (!webPage) fail(`${routePath}: Missing WebPage node.`);

  const webPageId = asId(webPage["@id"]);
  if (webPage.url !== tourUrl) {
    fail(`${routePath}: WebPage.url mismatch (${webPage.url}).`);
  }

  if (webPage.url === `${SITE_URL}/`) {
    fail(`${routePath}: WebPage points to homepage.`);
  }

  const tripId = asId(trip["@id"]);
  if (tripId !== `${tourUrl}#trip`) {
    fail(`${routePath}: TouristTrip @id mismatch (${tripId}).`);
  }

  const webPageMainEntityId = asId(webPage.mainEntity);
  if (webPageMainEntityId !== tripId) {
    fail(`${routePath}: WebPage.mainEntity is not TouristTrip.`);
  }

  const tripMainEntityOfPageId = asId(trip.mainEntityOfPage);
  if (!webPageId || tripMainEntityOfPageId !== webPageId) {
    fail(`${routePath}: TouristTrip.mainEntityOfPage does not reference #webpage.`);
  }

  const tourLocation = trip.tourLocation;
  const locationList = Array.isArray(tourLocation)
    ? tourLocation
    : tourLocation
      ? [tourLocation]
      : [];

  if (locationList.length === 0) {
    fail(`${routePath}: Missing TouristTrip.tourLocation.`);
  }

  const hasLocality = locationList.some(location => {
    const address = location?.address;
    if (Array.isArray(address)) {
      return address.some(item => Boolean(item?.addressLocality));
    }
    return Boolean(address?.addressLocality);
  });

  if (!hasLocality) {
    fail(`${routePath}: Missing TouristTrip.tourLocation.address.addressLocality.`);
  }

  const providerId = asId(trip.provider);
  if (!providerId || !providerId.endsWith("#brand")) {
    fail(`${routePath}: TouristTrip.provider does not point to #brand.`);
  }

  if (!product) return;

  const productMainEntityOfPageId = asId(product.mainEntityOfPage);
  if (!webPageId || productMainEntityOfPageId !== webPageId) {
    fail(`${routePath}: Product.mainEntityOfPage does not reference #webpage.`);
  }

  const productRelatedId = asId(product.isRelatedTo);
  const tripRelatedId = asId(trip.isRelatedTo);
  if (productRelatedId !== tripId && tripRelatedId !== asId(product["@id"])) {
    fail(`${routePath}: Product is not linked to TouristTrip via isRelatedTo.`);
  }
};

const main = async () => {
  for (const routePath of TOUR_ROUTE_PATHS) {
    await assertRoute(routePath);
  }
  console.log("Tour SSR/schema guard passed for all monitored routes.");
};

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
