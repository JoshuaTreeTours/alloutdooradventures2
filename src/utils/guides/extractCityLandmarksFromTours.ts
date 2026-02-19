import { getToursByCity, getToursByState } from "../../data/tours";
import type { Tour } from "../../data/tours.types";

export type LandmarkType =
  | "park"
  | "museum"
  | "beach"
  | "bridge"
  | "district"
  | "harbor"
  | "mountain"
  | "river"
  | "historic"
  | "other";

export type CityLandmarkCandidate = {
  name: string;
  type: LandmarkType;
  score: number;
};

const LANDMARK_TOKENS = [
  "Park",
  "Museum",
  "Beach",
  "Bridge",
  "Harbor",
  "Bay",
  "River",
  "Canyon",
  "Trail",
  "Historic District",
  "Zoo",
  "Aquarium",
  "Garden",
  "Gardens",
  "Pier",
  "Boardwalk",
  "Island",
  "Mountain",
  "Lake",
  "Observatory",
  "Cathedral",
  "Market",
  "Old Town",
  "Waterfront",
  "Monument",
  "Falls",
  "Creek",
  "Marina",
  "Boulevard",
  "Square",
  "Cemetery",
  "Fort",
  "Plaza",
];

const HARD_JUNK_PATTERNS = [
  /\bThis\b/i,
  /\bExpect\b/i,
  /\bEnjoy\b/i,
  /\bDiscover\b/i,
  /\bExplore\b/i,
  /\bGuided Tour\b/i,
  /\bPrivate Tour\b/i,
  /\bExperience\b/i,
  /\bAdventure\b/i,
  /\bDay Trip\b/i,
  /^Downtown$/i,
  /^City Center$/i,
  /^Local Neighborhood$/i,
];

const TYPE_MAP: Array<[RegExp, LandmarkType]> = [
  [/park|trail|canyon|garden|falls|creek/i, "park"],
  [/museum|observatory|cathedral|zoo|aquarium|market/i, "museum"],
  [/beach|island|pier|boardwalk|waterfront|bay/i, "beach"],
  [/bridge/i, "bridge"],
  [/district|old town|square|boulevard/i, "district"],
  [/harbor|marina/i, "harbor"],
  [/mountain|peak/i, "mountain"],
  [/river|lake/i, "river"],
  [/historic|monument/i, "historic"],
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toType = (name: string): LandmarkType => {
  for (const [pattern, type] of TYPE_MAP) {
    if (pattern.test(name)) {
      return type;
    }
  }
  return "other";
};

const looksLikeLandmark = (value: string) => {
  if (!value || value.split(/\s+/).length < 2) {
    return false;
  }

  if (HARD_JUNK_PATTERNS.some(pattern => pattern.test(value))) {
    return false;
  }

  const hasToken = LANDMARK_TOKENS.some(token =>
    new RegExp(`\\b${token}\\b`, "i").test(value)
  );

  const capitalizedWordCount = (value.match(/\b[A-Z][a-zA-Z'’.-]*\b/g) ?? [])
    .length;

  return hasToken || capitalizedWordCount >= 2;
};

const JUNK_WORDS =
  /\b(tour|guided|private|experience|adventure|trip|rental|rentals|brunch|food|wine|bike|ebike|kayak|sail|cruise)\b/i;

const extractCandidatesFromText = (text: string) => {
  const matches =
    text.match(
      /\b(?:[A-Z][a-zA-Z'’.-]*\s+){1,5}(?:[A-Z][a-zA-Z'’.-]*|[A-Z]{2,})\b/g
    ) ?? [];

  return matches
    .map(candidate => candidate.replace(/[.,;:!?]+$/, "").trim())
    .filter(looksLikeLandmark)
    .filter(candidate => !JUNK_WORDS.test(candidate))
    .filter(candidate => !/^([A-Z][a-z]+)$/.test(candidate));
};

const extractLandmarksFromTours = (tours: Tour[]): CityLandmarkCandidate[] => {
  const scored = new Map<string, CityLandmarkCandidate>();

  tours.forEach(tour => {
    const title = tour.title || "";
    const longText = `${tour.title}. ${tour.shortDescription ?? ""} ${tour.longDescription ?? ""}`;

    const titleCandidates = extractCandidatesFromText(title);
    const descCandidates = extractCandidatesFromText(longText);

    const pushCandidate = (name: string, source: "title" | "description") => {
      const cleaned = name.trim();
      const key = normalize(cleaned);
      if (!key || key.length < 5) {
        return;
      }

      const strongTokenBoost = LANDMARK_TOKENS.some(token =>
        new RegExp(`\\b${token}\\b`, "i").test(cleaned)
      )
        ? 2
        : 0;
      const wordCount = cleaned.split(/\s+/).length;
      const lengthBoost = wordCount >= 2 && wordCount <= 5 ? 1 : 0;
      const earlyBoost =
        source === "title" &&
        title.toLowerCase().indexOf(cleaned.toLowerCase()) <= 16
          ? 2
          : 0;
      const sourceBoost = source === "title" ? 2 : 1;

      const prev = scored.get(key);
      const base = prev?.score ?? 0;
      const nextScore =
        base + sourceBoost + strongTokenBoost + lengthBoost + earlyBoost;

      scored.set(key, {
        name: prev?.name ?? cleaned,
        type: toType(cleaned),
        score: nextScore,
      });
    };

    titleCandidates.forEach(candidate => pushCandidate(candidate, "title"));
    descCandidates.forEach(candidate =>
      pushCandidate(candidate, "description")
    );
  });

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
};

export const extractCityLandmarksFromTours = (
  stateSlug: string,
  citySlug: string
): CityLandmarkCandidate[] =>
  extractLandmarksFromTours(getToursByCity(stateSlug, citySlug));

export const extractStateLandmarksFromTours = (
  stateSlug: string
): CityLandmarkCandidate[] =>
  extractLandmarksFromTours(getToursByState(stateSlug));
