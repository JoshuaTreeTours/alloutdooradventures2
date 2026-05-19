import { buildImageUrl } from "../utils/seo";
import type { buildBookingMeta, buildTourMeta } from "./tourMeta";

type Tour = {
  slug: string;
  destination: { stateSlug: string; citySlug: string };
  heroImage?: string | null;
};

type MetaBuilder = typeof buildTourMeta;
type BookingBuilder = typeof buildBookingMeta;

const LEGACY_DETAIL_RE =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)\/?$/;

export const buildLegacyTourRouteSeo = ({
  pathname,
  tours,
  buildTourMetaFn,
  buildBookingMetaFn,
  site,
}: {
  pathname: string;
  tours: Tour[];
  buildTourMetaFn: MetaBuilder;
  buildBookingMetaFn?: BookingBuilder;
  site: string;
}) => {
  const detailMatch = pathname.match(LEGACY_DETAIL_RE);
  if (!detailMatch) return null;

  const [, stateSlug, citySlug, tourSlug] = detailMatch;
  const tour = tours.find(
    t =>
      t.destination.stateSlug === stateSlug &&
      t.destination.citySlug === citySlug &&
      t.slug === tourSlug
  );
  if (!tour) return null;

  const canonical = `${site}${pathname}`;
  const meta = buildTourMetaFn(tour as any, canonical);

  return {
    title: meta.title,
    description: meta.description,
    url: meta.canonical,
    image: buildImageUrl((tour as any).heroImage ?? null),
  };
};
