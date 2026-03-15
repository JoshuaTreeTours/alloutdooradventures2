import { Link } from "wouter";

import Image from "../../components/Image";
import type { Engine6ListingItem } from "../types";

export default function Engine6ListingCard({
  item,
}: {
  item: Engine6ListingItem;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="relative h-48 w-full bg-black/5">
        {item.heroImage ? (
          <Image
            src={item.heroImage}
            fallbackSrc={item.heroImage}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[#1f2a1f]">{item.title}</h3>
        <p className="mt-2 text-sm text-[#405040] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
          {item.shortDescription}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#2f4a2f]">
          {item.fromPriceText ? <span>From {item.fromPriceText}</span> : null}
          {typeof item.ratingValue === "number" ? (
            <span>
              {item.ratingValue.toFixed(1)} ({Math.round(item.reviewCount ?? 0)}{" "}
              reviews)
            </span>
          ) : null}
        </div>
        <Link href={item.href}>
          <a className="mt-4 inline-flex rounded-full bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white">
            View Engine6 Tour
          </a>
        </Link>
      </div>
    </article>
  );
}
