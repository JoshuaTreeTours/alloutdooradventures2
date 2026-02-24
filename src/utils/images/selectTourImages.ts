type SelectTourImagesArgs = {
  derivedImages?: string[];
  fallbackHeroUrl: string;
  galleryMax?: number;
};

const FILESTACK_RESIZE_TOKEN_RE =
  /^https?:\/\/cdn\.filestackcontent\.com\/resize\/?$/i;

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const sanitizeUrl = (value: string) => value.trim();

export const selectTourImages = ({
  derivedImages,
  fallbackHeroUrl,
  galleryMax = 2,
}: SelectTourImagesArgs) => {
  const normalizedFallback = sanitizeUrl(fallbackHeroUrl);
  const normalizedDerived = (derivedImages ?? [])
    .filter((image): image is string => typeof image === "string")
    .map(sanitizeUrl)
    .filter(Boolean)
    .filter(isValidHttpUrl)
    .filter(image => !FILESTACK_RESIZE_TOKEN_RE.test(image));

  const unique: string[] = [];
  for (const image of normalizedDerived) {
    if (!unique.includes(image)) {
      unique.push(image);
    }
  }

  const heroImage = unique[0] ?? normalizedFallback;
  const galleryImages = unique.slice(1, 1 + Math.max(0, galleryMax));
  const allImagesForSchema = [heroImage, ...galleryImages].filter(
    (image, index, arr) => Boolean(image) && arr.indexOf(image) === index
  );

  return {
    heroImage,
    galleryImages,
    allImagesForSchema,
  };
};
