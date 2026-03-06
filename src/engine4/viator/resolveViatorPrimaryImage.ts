import type { Engine4ViatorApiTour } from "../types";

const PRIORITY_VARIANTS = [
  "large",
  "hero",
  "xxlarge",
  "xlarge",
  "original",
  "url",
];
const TACDN_HOST_REGEX = /(?:^|\.)tacdn\.com$/i;
const VIATOR_HOST_REGEX = /(?:^|\.)viator\.com$/i;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;

const asValidUrl = (value: unknown): string | undefined => {
  const candidate = asString(value);
  if (!candidate) {
    return undefined;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return candidate;
  } catch {
    return undefined;
  }
};

const getHost = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

const isTacdnUrl = (url: string): boolean =>
  TACDN_HOST_REGEX.test(getHost(url));
const isViatorUrl = (url: string): boolean =>
  VIATOR_HOST_REGEX.test(getHost(url));
const isCaptionOrHeroVariant = (url: string): boolean =>
  /caption\.(?:jpg|jpeg|png|webp)(?:\?|$)/i.test(url) ||
  /(?:\?|&)w=1100(?:&|$)/i.test(url);

type Candidate = {
  url: string;
  score: number;
  source: string;
};

const addCandidate = (
  bag: Candidate[],
  value: unknown,
  score: number,
  source: string
): void => {
  const url = asValidUrl(value);
  if (!url) {
    return;
  }

  bag.push({ url, score, source });
};

const collectFromImageLikeObject = (
  value: unknown,
  bag: Candidate[],
  source: string
): void => {
  const row = asRecord(value);
  if (!row) {
    return;
  }

  addCandidate(bag, row.url, 40, `${source}.url`);
  addCandidate(bag, row.imageUrl, 40, `${source}.imageUrl`);

  const variants = row.variants;
  if (Array.isArray(variants)) {
    variants.forEach((variant, index) => {
      const variantRecord = asRecord(variant);
      if (!variantRecord) {
        return;
      }

      const name = asString(variantRecord.name)?.toLowerCase();
      const rank = name ? PRIORITY_VARIANTS.indexOf(name) : -1;
      const baseScore = rank >= 0 ? 100 - rank * 10 : 55;
      addCandidate(
        bag,
        variantRecord.url,
        baseScore,
        `${source}.variants[${index}]`
      );
    });
  }

  const variantMap = asRecord(row.variant);
  if (variantMap) {
    PRIORITY_VARIANTS.forEach((key, index) => {
      const entry = variantMap[key];
      const entryRecord = asRecord(entry);
      addCandidate(
        bag,
        entryRecord?.url ?? entry,
        100 - index * 10,
        `${source}.variant.${key}`
      );
    });
  }

  PRIORITY_VARIANTS.forEach((key, index) => {
    const valueForKey = row[key];
    const keyRecord = asRecord(valueForKey);
    addCandidate(
      bag,
      keyRecord?.url ?? valueForKey,
      95 - index * 10,
      `${source}.${key}`
    );
  });
};

const collectKnownContainers = (
  product: Record<string, unknown>,
  bag: Candidate[]
): void => {
  const knownContainers: Array<[string, unknown]> = [
    ["images", product.images],
    ["product.images", asRecord(product.product)?.images],
    ["media.images", asRecord(product.media)?.images],
    ["heroImages", product.heroImages],
  ];

  knownContainers.forEach(([path, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        collectFromImageLikeObject(entry, bag, `${path}[${index}]`);
        addCandidate(bag, entry, 35, `${path}[${index}]`);
      });
      return;
    }

    const asObj = asRecord(value);
    if (asObj) {
      collectFromImageLikeObject(asObj, bag, path);
      Object.entries(asObj).forEach(([key, item]) => {
        collectFromImageLikeObject(item, bag, `${path}.${key}`);
      });
    }
  });
};

const collectRecursiveUrls = (
  value: unknown,
  bag: Candidate[],
  source: string,
  depth = 0
): void => {
  if (depth > 4) {
    return;
  }

  const directUrl = asValidUrl(value);
  if (directUrl) {
    addCandidate(bag, directUrl, 10, `${source}.url`);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      collectRecursiveUrls(entry, bag, `${source}[${index}]`, depth + 1)
    );
    return;
  }

  const record = asRecord(value);
  if (!record) {
    return;
  }

  Object.entries(record).forEach(([key, entry]) => {
    collectRecursiveUrls(entry, bag, `${source}.${key}`, depth + 1);
  });
};

export const resolveViatorPrimaryImage = (
  product: unknown
): string | undefined => {
  const productRecord = asRecord(product);
  if (!productRecord) {
    return undefined;
  }

  const candidates: Candidate[] = [];
  collectKnownContainers(productRecord, candidates);
  collectRecursiveUrls(productRecord, candidates, "product");

  const deDupe = new Map<string, Candidate>();
  candidates.forEach(candidate => {
    const current = deDupe.get(candidate.url);
    if (!current || current.score < candidate.score) {
      deDupe.set(candidate.url, candidate);
    }
  });

  const sorted = Array.from(deDupe.values()).sort((a, b) => b.score - a.score);

  const tacdnVariant = sorted.find(
    item =>
      isTacdnUrl(item.url) &&
      item.score >= 60 &&
      isCaptionOrHeroVariant(item.url)
  );
  if (tacdnVariant) {
    return tacdnVariant.url;
  }

  const tacdnAny = sorted.find(item => isTacdnUrl(item.url));
  if (tacdnAny) {
    return tacdnAny.url;
  }

  const viatorAny = sorted.find(item => isViatorUrl(item.url));
  if (viatorAny) {
    return viatorAny.url;
  }

  return sorted[0]?.url;
};

export const resolveViatorPrimaryImageFromApiTour = (
  apiTour: Engine4ViatorApiTour | undefined
): string | undefined => {
  if (!apiTour) {
    return undefined;
  }

  return resolveViatorPrimaryImage(apiTour.rawProductPayload ?? apiTour);
};
