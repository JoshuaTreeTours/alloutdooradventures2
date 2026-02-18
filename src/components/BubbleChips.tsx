import type { ReactNode } from "react";

type BubbleChipItem = {
  key: string;
  label: ReactNode;
};

type BubbleChipsProps = {
  items: BubbleChipItem[];
};

export default function BubbleChips({ items }: BubbleChipsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(item => (
        <span
          key={item.key}
          className="rounded-full border border-white/35 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em]"
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}
