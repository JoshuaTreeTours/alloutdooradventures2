import { useMemo, useState } from "react";
import { cleanThingDescription } from "../../utils/guides/cleanThingDescription";

type GuideThingsToDoCardProps = {
  index: number;
  city: string;
  title: string;
  description: string;
  sourceUrl?: string;
  wikiUrl?: string;
  imageUrl?: string | null;
  disableImage?: boolean;
};

export default function GuideThingsToDoCard({
  index,
  title,
  description,
  sourceUrl,
  wikiUrl,
  imageUrl,
  disableImage,
}: GuideThingsToDoCardProps) {
  const [hideImage, setHideImage] = useState(false);

  const cleanedDescription = useMemo(
    () => cleanThingDescription(description),
    [description]
  );

  const canRenderImage = !disableImage && Boolean(imageUrl?.trim()) && !hideImage;

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      {canRenderImage ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={imageUrl as string}
            alt={title}
            loading="lazy"
            className="h-48 w-full object-cover md:h-56"
            onError={() => setHideImage(true)}
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
