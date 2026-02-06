import { Link } from "wouter";

import Seo from "./Seo";

type ListingUnavailableProps = {
  title?: string;
  description?: string;
  statusCode?: 404 | 410;
};

export default function ListingUnavailable({
  title = "Listing no longer available",
  description = "This listing may have moved or is no longer offered.",
  statusCode = 410,
}: ListingUnavailableProps) {
  const seoTitle = `${title} (${statusCode}) | All Outdoor Adventures`;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
      <Seo title={seoTitle} description={description} />
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-4 text-sm text-[#405040]">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/tours">
          <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
            Browse tours
          </a>
        </Link>
        <Link href="/destinations">
          <a className="inline-flex items-center justify-center rounded-md border border-[#2f4a2f] px-4 py-2 text-sm font-semibold text-[#2f4a2f] transition hover:bg-[#2f4a2f] hover:text-white">
            Explore destinations
          </a>
        </Link>
      </div>
    </main>
  );
}
