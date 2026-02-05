import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const toursDir = path.join(distDir, "tours");
const SITE_URL = "https://www.alloutdooradventures.com";

const findTag = (html, tagName, attrName, attrValue) => {
  const escaped = attrValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<${tagName}\\s+[^>]*${attrName}\\s*=\\s*["']${escaped}["'][^>]*>`,
    "i"
  );
  return html.match(pattern)?.[0] ?? null;
};

const attr = (tag, name) => {
  if (!tag) return null;
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match?.[1] ?? null;
};

const parseStructuredData = html => {
  const match = html.match(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match?.[1]) return null;
  return JSON.parse(match[1]);
};

const getNode = (graph, type) => graph.find(node => node?.["@type"] === type);

const collectTourRoutes = async () => {
  const stateDirs = await readdir(toursDir, { withFileTypes: true });
  const routes = [];

  for (const stateDir of stateDirs) {
    if (!stateDir.isDirectory()) continue;
    const cityDirs = await readdir(path.join(toursDir, stateDir.name), {
      withFileTypes: true,
    });
    for (const cityDir of cityDirs) {
      if (!cityDir.isDirectory()) continue;
      const tourDirs = await readdir(
        path.join(toursDir, stateDir.name, cityDir.name),
        { withFileTypes: true }
      );
      for (const tourDir of tourDirs) {
        if (!tourDir.isDirectory()) continue;
        routes.push(`/tours/${stateDir.name}/${cityDir.name}/${tourDir.name}`);
      }
    }
  }

  return routes;
};

const main = async () => {
  const routes = await collectTourRoutes();
  const selected = [];
  const cities = new Set();

  for (const routePath of routes) {
    const [, , stateSlug, citySlug] = routePath.split("/");
    const cityKey = `${stateSlug}/${citySlug}`;
    if (cities.has(cityKey)) continue;
    cities.add(cityKey);
    selected.push(routePath);
    if (selected.length === 3) break;
  }

  if (selected.length < 3) {
    throw new Error("Could not find 3 prerendered tour routes across cities.");
  }

  for (const routePath of selected) {
    const tourUrl = `${SITE_URL}${routePath}`;
    const html = await readFile(
      path.join(distDir, routePath.slice(1), "index.html"),
      "utf8"
    );

    const canonical = attr(findTag(html, "link", "rel", "canonical"), "href");
    if (!canonical || canonical === `${SITE_URL}/`) {
      throw new Error(`${routePath}: canonical missing or points to homepage.`);
    }

    const graph = parseStructuredData(html)?.["@graph"];
    if (!Array.isArray(graph)) {
      throw new Error(`${routePath}: missing JSON-LD @graph.`);
    }

    const webPage = getNode(graph, "WebPage");
    const trip = getNode(graph, "TouristTrip");

    if (!webPage || !trip) {
      throw new Error(`${routePath}: missing WebPage or TouristTrip node.`);
    }

    if (webPage.url !== tourUrl) {
      throw new Error(`${routePath}: WebPage.url mismatch (${webPage.url}).`);
    }

    if (!trip.tourLocation) {
      throw new Error(`${routePath}: TouristTrip missing tourLocation.`);
    }
  }

  console.log("Tour route SEO structured-data checks passed for 3 tour pages.");
};

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
