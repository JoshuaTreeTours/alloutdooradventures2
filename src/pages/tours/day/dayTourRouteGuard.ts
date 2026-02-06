import { getTourById, getTourDetailPath } from "../../../data/tours";

export const extractIdFromSlug = (slug: string): string | null => {
  const match = slug.match(/-(\d+)(?:\/)?$/);
  return match?.[1] ?? null;
};

export const maybeResolveLegacyDayTourPath = (pathname: string) => {
  const lastSegment = pathname.split("/").filter(Boolean).at(-1);
  if (!lastSegment) {
    return null;
  }

  const id = extractIdFromSlug(lastSegment);
  if (!id) {
    return null;
  }

  const tour = getTourById(id);
  if (!tour) {
    return {
      removed: true,
      id,
    } as const;
  }

  return {
    removed: false,
    id,
    canonicalPath: getTourDetailPath(tour),
  } as const;
};
