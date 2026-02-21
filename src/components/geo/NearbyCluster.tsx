import { Link } from "wouter";

import Image from "../Image";
import {
  getNearbyClusterData,
  type NearbyContext,
} from "../../utils/geo/getNearbyByDistance";

type NearbyClusterProps = {
  context: NearbyContext;
  maxGuides?: number;
  maxTours?: number;
};

const Card = ({
  href,
  title,
  distanceMiles,
  image,
}: {
  href: string;
  title: string;
  distanceMiles: number;
  image?: string;
}) => (
  <Link href={href}>
    <a className="rounded-xl border border-black/10 bg-white p-3 text-sm shadow-sm transition hover:border-[#2f4a2f]/35">
      {image ? (
        <Image
          src={image}
          fallbackSrc={image}
          alt={title}
          className="mb-3 h-24 w-full rounded-lg object-cover"
        />
      ) : null}
      <p className="font-semibold text-[#1f2a1f]">{title}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7a8a6b]">
        {Math.round(distanceMiles)} miles away
      </p>
    </a>
  </Link>
);

export default function NearbyCluster({
  context,
  maxGuides = 8,
  maxTours = 10,
}: NearbyClusterProps) {
  const { nearbyGuides, nearbyTours } = getNearbyClusterData({
    context,
    maxGuides,
    maxTours,
  });

  if (nearbyGuides.length < 3 && nearbyTours.length < 3) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="space-y-8 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm md:p-8">
        {nearbyGuides.length >= 3 ? (
          <div>
            <h2 className="text-xl font-semibold text-[#2f4a2f]">
              Nearby Guides
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyGuides.map(item => (
                <Card
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  distanceMiles={item.distanceMiles}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        ) : null}

        {nearbyTours.length >= 3 ? (
          <div>
            <h2 className="text-xl font-semibold text-[#2f4a2f]">
              Nearby Tours
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {nearbyTours.map(item => (
                <Card
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  distanceMiles={item.distanceMiles}
                  image={item.image}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
