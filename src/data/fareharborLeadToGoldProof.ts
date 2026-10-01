import { type FareHarborProofProduct } from "./fareharborLeadToGoldProof.generated";
import {
  fareHarborMigratedProducts,
  getFareHarborBostonLegacyProducts,
} from "./fareharborCityBatches";
import { fareHarborAggregateRatingSchema } from "./fareharborPresentation";

export { getFareHarborBostonLegacyProducts };

const byItemId = new Map(
  fareHarborMigratedProducts.map(product => [product.itemId, product])
);

const ITEM_URL_PATTERN = /\/items\/(\d+)(?:\/|$|\?)/;

export const getFareHarborProofProducts = (): FareHarborProofProduct[] =>
  fareHarborMigratedProducts;

export const getFareHarborProofByItemId = (
  itemId?: string | null
): FareHarborProofProduct | null => {
  if (!itemId) {
    return null;
  }
  return byItemId.get(itemId) ?? null;
};

export const getFareHarborProofFromTour = (
  tour?: {
    id?: string | null;
    slug?: string | null;
    bookingUrl?: string | null;
  } | null
): FareHarborProofProduct | null => {
  if (!tour) {
    return null;
  }
  const fromUrl = tour.bookingUrl?.match(ITEM_URL_PATTERN)?.[1];
  const fromSlug = tour.slug?.match(/-(\d+)$/)?.[1];
  const fromId = tour.id && /^\d+$/.test(tour.id) ? tour.id : null;
  return getFareHarborProofByItemId(fromUrl ?? fromSlug ?? fromId);
};

const normalizeMigratedRoutePath = (
  value?: string | null
): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const pathname = /^https?:\/\//i.test(trimmed)
    ? (() => {
        try {
          return new URL(trimmed).pathname;
        } catch {
          return null;
        }
      })()
    : trimmed;
  if (!pathname) {
    return null;
  }
  return `/${pathname.replace(/^\/+|\/+$/g, "")}`;
};

export const collectFareHarborMigratedRoutePaths = (
  products: FareHarborProofProduct[] = getFareHarborProofProducts()
): string[] => {
  const paths = new Set<string>();
  for (const product of products) {
    const publicPath = normalizeMigratedRoutePath(product.publicPath);
    if (publicPath) {
      paths.add(publicPath);
    }
    const engine2Path = normalizeMigratedRoutePath(product.engine2Path);
    if (engine2Path) {
      paths.add(engine2Path);
    }
  }
  return [...paths];
};

const itemIdFromSlugOrPath = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const matches = [...value.matchAll(/-(\d+)(?=\/|$)/g)];
  return matches.at(-1)?.[1] ?? null;
};

const byPublicOrEngine2Path = new Map<string, FareHarborProofProduct>();
for (const product of fareHarborMigratedProducts) {
  for (const candidate of [product.publicPath, product.engine2Path]) {
    const normalized = normalizeMigratedRoutePath(candidate);
    if (normalized) {
      byPublicOrEngine2Path.set(normalized, product);
    }
  }
}

export const getFareHarborProofByPath = (
  pathname?: string | null
): FareHarborProofProduct | null => {
  const normalized = normalizeMigratedRoutePath(pathname);
  if (!normalized) {
    return null;
  }
  return (
    byPublicOrEngine2Path.get(normalized) ??
    getFareHarborProofByItemId(itemIdFromSlugOrPath(normalized))
  );
};

export const isFareHarborMigratedRouteRef = (ref?: {
  itemId?: string | null;
  slug?: string | null;
  path?: string | null;
} | null): boolean => {
  if (!ref) {
    return false;
  }
  const candidates = [
    ref.itemId,
    itemIdFromSlugOrPath(ref.slug),
    itemIdFromSlugOrPath(ref.path),
  ];
  return candidates.some(itemId => Boolean(getFareHarborProofByItemId(itemId)));
};

const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const STATE_NAME_FROM_SLUG: Record<string, string> = {
  massachusetts: "Massachusetts",
  maine: "Maine",
  vermont: "Vermont",
  "new-hampshire": "New Hampshire",
  "rhode-island": "Rhode Island",
  connecticut: "Connecticut",
  "new-york": "New York",
};

export const parseFareHarborProofDestination = (
  publicPath?: string | null
): {
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
} | null => {
  const normalized = normalizeMigratedRoutePath(publicPath);
  const match = normalized?.match(
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/
  );
  if (!match) {
    return null;
  }
  const stateSlug = match[1];
  const citySlug = match[2];
  return {
    stateSlug,
    citySlug,
    state: STATE_NAME_FROM_SLUG[stateSlug] ?? titleFromSlug(stateSlug),
    city: titleFromSlug(citySlug),
  };
};

