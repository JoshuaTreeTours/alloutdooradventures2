import { Link } from "wouter";

import type { Destination } from "../data/destinations";
import Image from "./Image";

const PLACEHOLDER_WARNING = "Image missing";

type DestinationCardProps = {
  destination: Destination;
  ctaLabel: string;
  headingLevel?: "h2" | "h3";
  descriptionVariant?: "default" | "featured";
  imageLoading?: "eager" | "lazy";
};

const buildUnsplashSource = (
  url: string,
  format: "avif" | "webp",
) => {
  if (!url.startsWith("http")) {
    return null;
  }

  if (!url.includes("images.unsplash.com")) {
    return null;
  }

  const parsed = new URL(url);
  parsed.searchParams.set("fm", format);
  return parsed.toString();
};

export default function DestinationCard({
  destination,
  ctaLabel,
  headingLevel = "h3",
  descriptionVariant = "default",
  imageLoading = "lazy",
}: DestinationCardProps) {
  const name = destination?.name ?? "Destination";
  const href = destination?.href ?? "/destinations";
  const { image } = destination ?? {};
  const trimmedImage = image?.trim();
  const hasImage = Boolean(trimmedImage);
  const description =
    descriptionVariant === "featured"
      ? destination?.featuredDescription ?? destination?.description ?? ""
      : destination?.description ?? "";
  const HeadingTag = headingLevel;
  const isDebugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debugImages") === "1";
  const debugSrc = hasImage ? trimmedImage : "/hero.jpg";
  const resolvedDebugSrc =
    typeof window !== "undefined" && debugSrc
      ? new URL(debugSrc, window.location.origin).href
      : debugSrc ?? "";
  const avifSource = trimmedImage
    ? buildUnsplashSource(trimmedImage, "avif")
    : null;
  const webpSource = trimmedImage
    ? buildUnsplashSource(trimmedImage, "webp")
    : null;
  const imageSources =
    avifSource && webpSource
      ? [
          { type: "image/avif", srcSet: avifSource },
          { type: "image/webp", srcSet: webpSource },
        ]
      : [];

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
              <Image
                src={trimmedImage ?? ""}
                fallbackSrc="/hero.jpg"
                alt=""
                loading="lazy"
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
    <Link href={href}>
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
              loading={imageLoading}
              sources={imageSources}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative flex h-56 flex-col justify-end p-6 text-white">
          <HeadingTag className="text-xl font-semibold">
            {name}
          </HeadingTag>
          <p className="mt-2 text-sm text-white/90">{description}</p>
          {isDebugEnabled ? (
            <span className="mt-1 inline-flex w-fit rounded bg-white/20 px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white/80">
              {resolvedDebugSrc}
            </span>
          ) : null}
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
