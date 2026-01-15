import { writeFile } from "node:fs/promises";
import path from "node:path";

import { categorizeTags } from "./viator/categorizer";
import type { TourRegistryEntry } from "../src/data/tourRegistry";

const VIATOR_BASE_URL = "https://api.viator.com/partner";

const DESTINATION_CONFIG = {
  destination: "nevada",
  destinationId: 684,
  destinationName: "Las-Vegas",
};

type ViatorSearchResponse = {
  products?: ViatorProduct[];
  data?: ViatorProduct[];
  items?: ViatorProduct[];
};

type ViatorProduct = {
  productCode?: string;
  productTitle?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  images?: Array<{
    variants?: Array<{ url?: string }>;
    url?: string;
  }>;
  tags?: Array<{ tagId?: number }>;
  tagIds?: number[];
  productUrl?: string;
  seoUrl?: string;
};

type TagTaxonomy = {
  tags?: Array<{ tagId: number; tagName: string }>;
  data?: Array<{ tagId: number; tagName: string }>;
};

const getApiKey = () => {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) {
    throw new Error("VIATOR_API_KEY is required to run ingestion.");
  }
  return apiKey;
};

const buildHeaders = (apiKey: string) => ({
  "Content-Type": "application/json;version=2.0",
  Accept: "application/json;version=2.0",
  "Accept-Language": "en-US",
  "exp-api-key": apiKey,
});

const viatorFetch = async <T>(
  apiKey: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${VIATOR_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...buildHeaders(apiKey),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Viator API error ${response.status}: ${response.statusText} - ${errorBody}`
    );
  }

  return (await response.json()) as T;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const extractProducts = (response: ViatorSearchResponse) =>
  response.products ?? response.data ?? response.items ?? [];

const resolveImage = (product: ViatorProduct) =>
  product.images?.[0]?.variants?.[0]?.url ||
  product.images?.[0]?.url ||
  "/hero.jpg";

const resolveTitle = (product: ViatorProduct) =>
  product.productTitle || product.title || "Untitled Tour";

const resolveDescription = (product: ViatorProduct) =>
  product.shortDescription || product.description || "";

const resolveTagIds = (product: ViatorProduct) =>
  product.tagIds ??
  product.tags?.map((tag) => tag.tagId ?? 0).filter(Boolean) ??
  [];

const resolveOutboundUrl = (product: ViatorProduct, slug: string) =>
  product.productUrl ||
  product.seoUrl ||
  `https://www.viator.com/tours/${DESTINATION_CONFIG.destinationName}/${slug}/d${DESTINATION_CONFIG.destinationId}-${product.productCode ?? ""}`;

const writeTagCache = async (taxonomy: TagTaxonomy) => {
  const tagsPath = path.resolve("src/data/viatorTags.json");
  const payload = {
    generatedAt: new Date().toISOString(),
    tags: taxonomy.tags ?? taxonomy.data ?? [],
  };
  await writeFile(tagsPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
};

const writeTourRegistry = async (tours: TourRegistryEntry[]) => {
  const registryPath = path.resolve("src/data/tourRegistry.ts");
  const fileContents = `export type TourCategory =\n  | \"Hiking\"\n  | \"Cycling\"\n  | \"Water/Boating\"\n  | \"Food & Drink\"\n  | \"Shows/Nightlife\"\n  | \"Scenic Drives\"\n  | \"Family-friendly\"\n  | \"Adventure\";\n\nexport type TourRegistryEntry = {\n  destination: string;\n  slug: string;\n  viatorProductCode: string;\n  title: string;\n  blurb: string;\n  image: string;\n  tagIds: number[];\n  categories: TourCategory[];\n  outboundUrl: string;\n};\n\nexport const tourRegistry: TourRegistryEntry[] = ${JSON.stringify(
    tours,
    null,
    2
  )};\n\nexport const getToursByDestination = (destination: string) =>\n  tourRegistry.filter((tour) => tour.destination === destination);\n\nexport const getTourBySlug = (destination: string, slug: string) =>\n  tourRegistry.find(\n    (tour) => tour.destination === destination && tour.slug === slug\n  );\n`;

  await writeFile(registryPath, fileContents, "utf8");
};

const run = async () => {
  const apiKey = getApiKey();

  const taxonomy = await viatorFetch<TagTaxonomy>(apiKey, "/taxonomy/tags", {
    method: "GET",
  });
  await writeTagCache(taxonomy);

  const searchBody = {
    destinationId: DESTINATION_CONFIG.destinationId,
    count: 12,
    currency: "USD",
    language: "en",
    sortOrder: "POPULARITY",
  };

  const searchResponse = await viatorFetch<ViatorSearchResponse>(
    apiKey,
    "/products/search",
    {
      method: "POST",
      body: JSON.stringify(searchBody),
    }
  );

  const products = extractProducts(searchResponse);

  const tours = products.map((product) => {
    const title = resolveTitle(product);
    const slug = slugify(title);
    const tagIds = resolveTagIds(product);

    return {
      destination: DESTINATION_CONFIG.destination,
      slug,
      viatorProductCode: product.productCode ?? "",
      title,
      blurb: resolveDescription(product),
      image: resolveImage(product),
      tagIds,
      categories: categorizeTags(tagIds, taxonomy),
      outboundUrl: resolveOutboundUrl(product, slug),
    } satisfies TourRegistryEntry;
  });

  await writeTourRegistry(tours);
  console.log(
    `Wrote ${tours.length} tours for ${DESTINATION_CONFIG.destination}`
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
