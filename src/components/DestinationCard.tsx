import { Link } from "wouter";

import type { Destination } from "../data/destinations";
import CanonicalImage from "./CanonicalImage";

const PLACEHOLDER_WARNING = "Image missing";

type DestinationCardProps = {
  destination: Destination;
  ctaLabel: string;
  headingLevel?: "h2" | "h3";
  descriptionVariant?: "default" | "featured";
};

export default function DestinationCard({
  destination,
  ctaLabel,
  headingLevel = "h3",
  descriptionVariant = "default",
}: DestinationCardProps) {
  const { image } = destination;
  const trimmedImage = image?.trim();
  const hasImage = Boolean(trimmedImage);
  const description =
    descriptionVariant === "featured"
      ? destination.featuredDescription ?? destination.description
      : destination.description;
  const HeadingTag = headingLevel;

  if (descriptionVariant === "featured") {
    return (
      <Link href={destination.href}>
        <a className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e1e5dc] bg-white shadow-sm transition hover:shadow-md md:flex-row">
          <div
            className={`relative h-56 w-full flex-shrink-0 md:h-60 md:w-72 lg:w-80 ${
              hasImage ? "" : "bg-[#b8a693]"
            }`}
          >
            {hasImage ? (
              <CanonicalImage
                src={trimmedImage ?? ""}
                fallbackSrc="/hero.jpg"
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col justify-between gap-4 p-6 text-[#243424]">
            <div>
              <HeadingTag className="text-xl font-semibold text-[#2f4a2f]">
                {destination.name}
              </HeadingTag>
              <p className="mt-3 text-sm text-[#405040]">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!hasImage ? (
                <span className="inline-flex w-fit items-center rounded-full bg-amber-500/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-950">
                  {PLACEHOLDER_WARNING}
                </span>
              ) : null}
              <span className="inline-flex w-fit items-center rounded-full bg-[#2f4a2f]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                {ctaLabel}
              </span>
            </div>
          </div>
        </a>
      </Link>
    );
  }

  return (
    <Link href={destination.href}>
      <a className="group relative h-48 overflow-hidden rounded-xl sm:h-56 ...">
        <div
          className={`absolute inset-0 ${
            hasImage ? "" : "bg-[#b8a693]"
          }`}
        >
          {hasImage ? (
            <CanonicalImage
              src={trimmedImage ?? ""}
              fallbackSrc="/hero.jpg"
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative flex h-48 flex-col justify-end p-6 text-white sm:h-56">
          <HeadingTag className="text-xl font-semibold">
            {destination.name}
          </HeadingTag>
          <p className="mt-2 text-sm text-white/90">{description}</p>
          {!hasImage ? (
            <span className="mt-3 inline-flex w-fit items-center rounded-full bg-amber-500/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-950">
              {PLACEHOLDER_WARNING}
            </span>
          ) : null}
          <span className="mt-4 inline-flex w-fit items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            {ctaLabel}
          </span>
        </div>
      </a>
    </Link>
  );
}
