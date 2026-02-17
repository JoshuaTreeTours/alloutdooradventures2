import { Link } from "wouter";
import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { getEngine2CanadaTours } from "../../../engine2/data/loadEngine2";
import { buildBreadcrumbList, buildItemList } from "../../../utils/structuredData";

type Props = { params: { province: string; city: string } };

export default function CanadaCityRoute({ params }: Props) {
  const tours = getEngine2CanadaTours().filter(t => t.sourceProvinceSlug === params.province && t.sourceCitySlug === params.city);
  if (!tours.length) return <main className="mx-auto max-w-4xl px-6 py-16">Destination not found</main>;
  const city = tours[0].geo.city;
  const provinceName = tours[0].geo.region;
  useStructuredData([
    buildBreadcrumbList([{ name: "Destinations", url: "/destinations" }, { name: "Canada", url: "/destinations/world/canada" }, { name: provinceName, url: `/destinations/world/canada/${params.province}` }, { name: city, url: `/destinations/world/canada/${params.province}/${params.city}` }]),
    buildItemList(tours.map(t => ({ name: t.name, url: t.seo.canonicalPath, image: [t.images.hero || t.seo.ogImage] }))),
  ]);

  return <main className="mx-auto max-w-5xl px-6 py-12"><Seo title={`${city}, ${provinceName} Tours | Canada`} description={`Explore tours in ${city}, ${provinceName}.`} /><h1 className="text-3xl font-semibold">{city} tours</h1><div className="mt-6 grid gap-3">{tours.map(t => <Link key={t.id} href={t.seo.canonicalPath}><a className="rounded border p-4">{t.name}</a></Link>)}</div></main>;
}
