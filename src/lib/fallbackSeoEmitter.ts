import { getLegacyTourBySlugs } from "../data/tours";
import { resolveTourHeroImage } from "../utils/hero";
import { buildImageUrl } from "../utils/seo";

export const applyRouteSeo = (
  html: string,
  { title, description, url, image }: { title: string; description: string; url: string; image?: string }
) => {
  const setMetaByAttr = (input: string, attr: string, name: string, value: string) => {
    const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>`, "i");
    if (re.test(input)) {
      return input.replace(re, `<meta ${attr}="${name}" content="${value}" />`);
    }
    return input.replace("</head>", `<meta ${attr}="${name}" content="${value}" /></head>`);
  };
  const removeMetaByAttr = (input: string, attr: string, name: string) => {
    const re = new RegExp(`<meta[^>]*${attr}=["']${name}["'][^>]*>\\s*`, "i");
    return input.replace(re, "");
  };

  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = setMetaByAttr(out, "name", "description", description);
  out = setMetaByAttr(out, "property", "og:title", title);
  out = setMetaByAttr(out, "property", "og:description", description);
  out = setMetaByAttr(out, "property", "og:url", url);
  out = setMetaByAttr(out, "name", "twitter:title", title);
  out = setMetaByAttr(out, "name", "twitter:description", description);
  if (image) {
    out = setMetaByAttr(out, "property", "og:image", image);
    out = setMetaByAttr(out, "name", "twitter:image", image);
  } else {
    out = removeMetaByAttr(out, "property", "og:image");
    out = removeMetaByAttr(out, "name", "twitter:image");
  }
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}" />`);
  const structuredData: Record<string, string> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": url,
    url,
    name: title,
    description,
  };
  if (image) structuredData.image = image;
  const ld = `<script id="structured-data" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`;

  const ldScriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i;
  const existingLdMatch = out.match(ldScriptRe);
  if (!existingLdMatch) {
    return out.replace("</head>", `${ld}</head>`);
  }

  const rawJson = existingLdMatch[1]?.trim();
  if (!rawJson) {
    return out.replace(ldScriptRe, ld);
  }

  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    const ensureImage = (node: Record<string, unknown>) => {
      if (!image) {
        return node;
      }
      const nodeType = node["@type"];
      const isTargetType =
        nodeType === "WebPage" || nodeType === "Product" || nodeType === "TouristTrip";
      if (!isTargetType) {
        return node;
      }

      const existingImage = node.image;
      const hasImage =
        (typeof existingImage === "string" && existingImage.trim().length > 0) ||
        (Array.isArray(existingImage) && existingImage.length > 0);
      if (!hasImage) {
        node.image = image;
      }
      return node;
    };

    let updated: Record<string, unknown> = { ...parsed };
    if (Array.isArray(parsed["@graph"])) {
      updated = {
        ...parsed,
        "@graph": parsed["@graph"].map(node =>
          node && typeof node === "object"
            ? ensureImage({ ...(node as Record<string, unknown>) })
            : node
        ),
      };
    } else {
      updated = ensureImage({ ...parsed });
    }

    const nextLd = `<script id="structured-data" type="application/ld+json">${JSON.stringify(updated).replace(/</g, "\\u003c")}</script>`;
    return out.replace(ldScriptRe, nextLd);
  } catch {
    return out.replace(ldScriptRe, ld);
  }
};

export const isLegacyTourDetailPath = (pathname: string) =>
  /^\/destinations\/[^/]+\/[^/]+\/tours\/[^/]+\/?$/.test(pathname) ||
  /^\/tours\/[^/]+\/[^/]+\/[^/]+\/?$/.test(pathname);

const toTitleCase = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const buildLegacyTourRouteFallbackSeo = ({
  pathname,
  site,
}: {
  pathname: string;
  site: string;
}) => {
  const match =
    /^\/destinations\/([^/]+)\/([^/]+)\/tours\/([^/]+)\/?$/.exec(pathname) ??
    /^\/tours\/([^/]+)\/([^/]+)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  const [, stateSlug, citySlug, tourSlug] = match;
  const state = toTitleCase(stateSlug);
  const city = toTitleCase(citySlug);
  const tour = toTitleCase(tourSlug.replace(/-\d+$/g, ""));
  const legacyTour = getLegacyTourBySlugs(stateSlug, citySlug, tourSlug);
  const tourImage = legacyTour ? resolveTourHeroImage(legacyTour) : undefined;

  return {
    title: `${tour} | ${city}, ${state} | All Outdoor Adventures`,
    description: `Explore ${tour} in ${city}, ${state} with All Outdoor Adventures.`,
    url: `${site}${pathname}`,
    image: tourImage ? buildImageUrl(tourImage) : "",
  };
};
