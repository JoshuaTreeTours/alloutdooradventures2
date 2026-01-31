export type HeroPageType =
  | "home"
  | "state"
  | "city"
  | "destination"
  | "activity"
  | "product";

export const HOME_HERO_IMAGE = "/hero.jpg";

const normalizeHeroImage = (image?: string) => (image ?? "").trim();

const isHomeHeroImage = (image?: string) => {
  const normalized = normalizeHeroImage(image);
  if (!normalized) {
    return false;
  }

  return normalized === HOME_HERO_IMAGE || normalized.endsWith("/hero.jpg");
};

export const filterHeroImages = (
  images: Array<string | undefined>,
  pageType: HeroPageType,
) => {
  const uniqueImages = images
    .map((image) => normalizeHeroImage(image))
    .filter((image) => Boolean(image))
    .filter((image, index, list) => list.indexOf(image) === index);

  if (pageType === "home") {
    return uniqueImages;
  }

  return uniqueImages.filter((image) => !isHomeHeroImage(image));
};

export const resolveHeroImage = ({
  pageType,
  primary,
  fallbacks = [],
}: {
  pageType: HeroPageType;
  primary?: string;
  fallbacks?: Array<string | undefined>;
}) => {
  const candidates = filterHeroImages([primary, ...fallbacks], pageType);
  return candidates[0];
};
