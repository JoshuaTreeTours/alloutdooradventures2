import { Link } from "wouter";

export type GuideLinkPillItem = {
  href: string;
  label: string;
};

type GuideLinkPillProps = {
  link: GuideLinkPillItem;
  className?: string;
};

const defaultChipClass =
  "inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]";

export default function GuideLinkPill({
  link,
  className = defaultChipClass,
}: GuideLinkPillProps) {
  return (
    <Link href={link.href}>
      <a className={className}>{link.label}</a>
    </Link>
  );
}
