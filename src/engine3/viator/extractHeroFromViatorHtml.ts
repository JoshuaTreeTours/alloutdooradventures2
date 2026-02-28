const JUNK_PATTERNS = [
  "globalnav",
  "fallback-",
  "_100x100",
  "sprite",
  "/icons/",
  "logo",
];

type ExtractedHero = {
  heroUrl?: string;
  heroAlt?: string;
};

const isJunk = (url: string) => {
  const lower = url.toLowerCase();
  return JUNK_PATTERNS.some(pattern => lower.includes(pattern));
};

const normalize = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return null;
};

const score = (url: string) => {
  const lower = url.toLowerCase();
  let value = 0;

  if (lower.includes("dynamic-media.tacdn.com")) {
    value += 200;
  }
  if (lower.includes("media.tacdn.com")) {
    value += 150;
  }

  const match = lower.match(/(\d{3,4})x(\d{3,4})/);
  if (match) {
    value += Number(match[1]);
  }

  return value;
};

export const extractHeroFromViatorHtml = (html: string): ExtractedHero => {
  const tacdnMatches = [
    ...html.matchAll(
      /https?:\/\/(?:media|dynamic-media)\.tacdn\.com\/[^"'\s>]+/gi
    ),
  ]
    .map(match => normalize(match[0]))
    .filter((url): url is string => Boolean(url))
    .filter(url => !isJunk(url));

  if (!tacdnMatches.length) {
    return {};
  }

  const deduped = Array.from(new Set(tacdnMatches));
  const best = [...deduped].sort((a, b) => score(b) - score(a))[0];

  return {
    heroUrl: best,
  };
};
