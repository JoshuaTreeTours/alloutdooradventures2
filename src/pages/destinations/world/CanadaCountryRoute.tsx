import { Link } from "wouter";
import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { getEngine2CanadaProvinceIndex } from "../../../engine2/data/loadEngine2";
import { buildBreadcrumbList, buildItemList } from "../../../utils/structuredData";

export default function CanadaCountryRoute() {
  const provinces = getEngine2CanadaProvinceIndex();
  useStructuredData([
    buildBreadcrumbList([{ name: "Destinations", url: "/destinations" }, { name: "Canada", url: "/destinations/world/canada" }]),
    buildItemList(
      provinces.map(p => ({ name: p.provinceName, url: `/destinations/world/canada/${p.provinceSlug}` }))
    ),
  ]);

  return <main className="mx-auto max-w-5xl px-6 py-12"><Seo title="Canada Tours | All Outdoor Adventures" description="Explore Canada tours by province and city." /><h1 className="text-3xl font-semibold">Canada tours</h1><div className="mt-6 grid gap-3">{provinces.map(p => <Link key={p.provinceSlug} href={`/destinations/world/canada/${p.provinceSlug}`}><a className="rounded border p-4">{p.provinceName} ({p.tourCount})</a></Link>)}</div></main>;
}
