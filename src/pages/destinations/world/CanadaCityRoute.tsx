import { Link } from "wouter";
import Image from "../../../components/Image";
import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { getEngine2CanadaTours } from "../../../engine2/data/loadEngine2";
import {
  buildBreadcrumbList,
  buildItemList,
} from "../../../utils/structuredData";
import {
  buildCanadaActivityGroups,
  getTourActivityLabels,
  getTourCardImage,
} from "./canadaRouteData";

type Props = { params: { province: string; city: string } };

export default function CanadaCityRoute({ params }: Props) {
  const tours = getEngine2CanadaTours().filter(
    t =>
      t.sourceProvinceSlug === params.province &&
      t.sourceCitySlug === params.city
  );
  if (!tours.length)
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Destination not found
      </main>
    );
  const city = tours[0].geo.city;
  const provinceName = tours[0].geo.region;
  const activityGroups = buildCanadaActivityGroups(tours).slice(0, 12);
  useStructuredData([
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "Canada", url: "/destinations/world/canada" },
      {
        name: provinceName,
        url: `/destinations/world/canada/${params.province}`,
      },
      {
        name: city,
        url: `/destinations/world/canada/${params.province}/${params.city}`,
      },
    ]),
    buildItemList(
      tours.map(t => ({
        name: t.name,
        url: t.seo.canonicalPath,
        image: [t.images.hero || t.seo.ogImage],
      }))
    ),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Seo
        title={`${city} Tours & Activities | Canada`}
        description={`Find tours in ${city}, ${provinceName}, including outdoor adventures, attractions, and guided experiences matched to your travel plans.`}
      />
      <h1 className="text-3xl font-semibold">{city} tours</h1>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">
          Available tours
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map(tour => {
            const image = getTourCardImage(tour);
            const activityLabels = getTourActivityLabels(tour);
            return (
              <Link key={tour.id} href={tour.seo.canonicalPath}>
                <a className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow">
                  <div className="relative h-40 bg-[#dfe9d8]">
                    {image ? (
                      <Image
                        src={image}
                        fallbackSrc={image}
                        alt={tour.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="text-sm font-semibold text-[#1f2a1f]">
                      {tour.name}
                    </h3>
                    {activityLabels.length ? (
                      <div className="flex flex-wrap gap-2">
                        {activityLabels.map(label => (
                          <span
                            key={`${tour.id}-${label}`}
                            className="rounded-full border border-[#2f4a2f]/15 bg-[#f0f4ee] px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#2f4a2f]"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">
          Activities in {city}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activityGroups.map(activity => (
            <Link
              key={activity.slug}
              href={`/destinations/world/canada/${params.province}/${params.city}/activities/${activity.slug}`}
            >
              <a className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow">
                <div className="relative h-36 bg-[#dfe9d8]">
                  {activity.image ? (
                    <Image
                      src={activity.image}
                      fallbackSrc={activity.image}
                      alt={activity.label}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f4a2f]">
                    {activity.label}
                  </h3>
                  <p className="mt-1 text-xs text-[#405040]">
                    {activity.count} tours
                  </p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
