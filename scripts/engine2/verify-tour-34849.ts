import { getAllEngine2Tours } from "../../src/engine2/data/loadEngine2";
import { FH_ITEM_34849_URL } from "../../src/engine2/content/overrides/palm-springs";
import { buildEngine2Seo } from "../../src/engine2/seo/buildEngine2Seo";
import { buildSchemaGraph } from "../../src/engine2/schema/buildSchemaGraph";

const TOUR_ID = "34849";

const main = () => {
  const tours = getAllEngine2Tours();
  const tour = tours.find(item => item.id === TOUR_ID);

  if (!tour) {
    throw new Error(`Expected Engine2 tour ${TOUR_ID} to exist.`);
  }

  if (tour.sourceCitySlug !== "palm-springs") {
    throw new Error(
      `Expected ${TOUR_ID} citySlug to be palm-springs but got ${tour.sourceCitySlug}.`
    );
  }

  if (!tour.seo.canonicalPath.endsWith("-34849")) {
    throw new Error(
      `Expected canonical path to end in -34849 but got ${tour.seo.canonicalPath}.`
    );
  }

  if (tour.booking.bookingUrl !== FH_ITEM_34849_URL) {
    throw new Error(
      `Expected booking URL to match FareHarbor source URL.\nActual: ${tour.booking.bookingUrl}`
    );
  }

  const seo = buildEngine2Seo(tour);

  if (!seo.title || /all outdoor adventures/i.test(seo.title)) {
    throw new Error(`Unexpected generic SEO title generated: ${seo.title}`);
  }

  const graph = buildSchemaGraph(tour, seo);

  const hasProduct = graph.some(node => node["@type"] === "Product");
  const hasTouristTrip = graph.some(node => node["@type"] === "TouristTrip");
  const hasBreadcrumb = graph.some(node => node["@type"] === "BreadcrumbList");

  if (!hasProduct || !hasTouristTrip || !hasBreadcrumb) {
    throw new Error(
      `Missing schema nodes. Product=${hasProduct}, TouristTrip=${hasTouristTrip}, BreadcrumbList=${hasBreadcrumb}`
    );
  }

  const productNode = graph.find(
    node => node["@type"] === "Product"
  ) as { offers?: { url?: string } } | undefined;

  if (productNode?.offers?.url !== FH_ITEM_34849_URL) {
    throw new Error(
      `Product offers.url mismatch for ${TOUR_ID}.\nActual: ${productNode?.offers?.url}`
    );
  }

  console.log(`verify-tour-34849 passed for ${tour.slug}`);
};

main();