export const applyFareHarborProofDestination = <
  T extends {
    destination: {
      state: string;
      stateSlug: string;
      city: string;
      citySlug: string;
    };
    id?: string | null;
    slug?: string | null;
    bookingUrl?: string | null;
  },
>(
  tour: T
): T => {
  const proof = getFareHarborProofFromTour(tour);
  const parsed = parseFareHarborProofDestination(proof?.publicPath);
  if (!parsed) {
    return tour;
  }
  if (
    parsed.stateSlug === tour.destination.stateSlug &&
    parsed.citySlug === tour.destination.citySlug
  ) {
    return tour;
  }
  return {
    ...tour,
    destination: {
      ...tour.destination,
      ...parsed,
    },
  };
};

export const FAREHARBOR_PROOF_PRIMARY_CTA_LABEL = "Check availability";

export const resolveFareHarborProofCtaLabel = (
  proof: FareHarborProofProduct | null | undefined,
  fallback: string
): string => (proof ? FAREHARBOR_PROOF_PRIMARY_CTA_LABEL : fallback);

const DESCRIPTION_TYPES = new Set(["Product", "TouristTrip", "WebPage"]);
const OFFER_HOST_TYPES = new Set(["Product", "TouristTrip"]);

const typeNames = (value: unknown): string[] => {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
};

const isSyntheticFloorPrice = (value: unknown): boolean => {
  if (typeof value === "number") {
    return value === 129;
  }
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.replace(/[$,\s]/g, "");
  return normalized === "129" || normalized === "129.00" || normalized === "129.0";
};

const offerUrl = (existing: unknown): string | undefined => {
  if (!existing || typeof existing !== "object") {
    return undefined;
  }
  if (Array.isArray(existing)) {
    for (const item of existing) {
      const url = offerUrl(item);
      if (url) {
        return url;
      }
    }
    return undefined;
  }
  const url = (existing as { url?: unknown }).url;
  return typeof url === "string" ? url : undefined;
};

const authoritativeOffer = (
  proof: FareHarborProofProduct,
  existing: unknown
): Record<string, unknown> | undefined => {
  if (!proof.offer) {
    return undefined;
  }
  const url = offerUrl(existing);
  return {
    "@type": "Offer",
    ...(url ? { url } : {}),
    price: proof.offer.price,
    priceCurrency: proof.offer.priceCurrency,
  };
};

const patchSchemaValue = (
  value: unknown,
  proof: FareHarborProofProduct
): unknown => {
  if (Array.isArray(value)) {
    return value.map(item => patchSchemaValue(item, proof));
  }
  if (!value || typeof value !== "object") {
    return value;
  }
  const node = value as Record<string, unknown>;
  const types = typeNames(node["@type"]);
  const next: Record<string, unknown> = { ...node };
  const describesProof = types.some(type => DESCRIPTION_TYPES.has(type));
  const hostsOffer = types.some(type => OFFER_HOST_TYPES.has(type));
  if (describesProof) {
    next.description = proof.schemaDescription;
    const aggregateRating = types.includes("Product")
      ? fareHarborAggregateRatingSchema(proof)
      : undefined;
    if (aggregateRating) {
      next.aggregateRating = aggregateRating;
    } else {
      delete next.aggregateRating;
    }
  }
  if (types.includes("TouristTrip")) {
    if (proof.durationIso) {
      next.duration = proof.durationIso;
    } else {
      delete next.duration;
    }
  }
  if (hostsOffer) {
    if (!proof.offer) {
      delete next.offers;
    } else {
      next.offers = authoritativeOffer(proof, node.offers);
    }
  } else if (types.includes("Offer") || types.includes("AggregateOffer")) {
    if (!proof.offer) {
      delete next.price;
      delete next.lowPrice;
      delete next.highPrice;
      delete next.availability;
    } else if (
      isSyntheticFloorPrice(next.price) ||
      isSyntheticFloorPrice(next.lowPrice) ||
      isSyntheticFloorPrice(next.highPrice) ||
      next.price !== proof.offer.price
    ) {
      return authoritativeOffer(proof, next);
    } else {
      delete next.availability;
    }
  }
  for (const [key, child] of Object.entries(next)) {
    if (key === "offers" && hostsOffer) {
      continue;
    }
    if (child && typeof child === "object") {
      next[key] = patchSchemaValue(child, proof);
    }
  }
  return next;
};

