import { Link } from "wouter";

type CrossLink = {
  title: string;
  description: string;
  href: string;
};

type CrossLinksProps = {
  heading?: string;
  links?: CrossLink[];
};

const DEFAULT_LINKS: CrossLink[] = [
  {
    title: "Yosemite National Park",
    description: "Iconic cliffs, waterfalls, and legendary valley hikes.",
    href: "/destinations/parks/yosemite",
  },
  {
    title: "Lake Tahoe",
    description: "Blue-water views with shoreline trails and summit gondolas.",
    href: "/destinations/lakes/lake-tahoe",
  },
  {
    title: "Sequoia & Kings Canyon",
    description: "Giant trees, granite canyons, and high-alpine lakes.",
    href: "/destinations/parks/sequoia",
  },
];

export default function CrossLinks({
  heading = "Keep exploring",
  links = DEFAULT_LINKS,
}: CrossLinksProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="Cross links">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-semibold text-[#2f4a2f]">
          {heading}
        </h2>
        <Link href="/destinations">
          <a className="text-sm font-semibold text-[#2f4a2f] hover:text-[#1f2a1f]">
            View all destinations
          </a>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {links.map((link) => (
          <Link key={link.title} href={link.href}>
            <a className="rounded-xl border border-black/10 bg-white/70 p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-base font-semibold text-[#1f2a1f]">
                {link.title}
              </h3>
              <p className="mt-2 text-sm text-[#405040] leading-relaxed">
                {link.description}
              </p>
              <span className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-[#7a8a6b]">
                Explore
              </span>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
