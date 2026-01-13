import { Link } from "wouter";

import type { Destination } from "../data/destinations";
import Image from "./Image";

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

  return (
    <Link href={destination.href}>
      <a className="group relative h-56 overflow-hidden rounded-xl ...">
        <div
          className={`absolute inset-0 ${
            hasImage ? "" : "bg-[#b8a693]"
          }`}
        >
          {hasImage ? (
            <Image
              src={trimmedImage ?? ""}
              fallbackSrc="/hero.jpg"
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative flex h-56 flex-col justify-end p-6 text-white">
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
