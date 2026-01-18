import { useRef } from "react";
import { Link } from "wouter";

export type HorizontalLinkSliderItem = {
  label: string;
  href: string;
};

type HorizontalLinkSliderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  items: HorizontalLinkSliderItem[];
  ariaLabel: string;
};

export default function HorizontalLinkSlider({
  eyebrow,
  title,
  description,
  items,
  ariaLabel,
}: HorizontalLinkSliderProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollAmount = 320;

  const handleScroll = (direction: "previous" | "next") => {
    if (!sliderRef.current) {
      return;
    }

    sliderRef.current.scrollBy({
      left: direction === "previous" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          {eyebrow}
        </span>
        <h3 className="mt-2 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
          {title}
        </h3>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm text-[#405040] md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => handleScroll("previous")}
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] shadow-sm transition hover:-translate-y-0.5 hover:shadow"
          aria-label={`View previous ${ariaLabel}`}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => handleScroll("next")}
          className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[#2f4a2f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#294129]"
          aria-label={`View next ${ariaLabel}`}
        >
          Next
        </button>
      </div>

      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-4"
        role="region"
        aria-label={ariaLabel}
      >
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className="min-w-[180px] flex-shrink-0 rounded-2xl border border-black/10 bg-white/90 px-4 py-4 text-sm font-semibold text-[#1f2a1f] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              {item.label}
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
