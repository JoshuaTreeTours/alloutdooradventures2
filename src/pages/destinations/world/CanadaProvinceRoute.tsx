import { Link } from "wouter";
import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { getEngine2CanadaProvinceIndex } from "../../../engine2/data/loadEngine2";
import { buildBreadcrumbList, buildItemList } from "../../../utils/structuredData";

type Props = { params: { province: string } };

export default function CanadaProvinceRoute({ params }: Props) {
  const province = getEngine2CanadaProvinceIndex().find(p => p.provinceSlug === params.province);
  if (!province) return <main className="mx-auto max-w-4xl px-6 py-16">Destination not found</main>;
  useStructuredData([
    buildBreadcrumbList([{ name: "Destinations", url: "/destinations" }, { name: "Canada", url: "/destinations/world/canada" }, { name: province.provinceName, url: `/destinations/world/canada/${province.provinceSlug}` }]),
    buildItemList(province.cities.map(c => ({ name: c.cityName, url: `/destinations/world/canada/${province.provinceSlug}/${c.citySlug}` }))),
  ]);

  return <main className="mx-auto max-w-5xl px-6 py-12"><Seo title={`${province.provinceName} Tours | Canada`} description={`Explore tours in ${province.provinceName}.`} /><h1 className="text-3xl font-semibold">{province.provinceName} tours</h1><div className="mt-6 grid gap-3">{province.cities.map(c => <Link key={c.citySlug} href={`/destinations/world/canada/${province.provinceSlug}/${c.citySlug}`}><a className="rounded border p-4">{c.cityName} ({c.tourIds.length})</a></Link>)}</div></main>;
}
