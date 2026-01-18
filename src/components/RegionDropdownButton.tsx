import { useId, useRef } from "react";

type RegionOption = {
  name: string;
  slug: string;
};

type RegionDropdownButtonProps = {
  label: string;
  options: RegionOption[];
  onSelect: (slug: string) => void;
  selectedName?: string;
  className?: string;
};

export default function RegionDropdownButton({
  label,
  options,
  onSelect,
  selectedName,
  className,
}: RegionDropdownButtonProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const labelId = useId();

  const handleSelect = (slug: string) => {
    onSelect(slug);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details
      ref={detailsRef}
      className={`group w-full rounded-2xl border border-[#d6decf] bg-white/80 p-5 shadow-sm ${
        className ?? ""
      }`}
    >
      <summary
        aria-labelledby={labelId}
        className="flex cursor-pointer list-none items-center justify-between gap-4 text-[#2f4a2f]"
      >
        {selectedName ? (
          <span className="flex flex-col text-left">
            <span
              id={labelId}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
            >
              {label}
            </span>
            <span className="text-base font-semibold text-[#2f4a2f] sm:text-lg">
              {selectedName}
            </span>
          </span>
        ) : (
          <span
            id={labelId}
            className="text-base font-semibold text-[#2f4a2f] sm:text-lg"
          >
            {label}
          </span>
        )}
        <span
          aria-hidden="true"
          className="text-lg text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <ul className="mt-4 grid gap-2 text-sm text-[#2f4a2f] sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <li key={option.slug}>
            <button
              type="button"
              onClick={() => handleSelect(option.slug)}
              className="flex w-full items-center gap-2 rounded-full border border-[#d6decf] px-4 py-2 text-left transition hover:border-[#2f4a2f] hover:text-[#1f2a1f]"
            >
              {option.name}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
