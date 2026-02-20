import { useEffect, useMemo, useState } from "react";

type GuideThingsToDoItem = {
  title: string;
  name?: string;
  description: string;
  sourceUrl?: string;
  source_url?: string;
  wikiUrl?: string;
  imageUrl?: string | null;
  imageURL?: string | null;
  image?: string | null;
  image_link?: string | null;
  imageSrc?: string | null;
  heroImageUrl?: string | null;
};

type GuideThingsToDoCardProps = {
  index: number;
  item: GuideThingsToDoItem;
};

export function getImageUrl(item: GuideThingsToDoItem): string | undefined {
  const candidate =
    item.imageUrl ??
    item.imageURL ??
    item.image ??
    item.image_link ??
    item.imageSrc ??
    item.heroImageUrl;

  const url = typeof candidate === "string" ? candidate.trim() : "";
  return url.length ? url : undefined;
}

export default function GuideThingsToDoCard({
  index,
  item,
}: GuideThingsToDoCardProps) {
  const imageUrl = useMemo(() => getImageUrl(item), [item]);
  const sourceUrl = item.sourceUrl ?? item.source_url ?? item.wikiUrl;

  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    setImgOk(true);
  }, [imageUrl]);

  return (
    <li className="overflow-hidden rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      {imageUrl && imgOk ? (
        <div className="-m-4 mb-4 overflow-hidden md:-m-5 md:mb-5">
          <img
            src={imageUrl}
            alt={item.title || item.name || "Landmark"}
            loading="lazy"
            decoding="async"
            onError={() => setImgOk(false)}
            className="h-48 w-full object-cover md:h-56"
          />
        </div>
      ) : null}
      <p className="font-semibold text-[#1f2a1f]">
        {index}. {item.title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#405040] md:text-base">
        {item.description}
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
