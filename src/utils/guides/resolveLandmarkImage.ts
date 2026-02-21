import fs from "node:fs";
import path from "node:path";
import { pickWikiImageUrl } from "../wiki/wikiImageUrl";

type ResolveLandmarkImageArgs = {
  wikiTitle: string;
  citySlug: string;
  stateSlug: string;
};

type WikiSummaryResponse = {
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
};

const WIKI_SUMMARY_ENDPOINT = "https://en.wikipedia.org/api/rest_v1/page/summary";

const slugifyLandmark = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

const fetchWikiPageImage = async (wikiTitle: string): Promise<string | null> => {
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
    return pickWikiImageUrl({
      originalImageUrl: payload.originalimage?.source,
      thumbnailUrl: payload.thumbnail?.source,
    });
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

export const resolveLandmarkImage = async ({
  wikiTitle,
  citySlug,
  stateSlug,
}: ResolveLandmarkImageArgs): Promise<string | null> => {
  const wikiImage = await fetchWikiPageImage(wikiTitle);
  if (wikiImage) {
    return wikiImage;
  }

  const slugifiedLandmark = slugifyLandmark(wikiTitle);
  if (!slugifiedLandmark) {
    return null;
  }

  return resolveLocalAsset({ stateSlug, citySlug, slugifiedLandmark });
};
