import { Link } from "wouter";

import Seo from "../components/Seo";

type RemovedTourGoneProps = {
  cityToursPath: string;
};

export default function RemovedTourGone({ cityToursPath }: RemovedTourGoneProps) {
  return (
    <>
      <Seo
        title="Tour no longer available | All Outdoor Adventures"
        description="This tour is no longer available."
        robots="noindex,nofollow"
        googlebot="noindex,nofollow"
      />
      <main className="mx-auto max-w-4xl px-6 py-16 text-[#1f2a1f]">
        <h1 className="text-2xl font-semibold">This tour is no longer available</h1>
        <p className="mt-4 text-sm text-[#405040]">
          This tour has been removed and can no longer be booked on All Outdoor
          Adventures.
        </p>
        <div className="mt-6">
          <Link href={cityToursPath}>
            <a className="inline-flex items-center justify-center rounded-md bg-[#2f4a2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#294129]">
              Browse other tours
            </a>
          </Link>
        </div>
      </main>
    </>
  );
}
