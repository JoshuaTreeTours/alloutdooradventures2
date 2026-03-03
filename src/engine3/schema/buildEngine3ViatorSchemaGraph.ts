import { buildCanonicalUrl } from "../../utils/seo";
import type { Engine3TourViewModel } from "../types";
import { buildEngine3SchemaGraph } from "./buildEngine3SchemaGraph";

type SchemaBreadcrumbItem = {
  name: string;
  item: string;
};

type BuildEngine3ViatorSchemaGraphOptions = {
  tripDescription?: string;
  breadcrumbItems?: SchemaBreadcrumbItem[];
  offerPrice?: number;
};

export const buildEngine3ViatorSchemaGraph = (
  input: Engine3TourViewModel,
  canonicalUrl: string,
  options?: BuildEngine3ViatorSchemaGraphOptions
) => {
  const bookingUrl =
    typeof options?.offerPrice === "number" && Number.isFinite(options.offerPrice)
      ? input.bookingUrl
      : input.bookingUrl;

  const graph = buildEngine3SchemaGraph({
    tour: {
      ...input,
      bookingUrl,
      description: options?.tripDescription ?? input.description,
      priceFrom:
        typeof options?.offerPrice === "number" && Number.isFinite(options.offerPrice)
          ? `USD ${options.offerPrice}`
          : input.priceFrom,
    },
    seo: {
      canonicalUrl: buildCanonicalUrl(canonicalUrl),
      title: input.title,
      description: options?.tripDescription ?? input.overview ?? input.description,
      image: input.primaryImageUrl,
    },
    route: {
      pathname: canonicalUrl,
      isBookingRoute: canonicalUrl.endsWith("/book"),
    },
    affiliateBookingUrl: input.bookingUrl,
    breadcrumbs:
      options?.breadcrumbItems?.map(item => ({ name: item.name, url: item.item })) ?? [
        { name: "Home", url: "/" },
        { name: "Tours", url: "/tours" },
        { name: input.title, url: canonicalUrl },
      ],
  });

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};
