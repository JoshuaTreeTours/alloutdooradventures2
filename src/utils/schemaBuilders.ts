import { buildImageUrl, buildCanonicalUrl, DEFAULT_SEO, SeoMetadata } from "./seo";
import {
  buildWebPageStructuredData,
  dedupeStructuredDataNodes,
  getSiteStructuredDataNodes,
  normalizeStructuredData,
  sanitizeSchemaName,
} from "./structuredData";

type StructuredDataNode = Record<string, unknown>;

export const getDocumentSeoMetadata = ({
  locationPathname,
}: {
  locationPathname: string;
}): SeoMetadata => {
  const canonicalUrl =
    document.head
      .querySelector<HTMLLinkElement>("link[rel=\"canonical\"]")
      ?.getAttribute("href") ?? buildCanonicalUrl(locationPathname);
  const description =
    document.head
      .querySelector<HTMLMetaElement>("meta[name=\"description\"]")
      ?.getAttribute("content") ?? DEFAULT_SEO.description;
  const title = sanitizeSchemaName(document.title || DEFAULT_SEO.title);
  const image =
    document.head
      .querySelector<HTMLMetaElement>("meta[property=\"og:image\"]")
      ?.getAttribute("content") ?? buildImageUrl(DEFAULT_SEO.image);

  return {
    title,
    description,
    canonicalUrl,
    type: DEFAULT_SEO.type,
    image,
  };
};

const getBreadcrumbId = (nodes: StructuredDataNode[] | null) => {
  const breadcrumbNode = nodes?.find((node) => {
    if (!node || typeof node !== "object") {
      return false;
    }
    const nodeType = (node as { "@type"?: string | string[] })["@type"];
    if (Array.isArray(nodeType)) {
      return nodeType.includes("BreadcrumbList");
    }
    return nodeType === "BreadcrumbList";
  });

  if (!breadcrumbNode || typeof breadcrumbNode !== "object") {
    return undefined;
  }

  const id = (breadcrumbNode as { "@id"?: string })["@id"];
  return typeof id === "string" ? id : undefined;
};

export const buildSchemaGraph = ({
  seo,
  nodes,
  includeWebPage = true,
  webPageType,
  mainEntityId,
}: {
  seo: SeoMetadata;
  nodes?: StructuredDataNode[] | null;
  includeWebPage?: boolean;
  webPageType?: "WebPage" | "CollectionPage";
  mainEntityId?: string;
}) => {
  const graphNodes: StructuredDataNode[] = [...getSiteStructuredDataNodes()];
  const pageNodes = nodes?.length ? nodes : [];

  if (includeWebPage) {
    graphNodes.push(
      buildWebPageStructuredData({
        url: seo.canonicalUrl,
        name: seo.title,
        description: seo.description,
        image: seo.image,
        type: webPageType,
        breadcrumbId: getBreadcrumbId(pageNodes),
        mainEntityId,
      }) as StructuredDataNode,
    );
  }

  if (pageNodes.length) {
    graphNodes.push(...pageNodes);
  }

  return normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": dedupeStructuredDataNodes(graphNodes),
  });
};
