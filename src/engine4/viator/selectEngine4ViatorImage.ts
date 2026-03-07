import type { Engine4ViatorApiTour } from "../types";
import { resolveViatorPrimaryImageFromApiTour } from "./resolveViatorPrimaryImage";

type ImageCandidate = {
  source: string;
  url: string;
};

type ImageRejection = ImageCandidate & {
  reason: string;
};

export type Engine4ImageSelection = {
  selected?: string;
  candidates: ImageCandidate[];
  rejected: ImageRejection[];
};

const INVALID_SCHEMES = ["javascript:", "data:"];
const ALLOWED_HOSTS = [
  /(?:^|\.)dynamic-media\.tacdn\.com$/i,
  /(?:^|\.)media\.tacdn\.com$/i,
  /(?:^|\.)viator\.com$/i,
];

const IMAGE_PATH_HINT_REGEX =
  /(photo-o|photo-l|photo-s|attractions-splice|dynamic-media|caption|hero)|\.(jpg|jpeg|png|webp)(\?|$)/i;

const normalize = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const isTrackerPixel = (url: string) =>
  /(?:[?&](?:w|width)=1(?:&|$))|(?:[?&](?:h|height)=1(?:&|$))|\/1x1(?:\.|\/|$)/i.test(
    url
  );

const validate = (url: string): string | undefined => {
  if (INVALID_SCHEMES.some(scheme => url.toLowerCase().startsWith(scheme))) {
    return "invalid scheme";
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "invalid protocol";
    }
    if (!ALLOWED_HOSTS.some(pattern => pattern.test(parsed.hostname))) {
      return `host not allowed: ${parsed.hostname}`;
    }
    if (isTrackerPixel(url)) {
      return "tracker pixel";
    }
    if (!IMAGE_PATH_HINT_REGEX.test(`${parsed.pathname}${parsed.search}`)) {
      return "path does not look like an image";
    }
    return undefined;
  } catch {
    return "not a valid URL";
  }
};

const addCandidate = (
  bag: ImageCandidate[],
  seen: Set<string>,
  source: string,
  value: unknown
) => {
  const url = normalize(value);
  if (!url || seen.has(url)) {
    return;
  }

  seen.add(url);
  bag.push({ source, url });
};

export const selectEngine4ViatorImage = (input: {
  productCode: string;
  apiTour?: Engine4ViatorApiTour;
  recordHeroImage?: string | null;
}): Engine4ImageSelection => {
  const candidates: ImageCandidate[] = [];
  const seen = new Set<string>();

  addCandidate(
    candidates,
    seen,
    "api.resolveViatorPrimaryImage",
    resolveViatorPrimaryImageFromApiTour(input.apiTour)
  );
  addCandidate(
    candidates,
    seen,
    "api.primaryImageUrl",
    input.apiTour?.primaryImageUrl
  );
  (input.apiTour?.galleryImages ?? []).forEach((image, index) => {
    addCandidate(candidates, seen, `api.galleryImages[${index}]`, image);
  });
  addCandidate(
    candidates,
    seen,
    "api.sourceDerivedImageUrl",
    input.apiTour?.sourceDerivedImageUrl
  );
  addCandidate(candidates, seen, "record.heroImage", input.recordHeroImage);

  const rejected: ImageRejection[] = [];
  for (const candidate of candidates) {
    const reason = validate(candidate.url);
    if (!reason) {
      return { selected: candidate.url, candidates, rejected };
    }
    rejected.push({ ...candidate, reason });
  }

  return { selected: undefined, candidates, rejected };
};
