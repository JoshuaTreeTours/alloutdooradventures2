import type { ReactNode } from "react";
import { useRef } from "react";

type HorizontalCardSliderProps<T> = {
  items: T[];
  ariaLabel: string;
  getKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  cardClassName?: string;
};

export default function HorizontalCardSlider<T>({
  items,
  ariaLabel,
  getKey,
  renderItem,
  cardClassName = "min-w-[280px] max-w-[320px] flex-shrink-0 md:min-w-[320px]",
}: HorizontalCardSliderProps<T>) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = (direction: "previous" | "next") => {
    if (!sliderRef.current) {
      return;
    }

    const scrollWidth = sliderRef.current.clientWidth * 0.85;
    sliderRef.current.scrollBy({
      left: direction === "previous" ? -scrollWidth : scrollWidth,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="mb-4 hidden justify-end gap-3 md:flex">
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
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        role="region"
        aria-label={ariaLabel}
      >
        {items.map((item, index) => (
          <div
            key={getKey(item, index)}
            className={`${cardClassName} snap-start`}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
