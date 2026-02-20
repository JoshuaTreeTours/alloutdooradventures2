import { useEffect, useMemo, useState } from "react";
import {
  extractLandmarkNameFromTitle,
  getLandmarkImage,
} from "../../utils/guides/getLandmarkImage";

type GuideThingsToDoCardProps = {
  index: number;
  city: string;
  title: string;
  description: string;
  sourceUrl?: string;
  imageUrl?: string | null;
};

export default function GuideThingsToDoCard({
  index,
  city,
  title,
  description,
  sourceUrl,
  imageUrl,
}: GuideThingsToDoCardProps) {
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(
    imageUrl ?? null
  );

  const landmarkName = useMemo(
    () => extractLandmarkNameFromTitle(title),
    [title]
  );

  useEffect(() => {
    let cancelled = false;

    if (resolvedImageUrl) {
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
  }, [city, landmarkName, resolvedImageUrl]);

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      {resolvedImageUrl ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={resolvedImageUrl}
            alt={title}
            loading="lazy"
            className="h-48 w-full object-cover md:h-56"
          />
        </div>
      ) : null}
      <p className="font-semibold text-[#1f2a1f]">
        {index}. {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#405040] md:text-base">
        {description}
      </p>
      {sourceUrl ? (
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
