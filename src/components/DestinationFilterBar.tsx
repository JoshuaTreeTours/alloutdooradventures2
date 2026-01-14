import { Link } from "wouter";

type Filter = {
  label: string;
  href: string;
};

type DestinationFilterBarProps = {
  title: string;
  description?: string;
  filters: Filter[];
};

export default function DestinationFilterBar({
  title,
  description,
  filters,
}: DestinationFilterBarProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          Explore by style
        </span>
        <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#405040] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {filters.map((filter) => (
          <Link key={filter.label} href={filter.href}>
            <a className="rounded-full border border-[#2f4a2f]/20 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] shadow-sm transition hover:border-[#2f4a2f]/50 hover:bg-white">
              {filter.label}
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
