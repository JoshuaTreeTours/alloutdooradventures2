const CACHE_PATH = "data/landmarkImages.json";
const CONFIDENCE_THRESHOLD = 0.8;

type CacheEntry = {
  imageUrl: string | null;
  confidence: number;
  source: "commons" | "wikipedia" | "none";
  updatedAt: string;
};

type CacheMap = Record<string, CacheEntry>;

type CommonsPage = {
  title?: string;
  imageinfo?: Array<{ url?: string }>;
  coordinates?: Array<{ lat?: number; lon?: number }>;
  categories?: Array<{ title?: string }>;
};

let cacheState: CacheMap | null = null;
let saveInFlight: Promise<void> = Promise.resolve();

const isNode = typeof window === "undefined";

const toKey = (name: string, city: string) =>
  `${city.trim().toLowerCase()}::${name.trim().toLowerCase()}`;

export const extractLandmarkNameFromTitle = (title: string) =>
  title
    .replace(/^(explore|visit|see|discover|walk|tour|experience)\s+/i, "")
    .replace(/\s+in\s+.+$/i, "")
    .trim();

const ensureCacheLoaded = async () => {
  if (cacheState) return;
  cacheState = {};

  if (!isNode) return;
  try {
    const fs = await import("node:fs/promises");
    const raw = await fs.readFile(CACHE_PATH, "utf8");
    cacheState = JSON.parse(raw) as CacheMap;
  } catch {
    cacheState = {};
  }
};

const queueCacheWrite = async () => {
  if (!isNode || !cacheState) return;

  saveInFlight = saveInFlight.then(async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
    await fs.writeFile(CACHE_PATH, `${JSON.stringify(cacheState, null, 2)}\n`);
  });

  await saveInFlight;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const scoreCommonsCandidate = ({
  page,
  name,
  city,
}: {
  page: CommonsPage;
  name: string;
  city: string;
}) => {
  const lowerName = name.toLowerCase();
  const lowerCity = city.toLowerCase();
  const title = (page.title ?? "").toLowerCase();
  const categories = (page.categories ?? [])
    .map(category => category.title?.toLowerCase() ?? "")
    .join(" ");

  let score = 0.2;

  if (title.includes(lowerName)) score += 0.45;
  if (title.includes(lowerCity) || categories.includes(lowerCity)) score += 0.2;
  if (page.coordinates?.length) score += 0.15;
  if (
    /(museum|monument|district|park|square|cathedral|historic|landmark)/.test(
      categories
    )
  ) {
    score += 0.1;
  }

  if (
    /(landscape|sunset|sunrise|wallpaper|panorama|nature scenery)/.test(
      categories
    )
  ) {
    score -= 0.45;
  }

  if (/(^|:)file:(img_|dsc_|p\d{4}|photo\d+)/.test(title)) {
    score -= 0.25;
  }

  if (/(map|locator|logo|icon|coat of arms)/.test(title + " " + categories)) {
    score -= 0.4;
  }

  return clamp(score);
};

const searchCommons = async (name: string, city: string) => {
  const query = `${name} ${city} landmark`;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "8");
  url.searchParams.set("prop", "imageinfo|coordinates|categories");
  url.searchParams.set("iiprop", "url");
  url.searchParams.set("cllimit", "20");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const payload = (await response.json()) as {
    query?: { pages?: Record<string, CommonsPage> };
  };

  const pages = Object.values(payload.query?.pages ?? {});
  const candidates = pages
    .map(page => {
      const imageUrl = page.imageinfo?.[0]?.url ?? null;
      if (!imageUrl) return null;

      const confidence = scoreCommonsCandidate({ page, name, city });
      return {
        imageUrl,
        confidence,
      };
    })
    .filter((item): item is { imageUrl: string; confidence: number } =>
      Boolean(item)
    )
    .sort((a, b) => b.confidence - a.confidence);

  return candidates[0] ?? null;
};

const fallbackWikipediaImage = async (name: string, city: string) => {
  const title = `${name}, ${city}`;
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    title?: string;
    description?: string;
    thumbnail?: { source?: string };
    originalimage?: { source?: string };
  };

  const imageUrl =
    payload.thumbnail?.source ?? payload.originalimage?.source ?? null;
  if (!imageUrl) return null;

  const pageTitle = payload.title?.toLowerCase() ?? "";
  const pageDescription = payload.description?.toLowerCase() ?? "";
  const lowerName = name.toLowerCase();
  const lowerCity = city.toLowerCase();

  const confidence = clamp(
    0.65 +
      (pageTitle.includes(lowerName) ? 0.2 : 0) +
      (pageTitle.includes(lowerCity) || pageDescription.includes(lowerCity)
        ? 0.05
        : 0)
  );

  return { imageUrl, confidence };
};

export const getLandmarkImage = async (
  name: string,
  city: string
): Promise<string | null> => {
  const cleanName = name.trim();
  const cleanCity = city.trim();
  if (!cleanName || !cleanCity) return null;

  await ensureCacheLoaded();
  const key = toKey(cleanName, cleanCity);
  const existing = cacheState?.[key];
  if (existing) {
    return existing.confidence >= CONFIDENCE_THRESHOLD
      ? existing.imageUrl
      : null;
  }

  try {
    const commons = await searchCommons(cleanName, cleanCity);
    if (commons && commons.confidence >= CONFIDENCE_THRESHOLD) {
      cacheState![key] = {
        imageUrl: commons.imageUrl,
        confidence: commons.confidence,
        source: "commons",
        updatedAt: new Date().toISOString(),
      };
      await queueCacheWrite();
      return commons.imageUrl;
    }

    const wiki = await fallbackWikipediaImage(cleanName, cleanCity);
    if (wiki && wiki.confidence >= CONFIDENCE_THRESHOLD) {
      cacheState![key] = {
        imageUrl: wiki.imageUrl,
        confidence: wiki.confidence,
        source: "wikipedia",
        updatedAt: new Date().toISOString(),
      };
      await queueCacheWrite();
      return wiki.imageUrl;
    }

    cacheState![key] = {
      imageUrl: null,
      confidence: Math.max(commons?.confidence ?? 0, wiki?.confidence ?? 0),
      source: "none",
      updatedAt: new Date().toISOString(),
    };
    await queueCacheWrite();
    return null;
  } catch {
    return null;
  }
};
