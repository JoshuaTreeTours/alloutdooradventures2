import fs from "node:fs";
import path from "node:path";
import { isValidWikiImageUrl } from "../wiki/wikiImageUrl";

type ResolveLandmarkImageArgs = {
  wikiTitle: string;
  citySlug: string;
  stateSlug: string;
  wikiUrl?: string;
};

type WikiSummaryResponse = {
  title?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

type WikiPageImagesResponse = {
  query?: {
    pages?: Record<string, { thumbnail?: { source?: string } }>;
  };
};

export type ResolvedLandmarkImage = {
  imageUrl: string | null;
  imageSource: "rest" | "pageimages" | "local" | "none";
};

const WIKI_SUMMARY_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary";
const WIKI_PAGEIMAGES_ENDPOINT = "https://en.wikipedia.org/w/api.php";

const slugifyLandmark = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const titleFromWikiUrl = (wikiUrl?: string) => {
  if (!wikiUrl?.trim()) {
    return null;
  }

  const cleaned = wikiUrl
    .trim()
    .replace(/^https?:\/\/en\.wikipedia\.org\/wiki\//i, "")
    .replace(/^\//, "")
    .split("#")[0];

  if (!cleaned) {
    return null;
  }

  return decodeURIComponent(cleaned).replace(/_/g, " ").trim() || null;
};

const fetchRestImage = async (wikiTitle: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${WIKI_SUMMARY_ENDPOINT}/${encodeURIComponent(wikiTitle)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "alloutdooradventures/1.0 (utah-authority-images)",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikiSummaryResponse;
    const original = payload.originalimage?.source;
    if (isValidWikiImageUrl(original)) {
      return original;
    }

    const thumbnail = payload.thumbnail?.source;
    return isValidWikiImageUrl(thumbnail) ? thumbnail : null;
  } catch {
    return null;
  }
};

const fetchPageImages = async (wikiTitle: string): Promise<string | null> => {
  try {
    const url = new URL(WIKI_PAGEIMAGES_ENDPOINT);
    url.searchParams.set("action", "query");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");
    url.searchParams.set("prop", "pageimages");
    url.searchParams.set("pithumbsize", "1600");
    url.searchParams.set("titles", wikiTitle);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "alloutdooradventures/1.0 (utah-authority-images)",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as WikiPageImagesResponse;
    const pages = Object.values(payload.query?.pages ?? {});
    for (const page of pages) {
      const source = page.thumbnail?.source;
      if (isValidWikiImageUrl(source)) {
        return source;
      }
    }

    return null;
  } catch {
    return null;
  }
};

const resolveLocalAsset = ({
  stateSlug,
  citySlug,
  slugifiedLandmark,
}: {
  stateSlug: string;
  citySlug: string;
  slugifiedLandmark: string;
}) => {
  const candidatePaths = [
    `/images/guides/us/${stateSlug}/${citySlug}/${slugifiedLandmark}.jpg`,
    `/images/guides/us/${stateSlug}/${citySlug}/${slugifiedLandmark}.webp`,
  ];

  for (const candidatePath of candidatePaths) {
    const localPath = path.resolve("public", candidatePath.replace(/^\//, ""));
    if (fs.existsSync(localPath)) {
      return candidatePath;
    }
  }

  return null;
};

export const resolveLandmarkImageDetailed = async ({
  wikiTitle,
  citySlug,
  stateSlug,
  wikiUrl,
}: ResolveLandmarkImageArgs): Promise<ResolvedLandmarkImage> => {
  const tryTitles: string[] = [];
  const trimmedTitle = wikiTitle.trim();
  if (trimmedTitle) {
    tryTitles.push(trimmedTitle);
  }

  const canonicalTitle = titleFromWikiUrl(wikiUrl);
  if (canonicalTitle && !tryTitles.includes(canonicalTitle)) {
    tryTitles.push(canonicalTitle);
  }

  for (const title of tryTitles) {
    const restImage = await fetchRestImage(title);
    if (restImage) {
      return { imageUrl: restImage, imageSource: "rest" };
    }

    const pageImage = await fetchPageImages(title);
    if (pageImage) {
      return { imageUrl: pageImage, imageSource: "pageimages" };
    }
  }

  const slugifiedLandmark = slugifyLandmark(trimmedTitle || canonicalTitle || "");
  if (slugifiedLandmark) {
    const localAsset = resolveLocalAsset({ stateSlug, citySlug, slugifiedLandmark });
    if (localAsset) {
      return { imageUrl: localAsset, imageSource: "local" };
    }
  }

  return { imageUrl: null, imageSource: "none" };
};

export const resolveLandmarkImage = async (
  args: ResolveLandmarkImageArgs
): Promise<string | null> => {
  const resolved = await resolveLandmarkImageDetailed(args);
  return resolved.imageUrl;
};
