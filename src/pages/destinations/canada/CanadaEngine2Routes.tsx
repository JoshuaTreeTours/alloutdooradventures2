import { Link } from "wouter";

import Seo from "../../../components/Seo";
import { useStructuredData } from "../../../components/StructuredDataProvider";
import { buildBreadcrumbList, buildItemList, getSiteStructuredDataNodes } from "../../../utils/structuredData";
import {
  getEngine2CanadaCityIndexByProvince,
  getEngine2CanadaProvinceIndex,
  getEngine2CanadaToursByProvinceCity,
  getEngine2TourByPath,
} from "../../../engine2/data/loadEngine2";
import Engine2TourPage from "../../../engine2/pages/Engine2TourPage";
import Engine2TourBookingPage from "../../../engine2/pages/Engine2TourBookingPage";

type ProvinceParams = { params: { provinceSlug: string } };
type CityParams = { params: { provinceSlug: string; citySlug: string } };
type TourParams = { params: { provinceSlug: string; citySlug: string; tourSlug: string } };

export function CanadaProvinceHubRoute({ params }: ProvinceParams) {
  const provinces = getEngine2CanadaProvinceIndex();
  const province = provinces.find(item => item.provinceSlug === params.provinceSlug);
  const cities = getEngine2CanadaCityIndexByProvince(params.provinceSlug);

  useStructuredData([
    ...getSiteStructuredDataNodes(),
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "Canada", url: "/destinations/canada" },
      { name: province?.provinceName ?? params.provinceSlug, url: `/destinations/canada/${params.provinceSlug}` },
    ]),
    buildItemList(
      cities.map(city => ({
        name: city.cityName,
        url: `/destinations/canada/${params.provinceSlug}/${city.citySlug}`,
      }))
    ),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Seo
        title={`${province?.provinceName ?? "Canada"} Tours | Canada Destinations`}
        description={`Browse ${province?.provinceName ?? "Canada"} city tour hubs and outdoor experiences.`}
        url={`/destinations/canada/${params.provinceSlug}`}
      />
      <h1 className="text-3xl font-semibold">{province?.provinceName ?? "Province"} Tours</h1>
      <ul className="mt-6 space-y-3">
        {cities.map(city => (
          <li key={city.citySlug}>
            <Link href={`/destinations/canada/${params.provinceSlug}/${city.citySlug}`}>
              <a className="text-green-800 underline">{city.cityName} ({city.tourCount})</a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CanadaCityHubRoute({ params }: CityParams) {
  const tours = getEngine2CanadaToursByProvinceCity(params.provinceSlug, params.citySlug);
  const cityName = tours[0]?.geo.city ?? params.citySlug;
  const provinceName = tours[0]?.geo.region ?? params.provinceSlug;

  useStructuredData([
    ...getSiteStructuredDataNodes(),
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "Canada", url: "/destinations/canada" },
      { name: provinceName, url: `/destinations/canada/${params.provinceSlug}` },
      { name: cityName, url: `/destinations/canada/${params.provinceSlug}/${params.citySlug}` },
    ]),
    buildItemList(tours.map(tour => ({ name: tour.name, url: tour.seo.canonicalPath, image: [tour.images.hero || tour.seo.ogImage] }))),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Seo
        title={`${cityName}, ${provinceName} Tours | Canada`}
        description={`Discover active tours in ${cityName}, ${provinceName} with direct booking links.`}
        url={`/destinations/canada/${params.provinceSlug}/${params.citySlug}`}
      />
      <h1 className="text-3xl font-semibold">Tours in {cityName}</h1>
      <ul className="mt-6 space-y-3">
        {tours.map(tour => (
          <li key={tour.id}>
            <Link href={tour.seo.canonicalPath}>
              <a className="text-green-800 underline">{tour.name}</a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CanadaTourDetailRoute({ params }: TourParams) {
  const path = `/destinations/canada/${params.provinceSlug}/${params.citySlug}/tours/${params.tourSlug}`;
  const tour = getEngine2TourByPath(path);
  if (!tour) {
    return <main className="mx-auto max-w-4xl px-6 py-16">Tour not found.</main>;
  }
  return <Engine2TourPage tour={tour} />;
}

export function CanadaTourBookingRoute({ params }: TourParams) {
  const path = `/destinations/canada/${params.provinceSlug}/${params.citySlug}/tours/${params.tourSlug}`;
  const tour = getEngine2TourByPath(path);
  if (!tour) {
    return <main className="mx-auto max-w-4xl px-6 py-16">Booking not found.</main>;
  }
  return <Engine2TourBookingPage tour={tour} />;
}
