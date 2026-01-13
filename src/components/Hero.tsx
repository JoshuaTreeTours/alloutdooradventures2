import { PLACEHOLDER_IMAGE, SITE_HERO_IMAGE } from "../utils/images";

type HeroProps = {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function Hero({
  title = "Explore the High Sierra",
  subtitle =
    "Granite peaks, alpine lakes, and legendary trails make this a dream basecamp.",
  imageUrl = SITE_HERO_IMAGE,
  ctaLabel = "View Experiences",
  ctaHref = "/tours",
}: HeroProps) {
  return (
    <section className="relative mx-auto max-w-[1400px] px-6 pt-6" aria-label="Hero">
      <div className="relative overflow-hidden rounded-none md:rounded-md">
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative px-6 py-28 md:px-16 md:py-44 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-white/90 leading-relaxed">
            {subtitle}
          </p>
          <a
            href={ctaHref}
            className="mt-8 inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#294129] transition"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
