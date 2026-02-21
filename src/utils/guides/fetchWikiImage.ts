const WIKIPEDIA_SUMMARY_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKIMEDIA_API_ENDPOINT = "https://commons.wikimedia.org/w/api.php";

const OFFICIAL_CITY_IMAGE_BY_SLUG: Record<string, string> = {
  hilo: "https://upload.wikimedia.org/wikipedia/commons/6/60/Hilo_Bay_-_Hilo%2C_Hawaii.jpg",
  lahaina: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Lahaina_Harbor_Maui.jpg",
  kona: "https://upload.wikimedia.org/wikipedia/commons/9/92/Kailua-Kona_Hawaii.jpg",
  maui: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Maui_coastline.jpg",
  kauai: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Na_Pali_Coast_State_Park.jpg",
  waikiki: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Waikiki_Beach_Honolulu.jpg",
  "hawaii-big-island": "https://upload.wikimedia.org/wikipedia/commons/9/95/Hawaii_Big_Island_NASA.jpg",
};

const isUsableImage = (url?: string | null) =>
  Boolean(url && /^https?:\/\//.test(url) && !/placeholder|default/i.test(url));

const decodeWikiTitle = (value: string) =>
  decodeURIComponent(value.replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//i, "").replace(/^\/wiki\//i, "")).replace(/_/g, " ");

const fetchWikipediaSummaryImage = async (title: string) => {
  const response = await fetch(
    `${WIKIPEDIA_SUMMARY_ENDPOINT}/${encodeURIComponent(title)}`,
    { headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    originalimage?: { source?: string };
    thumbnail?: { source?: string };
  };

  const candidate = payload.originalimage?.source ?? payload.thumbnail?.source ?? null;
  return isUsableImage(candidate) ? candidate : null;
};

const fetchWikimediaSearchImage = async (query: string) => {
  const url = new URL(WIKIMEDIA_API_ENDPOINT);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "5");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url");

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    query?: {
      pages?: Record<string, { imageinfo?: Array<{ url?: string }> }>;
    };
  };

  const pages = Object.values(payload.query?.pages ?? {});
  for (const page of pages) {
    const urlCandidate = page.imageinfo?.[0]?.url ?? null;
    if (isUsableImage(urlCandidate)) {
      return urlCandidate;
    }
  }

  return null;
};

export const fetchWikiImage = async (args: {
  title: string;
  city: string;
  citySlug?: string;
  wikiUrl?: string;
}): Promise<string | null> => {
  const { title, city, citySlug, wikiUrl } = args;

  try {
    const wikiTitle = wikiUrl ? decodeWikiTitle(wikiUrl) : title;

    const summaryImage = await fetchWikipediaSummaryImage(wikiTitle);
    if (summaryImage) {
      return summaryImage;
    }

    const commonsImage = await fetchWikimediaSearchImage(`${title} ${city}`);
    if (commonsImage) {
      return commonsImage;
    }

    const commonsImageRetry = await fetchWikimediaSearchImage(`${title} ${city} Hawaii`);
    if (commonsImageRetry) {
      return commonsImageRetry;
    }

    if (citySlug && OFFICIAL_CITY_IMAGE_BY_SLUG[citySlug]) {
      return OFFICIAL_CITY_IMAGE_BY_SLUG[citySlug];
    }

    return null;
  } catch {
    return citySlug ? OFFICIAL_CITY_IMAGE_BY_SLUG[citySlug] ?? null : null;
  }
};
