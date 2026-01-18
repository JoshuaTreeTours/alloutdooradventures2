import { useMemo, useRef } from "react";

type AccordionOption = {
  label: string;
  value: string;
};

type AccordionSelectProps = {
  id: string;
  label: string;
  placeholder: string;
  options: AccordionOption[];
  value?: string;
  onSelect: (value: string) => void;
};

export default function AccordionSelect({
  id,
  label,
  placeholder,
  options,
  value,
  onSelect,
}: AccordionSelectProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const selectedLabel = useMemo(() => {
    if (value === undefined) {
      return placeholder;
    }
    const match = options.find((option) => option.value === value);
    return match?.label ?? placeholder;
  }, [options, placeholder, value]);

  const handleSelect = (nextValue: string) => {
    onSelect(nextValue);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <div>
      <span
        className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]"
        id={`${id}-label`}
      >
        {label}
      </span>
      <details
        ref={detailsRef}
        className="group mt-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 shadow-sm"
      >
        <summary
          id={`${id}-summary`}
          className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-[#2f4a2f]"
          aria-labelledby={`${id}-label ${id}-summary`}
        >
          <span>{selectedLabel}</span>
          <span
            aria-hidden="true"
            className="text-[#7a8a6b] transition-transform duration-200 group-open:rotate-180"
          >
            ▾
          </span>
        </summary>
        <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1 text-sm">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left font-semibold transition ${
                    isSelected
                      ? "border-[#2f4a2f] bg-[#f0f4ed] text-[#1f2a1f]"
                      : "border-[#d6decf] bg-white/90 text-[#2f4a2f] hover:border-[#2f4a2f]"
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <span className="text-[#2f4a2f]" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </details>
    </div>
  );
}
