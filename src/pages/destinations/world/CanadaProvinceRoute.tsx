import { Link } from "wouter";
import Image from "../../../components/Image";
import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTours,
} from "../../../engine2/data/loadEngine2";
import {
  buildBreadcrumbList,
  buildItemList,
} from "../../../utils/structuredData";
import {
  buildCanadaActivityGroups,
  getTourActivityLabels,
  getTourCardImage,
} from "./canadaRouteData";

type Props = { params: { province: string } };

export default function CanadaProvinceRoute({ params }: Props) {
  const province = getEngine2CanadaProvinceIndex().find(
    p => p.provinceSlug === params.province
  );
  if (!province)
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Destination not found
      </main>
    );
  const provinceTours = getEngine2CanadaTours().filter(
    tour => tour.sourceProvinceSlug === province.provinceSlug
  );
  const activityGroups = buildCanadaActivityGroups(provinceTours).slice(0, 12);

  useStructuredData([
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "Canada", url: "/destinations/world/canada" },
      {
        name: province.provinceName,
        url: `/destinations/world/canada/${province.provinceSlug}`,
      },
    ]),
    buildItemList(
      province.cities.map(c => ({
        name: c.cityName,
        url: `/destinations/world/canada/${province.provinceSlug}/${c.citySlug}`,
      }))
    ),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Seo
        title={`${province.provinceName} Tours | Canada`}
        description={`Explore tours in ${province.provinceName}.`}
      />
      <h1 className="text-3xl font-semibold">{province.provinceName} tours</h1>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">Top cities</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {province.cities.map(c => (
            <Link
              key={c.citySlug}
              href={`/destinations/world/canada/${province.provinceSlug}/${c.citySlug}`}
            >
              <a className="rounded-full border border-[#2f4a2f]/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f] transition hover:bg-[#f0f4ee]">
                {c.cityName} ({c.tourIds.length})
              </a>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[#2f4a2f]">
          Available tours in {province.provinceName}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {provinceTours.map(tour => {
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
          Activities in {province.provinceName}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activityGroups.map(activity => (
            <Link
              key={activity.slug}
              href={`/destinations/world/canada/${province.provinceSlug}/activities/${activity.slug}`}
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
