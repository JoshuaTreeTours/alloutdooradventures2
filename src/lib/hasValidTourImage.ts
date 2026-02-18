const DISALLOWED_IMAGE_PATHS = new Set(["/default-tour.jpg"]);

type TourImageCandidate = {
  heroImage?: string | null;
  image?: string | null;
  image_url?: string | null;
};

const isHttpImageUrl = (value: string) => /^https?:\/\//i.test(value);

export function hasValidTourImage(tour: TourImageCandidate): boolean {
  const rawImage = tour.heroImage ?? tour.image ?? tour.image_url ?? "";
  const image = rawImage.trim();

  if (!image || DISALLOWED_IMAGE_PATHS.has(image)) {
    return false;
  }

  return isHttpImageUrl(image);
}