export const applyFareHarborProofSchema = <T extends Record<string, unknown>>(
  nodes: T[],
  proof: FareHarborProofProduct
): T[] => nodes.map(node => patchSchemaValue(node, proof) as T);

export const applyFareHarborProofToSchemaGraph = <
  T extends Record<string, unknown>,
>(
  graph: T,
  proof: FareHarborProofProduct
): T => {
  const nodes = Array.isArray(graph["@graph"])
    ? (graph["@graph"] as Array<Record<string, unknown>>)
    : [graph];
  const patched = applyFareHarborProofSchema(nodes, proof);
  if (Array.isArray(graph["@graph"])) {
    return { ...graph, "@graph": patched };
  }
  return (patched[0] ?? graph) as T;
};

export const buildFareHarborProofSchemaGraph = (
  proof: FareHarborProofProduct,
  options: { canonicalUrl: string; image?: string | null }
): { "@context": string; "@graph": Array<Record<string, unknown>> } => {
  const canonicalUrl = options.canonicalUrl.replace(/\/$/, "");
  const image =
    (typeof options.image === "string" && options.image.trim()) ||
    proof.galleryImages[0] ||
    undefined;
  const offerStub = proof.offer
    ? { "@type": "Offer", url: canonicalUrl }
    : undefined;
  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    url: canonicalUrl,
    name: proof.title,
    description: proof.schemaDescription,
    sku: proof.itemId,
    ...(image ? { image } : {}),
    ...(offerStub ? { offers: offerStub } : {}),
  };
  const trip: Record<string, unknown> = {
    "@type": "TouristTrip",
    "@id": `${canonicalUrl}#touristtrip`,
    name: proof.title,
    description: proof.schemaDescription,
    ...(image ? { image } : {}),
    ...(proof.durationIso ? { duration: proof.durationIso } : {}),
    ...(offerStub ? { offers: offerStub } : {}),
  };
  return {
    "@context": "https://schema.org",
    "@graph": applyFareHarborProofSchema([product, trip], proof),
  };
};

export const applyFareHarborProofToPrerender = <
  TSeo extends { description: string },
  TData extends { "@graph"?: Array<Record<string, unknown>> } | null,
>(
  seo: TSeo,
  structuredData: TData,
  tour?: {
    id?: string | null;
    slug?: string | null;
    bookingUrl?: string | null;
  } | null
): { seo: TSeo; structuredData: TData } => {
  const proof = getFareHarborProofFromTour(tour);
  if (!proof) {
    return { seo, structuredData };
  }
  const nextSeo = {
    ...seo,
    description: proof.schemaDescription,
  };
  const graph = structuredData?.["@graph"];
  if (!structuredData || !Array.isArray(graph)) {
    return { seo: nextSeo, structuredData };
  }
  return {
    seo: nextSeo,
    structuredData: {
      ...structuredData,
      "@graph": applyFareHarborProofSchema(graph, proof),
    },
  };
};

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceMetaContent = (
  html: string,
  attrName: string,
  attrValue: string,
  value: string
) => {
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attrName}=["']${escapeRegExp(attrValue)}["'][^>]*>`,
    "i"
  );
  return html.replace(pattern, tag => {
    if (/content=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/content=["'][^"']*["']/i, `content="${value}"`);
    }
    return tag.replace(/\s*\/?\s*>$/, ` content="${value}" />`);
  });
};

const patchStructuredDocument = (data: unknown, proof: FareHarborProofProduct) => {
  if (Array.isArray(data)) {
    return applyFareHarborProofSchema(data as Array<Record<string, unknown>>, proof);
  }
  if (data && typeof data === "object") {
    return applyFareHarborProofSchema([data as Record<string, unknown>], proof)[0];
  }
  return data;
};

export const applyFareHarborProofToHtml = (
  html: string,
  proof: FareHarborProofProduct
): string => {
  const description = escapeAttribute(proof.schemaDescription);
  let next = html.replace(
    /<script\b([^>]*?)type=["']application\/ld\+json["']([^>]*)>([\s\S]*?)<\/script>/gi,
    (full, before: string, after: string, body: string) => {
      const raw = body.trim();
      if (!raw) {
        return full;
      }
      try {
        const patched = patchStructuredDocument(JSON.parse(raw), proof);
        const json = JSON.stringify(patched).replace(/</g, "\\u003c");
        return `<script${before}type="application/ld+json"${after}>${json}</script>`;
      } catch {
        return full;
      }
    }
  );
  next = replaceMetaContent(next, "name", "description", description);
  next = replaceMetaContent(next, "property", "og:description", description);
  next = replaceMetaContent(next, "name", "twitter:description", description);
  return next;
};
