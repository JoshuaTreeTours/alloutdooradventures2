import { Link } from "wouter";

import Image from "./Image";

type EditorialSpotlightProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  image: string;
};

export default function EditorialSpotlight({
  eyebrow,
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  image,
}: EditorialSpotlightProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center gap-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
            {eyebrow}
          </span>
          <h2 className="text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
            {title}
          </h2>
          <p className="text-sm text-[#405040] md:text-base">{description}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#405040]">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#2f4a2f]" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link href={ctaHref}>
              <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#294129]">
                {ctaLabel}
              </a>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
          <Image
            src={image}
            fallbackSrc="/hero.jpg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
