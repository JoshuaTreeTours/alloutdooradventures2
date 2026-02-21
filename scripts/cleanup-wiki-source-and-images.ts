import fs from "node:fs";
import path from "node:path";
import { cleanThingDescription } from "../src/utils/guides/cleanThingDescription";
import { pickWikiImageUrl, isValidWikiImageUrl } from "../src/utils/wiki/wikiImageUrl";

type Thing = {
  title: string;
  description: string;
  wikiUrl?: string;
  imageUrl?: string | null;
};

type Guide = {
  city?: string;
  state?: string;
  thingsToDo?: Thing[];
};

type WikiSummaryResponse = {
  title?: string;
  extract?: string;
  type?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

const GUIDE_ROOT = path.resolve("src/data/guides/us");
const USER_AGENT = "alloutdooradventures/1.0 (wiki-source-image-cleanup)";

const walk = (dir: string): string[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(full);
    }
  }

  return files;
};

const shouldTargetFile = (filePath: string) => {
  const stateSlug = path.basename(path.dirname(filePath));
  const citySlug = path.basename(filePath, ".json");

  if (stateSlug === "colorado") {
    return ["boulder", "colorado-springs", "durango"].includes(citySlug);
  }

  if (stateSlug === "utah") {
    return citySlug !== "salt-lake-city";
  }

  if (stateSlug === "hawaii") {
    return citySlug !== "honolulu";
  }

  return false;
};

const toCanonicalWikiUrl = (title: string, pageUrl?: string) => {
  if (pageUrl?.trim()) {
    return pageUrl.trim();
  }

  const normalized = title.trim().replace(/\s+/g, "_");
  if (!normalized) {
    return undefined;
  }

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(normalized).replace(
    /%5F/g,
    "_"
  )}`;
};

const wikiTitleFromUrl = (wikiUrl?: string, title?: string) => {
  if (wikiUrl?.trim()) {
    const marker = "/wiki/";
    const idx = wikiUrl.indexOf(marker);
    if (idx >= 0) {
      return decodeURIComponent(wikiUrl.slice(idx + marker.length)).replace(/_/g, " ");
    }
  }

  return title?.trim() || "";
};

const fetchSummary = async (title: string): Promise<WikiSummaryResponse | null> => {
  if (!title.trim()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikiSummaryResponse;
    if (payload.type === "missing") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const main = async () => {
  const files = walk(GUIDE_ROOT).filter(shouldTargetFile);

  let updatedFiles = 0;
  let cleanedDescriptions = 0;
  let imageFixed = 0;
  let imageRemoved = 0;

  for (const filePath of files) {
    const guide = JSON.parse(fs.readFileSync(filePath, "utf8")) as Guide;
    const things = guide.thingsToDo;

    if (!Array.isArray(things) || !things.length) {
      continue;
    }

    let changed = false;

    for (const thing of things) {
      const cleanedDescription = cleanThingDescription(thing.description || "");
      if (cleanedDescription !== thing.description) {
        thing.description = cleanedDescription;
        cleanedDescriptions += 1;
        changed = true;
      }

      const title = wikiTitleFromUrl(thing.wikiUrl, thing.title);
      const summary = await fetchSummary(title);
      const resolvedWikiUrl = summary
        ? toCanonicalWikiUrl(summary.title || thing.title, summary.content_urls?.desktop?.page)
        : thing.wikiUrl;

      if (thing.wikiUrl && resolvedWikiUrl && resolvedWikiUrl !== thing.wikiUrl) {
        thing.wikiUrl = resolvedWikiUrl;
        changed = true;
      }

      const wikiImage = pickWikiImageUrl({
        originalImageUrl: summary?.originalimage?.source,
        thumbnailUrl: summary?.thumbnail?.source,
      });

      if (wikiImage && wikiImage !== thing.imageUrl) {
        thing.imageUrl = wikiImage;
        imageFixed += 1;
        changed = true;
        continue;
      }

      if (!wikiImage && thing.imageUrl && !isValidWikiImageUrl(thing.imageUrl)) {
        thing.imageUrl = null;
        imageRemoved += 1;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, `${JSON.stringify(guide, null, 2)}\n`, "utf8");
      updatedFiles += 1;
    }
  }

  console.log(`Updated files: ${updatedFiles}`);
  console.log(`Descriptions cleaned: ${cleanedDescriptions}`);
  console.log(`Image URLs fixed: ${imageFixed}`);
  console.log(`Invalid image URLs removed: ${imageRemoved}`);
};

void main();
