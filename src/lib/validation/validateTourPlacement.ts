import { haversineMiles } from "../../utils/geo";

export type RegionKind = "world" | "country" | "state" | "city";

export type RegionBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type RegionCenter = { lat: number; lng: number };

export type PlacementContext = {
  source: string;
  region: {
    kind: RegionKind;
    slug: string;
    countryCode?: string;
    stateCode?: string;
    isLandlocked?: boolean;
    bounds?: RegionBounds;
    center?: RegionCenter;
    maxDistanceMiles?: number;
  };
};

export type TourRecord = {
  title: string;
  categories?: string[];
  tags?: string[];
  lat?: number;
  lng?: number;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: string; reason: string };

const DEFAULT_MAX_DISTANCE_MILES: Record<RegionKind, number> = {
  city: 60,
  state: 120,
  country: 300,
  world: 500,
};

const MARINE_TITLE_KEYWORDS = [
  "dolphin",
  "whale",
  "snorkel",
  "scuba",
  "reef",
  "catamaran",
  "sailing",
  "cruise",
  "ocean",
];

const MARINE_TAG_KEYWORDS = [
  "snorkeling",
  "scuba",
  "sailing",
  "boat",
  "whale-watching",
  "dolphin",
  "ocean",
];

const isWithinBounds = (lat: number, lng: number, bounds: RegionBounds) =>
  lat >= bounds.minLat &&
  lat <= bounds.maxLat &&
  lng >= bounds.minLng &&
  lng <= bounds.maxLng;

const containsMarineKeyword = (values: string[], keywords: string[]) =>
  values.some((value) =>
    keywords.some((keyword) => value.includes(keyword)),
  );

export function validateTourPlacement(
  tour: TourRecord,
  ctx: PlacementContext,
): ValidationResult {
  const { lat, lng } = tour;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (hasCoords && ctx.region.bounds) {
    if (!isWithinBounds(lat as number, lng as number, ctx.region.bounds)) {
      return {
        ok: false,
        code: "OUTSIDE_BOUNDS",
        reason: `Tour location (${lat}, ${lng}) is outside region bounds.`,
      };
    }
  }

  if (hasCoords && ctx.region.center) {
    const maxDistance =
      ctx.region.maxDistanceMiles ?? DEFAULT_MAX_DISTANCE_MILES[ctx.region.kind];
    if (Number.isFinite(maxDistance)) {
      const distance = haversineMiles(
        { lat: lat as number, lng: lng as number },
        ctx.region.center,
      );
      if (distance > maxDistance) {
        return {
          ok: false,
          code: "TOO_FAR",
          reason: `Tour is ${Math.round(distance)} miles from region center (max ${maxDistance}).`,
        };
      }
    }
  }

  if (ctx.region.isLandlocked) {
    const title = tour.title.toLowerCase();
    const categories =
      tour.categories?.map((category) => category.toLowerCase()) ?? [];
    const tags = tour.tags?.map((tag) => tag.toLowerCase()) ?? [];
    const hasMarineTitle = containsMarineKeyword(
      [title],
      MARINE_TITLE_KEYWORDS,
    );
    const hasMarineTag = containsMarineKeyword(
      [...categories, ...tags],
      MARINE_TAG_KEYWORDS,
    );

    if (hasMarineTitle || hasMarineTag) {
      return {
        ok: false,
        code: "LANDLOCKED_MARINE_MISMATCH",
        reason: "Marine activity detected for a landlocked region.",
      };
    }
  }

  return { ok: true };
}
