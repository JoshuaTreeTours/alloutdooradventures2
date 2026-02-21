import { useEffect, useMemo, useState } from "react";
import { extractLandmarkNameFromTitle } from "../../utils/guides/getLandmarkImage";
import { cleanThingDescription } from "../../utils/guides/cleanThingDescription";
import { fetchWikiImage } from "../../utils/guides/fetchWikiImage";

type LandmarkCardProps = {
  index: number;
  city: string;
  citySlug?: string;
  title: string;
  description: string;
  sourceUrl?: string;
  wikiUrl?: string;
  imageUrl?: string | null;
  disableImage?: boolean;
  requireImage?: boolean;
};

export default function LandmarkCard({
  index,
  city,
  citySlug,
  title,
  description,
  sourceUrl,
  wikiUrl,
  imageUrl,
  disableImage,
  requireImage,
}: LandmarkCardProps) {
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

    fetchWikiImage({
      title: landmarkName,
      city,
      citySlug,
      wikiUrl,
    }).then(result => {
      if (!cancelled) {
        setResolvedImageUrl(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [city, citySlug, disableImage, landmarkName, resolvedImageUrl, wikiUrl]);

  const hasRenderableImage = Boolean(resolvedImageUrl) && !isImageBroken;

  if (requireImage && !hasRenderableImage) {
    return null;
  }

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      {hasRenderableImage ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={resolvedImageUrl!}
            alt={title}
            loading="lazy"
            className="h-48 w-full object-cover md:h-56"
            onError={() => setIsImageBroken(true)}
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
          Source: Wikipedia
        </a>
      ) : null}
    </li>
  );
}
