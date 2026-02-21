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
  fallbackImageUrl?: string;
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
  disableImage,
}: GuideThingsToDoCardProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(
    disableImage ? null : imageUrl ?? null
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
    setResolvedImageUrl(disableImage ? null : imageUrl ?? null);
    setIsImageBroken(false);
  }, [disableImage, imageUrl]);

  useEffect(() => {
    let cancelled = false;

    if (disableImage || resolvedImageUrl) {
      return;
    }

    getLandmarkImage(landmarkName, city).then(result => {
      if (!cancelled) {
        setResolvedImageUrl(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [city, disableImage, landmarkName, resolvedImageUrl]);

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      {resolvedImageUrl && !isImageBroken ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={resolvedImageUrl}
            alt={title}
            loading="lazy"
            className="h-48 w-full object-cover md:h-56"
            onError={() => {
              if (fallbackImageUrl && resolvedImageUrl !== fallbackImageUrl) {
                setResolvedImageUrl(fallbackImageUrl);
                return;
              }
              setIsImageBroken(true);
            }}
          />
        </div>
      ) : null}
      <p className="font-semibold text-[#1f2a1f]">
        {index}. {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#405040] md:text-base">
        {cleanedDescription}
      </p>
      {wikiUrl || sourceUrl ? (
        <a
          href={wikiUrl ?? sourceUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-[#1f2a1f] underline"
        >
          Source: Wikipedia
        </a>
      ) : null}
    </li>
  );
}
