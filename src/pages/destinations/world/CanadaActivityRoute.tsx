import { Link } from "wouter";
import Seo from "../../../components/Seo";
import { getActivityLabelFromSlug } from "../../../data/activityLabels";
import {
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaTours,
} from "../../../engine2/data/loadEngine2";

type Props = {
  params: {
    activitySlug: string;
    province?: string;
    city?: string;
  };
};

export default function CanadaActivityRoute({ params }: Props) {
  const provinces = getEngine2CanadaProvinceIndex();
  const province = params.province
    ? provinces.find(entry => entry.provinceSlug === params.province)
    : null;

  const tours = getEngine2CanadaTours().filter(tour => {
    if (params.province && tour.sourceProvinceSlug !== params.province)
      return false;
    if (params.city && tour.sourceCitySlug !== params.city) return false;
    const tags = ((tour as { activityTags?: string[] }).activityTags ?? []).map(
      tag => tag.toLowerCase().replace(/\s+/g, "-")
    );
    return tags.includes(params.activitySlug);
  });

  if (!tours.length) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        Destination not found
      </main>
    );
  }

  const activityLabel =
    getActivityLabelFromSlug(params.activitySlug) ??
    params.activitySlug.replace(/-/g, " ");
  const cityName = params.city ? tours[0].geo.city : null;
  const provinceName =
    province?.provinceName ?? (params.province ? tours[0].geo.region : null);
  const scopeLabel = cityName
    ? `${cityName}, ${provinceName}`
    : provinceName
      ? provinceName
      : "Canada";

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Seo
        title={`${activityLabel} Tours in ${scopeLabel} | Canada`}
        description={`Browse ${activityLabel} tours in ${scopeLabel}.`}
      />
      <div className="space-y-2">
        <Link
          href={
            params.city
              ? `/destinations/world/canada/${params.province}/${params.city}`
              : params.province
                ? `/destinations/world/canada/${params.province}`
                : "/destinations/world/canada"
          }
        >
          <a className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
            Back to {scopeLabel}
          </a>
        </Link>
        <h1 className="text-3xl font-semibold text-[#1f2a1f]">
          {activityLabel} tours in {scopeLabel}
        </h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tours.map(tour => (
          <Link key={tour.id} href={tour.seo.canonicalPath}>
            <a className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow">
              <h2 className="text-base font-semibold text-[#1f2a1f]">
                {tour.name}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-[#405040]">
                {tour.content.experienceText}
              </p>
            </a>
          </Link>
        ))}
      </div>
    </main>
  );
}
