import type { Tour } from "./tours.types";
import type { Engine2Tour } from "../engine2/data/loadEngine2";
import {
  fareHarborRebuildByRoute,
  type FareHarborRebuildRecord,
} from "./fareharborRebuild.generated";

const normalizeRoute = (route: string | null | undefined) => {
  if (!route) return "";
  const trimmed = route.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") && trimmed !== "/" ? trimmed.slice(0, -1) : trimmed;
};

const unique = (values: Array<string | null | undefined>) =>
  Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map(value => value.trim())
        .filter(Boolean),
    ),
  );

export const getFareHarborRebuildRecord = (
  route: string | null | undefined,
): FareHarborRebuildRecord | null =>
  fareHarborRebuildByRoute[normalizeRoute(route)] ?? null;

export const hasVerifiedTourPrice = (tour: Tour) =>
  typeof tour.startingPrice === "number" &&
  Number.isFinite(tour.startingPrice) &&
  tour.startingPrice >= 20;

export const hasVerifiedEngine2Price = (tour: Engine2Tour) => {
  const raw = tour.pricing?.price;
  if (raw === null || raw === undefined || raw === "") return false;
  const parsed = Number(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) && parsed >= 20;
};

export const applyFareHarborRebuildToTour = (tour: Tour): Tour => {
  if (tour.bookingProvider !== "fareharbor") return tour;

  const route = `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`;
  const record = getFareHarborRebuildRecord(route);
  if (!record) return tour;

  const images = unique(record.images);
  const heroImage = images[0] ?? tour.heroImage;
  const galleryImages = images.length
    ? images
    : unique([tour.heroImage, ...(tour.galleryImages ?? [])]);

  return {
    ...tour,
    shortDescription: record.description,
    longDescription: record.description,
    heroImage,
    primaryImageUrl: heroImage,
    galleryImages,
    content: {
      ...(tour.content ?? {}),
      overview: record.description,
      highlights: record.highlights.length
        ? record.highlights
        : tour.content?.highlights,
    },
    badges: {
      ...tour.badges,
      ...(record.duration ? { duration: record.duration } : {}),
    },
  };
};

export const applyFareHarborRebuildToEngine2Tour = (
  tour: Engine2Tour,
): Engine2Tour => {
  if (tour.bookingProvider !== "fareharbor") return tour;

  const record = getFareHarborRebuildRecord(tour.seo.canonicalPath);
  if (!record) return tour;

  const images = unique(record.images);
  const hero = images[0] ?? tour.images.hero;
  const gallery = images.length
    ? images
    : unique([tour.images.hero, ...(tour.images.gallery ?? [])]);

  return {
    ...tour,
    seo: {
      ...tour.seo,
      description: record.description,
      ...(hero ? { ogImage: hero } : {}),
    },
    content: {
      ...tour.content,
      experienceText: record.description,
      overview: record.description,
      highlights: record.highlights.length
        ? record.highlights
        : tour.content.highlights,
      ...(record.duration ? { duration: record.duration } : {}),
      ...(record.included?.length
        ? { inclusions: record.included, included: record.included }
        : {}),
      ...(record.notIncluded?.length
        ? { exclusions: record.notIncluded, notIncluded: record.notIncluded }
        : {}),
      ...(record.meetingPoint
        ? {
            meetingPoint: {
              ...(tour.content.meetingPoint ?? {}),
              instructions: record.meetingPoint,
            },
          }
        : {}),
    },
    images: {
      hero,
      gallery,
    },
  };
};
