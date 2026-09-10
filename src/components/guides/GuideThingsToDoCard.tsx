import { useEffect, useMemo, useState } from "react";
import {
  extractLandmarkNameFromTitle,
  getLandmarkImage,
} from "../../utils/guides/getLandmarkImage";
import { cleanThingDescription } from "../../utils/guides/cleanThingDescription";

type GuideThingsToDoCardProps = {
  index: number;
  city: string;
  title: string;
  description: string;
  sourceUrl?: string;
  wikiUrl?: string;
  imageUrl?: string | null;
  fallbackImageUrl?: string | null;
  fallbackImageAlt?: string;
  disableImage?: boolean;
};

export default function GuideThingsToDoCard({
  index,
  city,
  title,
  description,
  sourceUrl,
  wikiUrl,
  imageUrl,
  fallbackImageUrl,
  fallbackImageAlt,
  disableImage,
}: GuideThingsToDoCardProps) {
  const initialImageUrl = disableImage
    ? null
    : imageUrl ?? fallbackImageUrl ?? null;
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(
    initialImageUrl
  );
  const [isImageBroken, setIsImageBroken] = useState(false);

  const landmarkName = useMemo(
    () => extractLandmarkNameFromTitle(title),
    [title]
  );

  const cleanedDescription = useMemo(
    () => cleanThingDescription(description),
    [description]
  );

  useEffect(() => {
    setResolvedImageUrl(
      disableImage ? null : imageUrl ?? fallbackImageUrl ?? null
    );
    setIsImageBroken(false);
  }, [disableImage, fallbackImageUrl, imageUrl]);

  useEffect(() => {
    let cancelled = false;

    if (disableImage || imageUrl) {
      return;
    }

    getLandmarkImage(landmarkName, city).then(result => {
      if (!cancelled) {
        setResolvedImageUrl(result ?? fallbackImageUrl ?? null);
        setIsImageBroken(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [city, disableImage, fallbackImageUrl, imageUrl, landmarkName]);

  const isUsingFallbackImage =
    Boolean(fallbackImageUrl) &&
    resolvedImageUrl === fallbackImageUrl &&
    resolvedImageUrl !== imageUrl;

  const handleImageError = () => {
    if (
      fallbackImageUrl &&
      resolvedImageUrl &&
      resolvedImageUrl !== fallbackImageUrl
    ) {
      setResolvedImageUrl(fallbackImageUrl);
      setIsImageBroken(false);
      return;
    }

    setIsImageBroken(true);
  };

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-5">
      {resolvedImageUrl && !isImageBroken ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={resolvedImageUrl}
            alt={
              isUsingFallbackImage
                ? fallbackImageAlt ?? `${city} travel scenery`
                : title
            }
            loading="lazy"
            className="h-48 w-full object-cover md:h-64"
            onError={handleImageError}
          />
        </div>
      ) : null}
      <p className="font-semibold text-[#1f2a1f]">
        {index}. {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#405040] md:text-base">
        {cleanedDescription}
      </p>
      {wikiUrl ? (
        <a
          href={wikiUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[#1f2a1f] underline"
        >
          Source: Wikipedia
        </a>
      ) : sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[#1f2a1f] underline"
        >
          Source
        </a>
      ) : null}
    </li>
  );
}
