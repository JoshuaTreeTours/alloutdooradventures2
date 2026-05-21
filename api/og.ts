export const config = { runtime: "edge" };
import { toursGenerated } from "../src/data/tours.generated";
import { oregonRows } from "../src/engine2/data/oregon.rows";
import { flagstaffTours } from "../src/data/flagstaffTours";
import { buildTourMeta } from "../src/lib/tourMeta";

const ROOT_OG_IMAGE = "/hero.jpg";

function htmlEscape(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type OgMeta = {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
};

type ParsedTourPath = {
  stateSlug: string;
  canonicalPath: string;
};

function toTitleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseTourPath(path: string): ParsedTourPath | null {
  const match = path.match(
    /^\/destinations\/([a-z0-9-]+)\/(.+)\/tours\/([^/?#]+)\/?$/i
  );
  if (!match) return null;

  return {
    stateSlug: match[1].toLowerCase(),
    canonicalPath: path,
  };
}

function isScopedLegacyTourPath(path: string) {
  return [
    /^\/destinations\/california\/santa-barbara\/tours\/[^/?#]+\/?$/i,
    /^\/destinations\/united-states\/california\/santa-barbara\/tours\/[^/?#]+\/?$/i,
    /^\/destinations\/oregon\/portland\/tours\/[^/?#]+\/?$/i,
    /^\/destinations\/united-states\/oregon\/portland\/tours\/[^/?#]+\/?$/i,
    /^\/destinations\/arizona\/flagstaff\/tours\/[^/?#]+\/?$/i,
    /^\/destinations\/united-states\/arizona\/flagstaff\/tours\/[^/?#]+\/?$/i,
    /^\/tours\/california\/santa-barbara\/[^/?#]+\/?$/i,
    /^\/tours\/oregon\/portland\/[^/?#]+\/?$/i,
    /^\/tours\/arizona\/flagstaff\/[^/?#]+\/?$/i,
  ].some(pattern => pattern.test(path));
}

function slugFromPath(path: string) {
  const normalized = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function resolveScopedLegacyTourMeta(path: string, origin: string): OgMeta | null {
  if (!isScopedLegacyTourPath(path)) return null;
  const slug = slugFromPath(path);
  const generatedTour = toursGenerated.find(
    entry => entry.slug === slug && entry.engine !== "engine6"
  );
  const flagstaffTour = flagstaffTours.find(entry => entry.slug === slug);
  const oregonMatch = oregonRows.find(entry => `${entry.item_name}-${entry.item_id}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === slug);
  const tour = generatedTour ?? flagstaffTour;
  if (!tour && !oregonMatch) return null;
  const canonicalPath = tour
    ? `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}`
    : `/destinations/oregon/portland/tours/${slug}`;
  const canonical = `${origin}${canonicalPath}`;
  const meta = tour
    ? buildTourMeta(tour, canonical)
    : {
        title: `${oregonMatch!.item_name} | Portland, Oregon | All Outdoor Adventures`,
        description: `${oregonMatch!.item_name} in Portland, Oregon with ${oregonMatch!.company_name}.`,
      };
  const candidateImage = tour
    ? tour.heroImage || tour.galleryImages?.[0] || null
    : oregonMatch?.image_url || null;
  const image =
    candidateImage && !candidateImage.includes("/hero.jpg")
      ? candidateImage
      : null;

  return {
    title: meta.title,
    description: meta.description,
    canonical,
    image,
  };
}

export function getStaticOgMeta(path: string, origin: string): OgMeta | null {
  if (path === "/") {
    return {
      title: "All Outdoor Adventures | Tours, Guides & Outdoor Experiences",
      description:
        "Discover outdoor tours, travel guides, and curated adventure experiences across top destinations with All Outdoor Adventures.",
      canonical: `${origin}/`,
      image: `${origin}${ROOT_OG_IMAGE}`,
    };
  }

  const map: Record<string, Omit<OgMeta, "canonical">> = {
    "/destinations/oregon/portland/tours/gorge-ous-sunset-multnomah-falls-waterfall-tour-from-portland-462223":
      {
        title:
          "Gorge-ous Sunset Multnomah Falls Waterfall Tour from Portland | Portland, Oregon Outdoor Tour",
        description:
          "Guided Tour – Gorge-ous Sunset Multnomah Falls Waterfall Tour from Portland (Portland, Oregon).",
        image: "https://cdn.filestackcontent.com/Tr5TrDymQNOHOJPRAoGF",
      },

    "/destinations/arizona/flagstaff/tours/boulder-e-bike-art-and-nature-tour-628917":
      {
        title: "Boulder E-Bike Art & Nature Tour | Flagstaff Outdoor Adventure",
        description:
          "Explore trails, art, and nature in Flagstaff on a guided e-bike experience with curated stops.",
        image: null,
      },

    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-2335p1":
      {
        title: "San Andreas Fault Jeep Tour | Palm Springs Desert Adventure",
        description:
          "Off-road jeep tour through the legendary San Andreas Fault zone with professional desert guides.",
        image: null,
      },
  };

  const hit = map[path];
  if (hit) {
    return {
      title: hit.title,
      description: hit.description,
      canonical: `${origin}${path}`,
      image: hit.image,
    };
  }

  const scopedLegacy = resolveScopedLegacyTourMeta(path, origin);
  if (scopedLegacy) return scopedLegacy;

  const parsed = parseTourPath(path);
  if (!parsed) return null;

  const stateName = toTitleCaseSlug(parsed.stateSlug);

  return {
    title: `All Outdoor Adventures | ${stateName} Tour`,
    description: `${stateName} tour on All Outdoor Adventures.`,
    canonical: `${origin}${parsed.canonicalPath}`,
    image: null,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;

  const path = url.searchParams.get("path") || "/";
  const meta = getStaticOgMeta(path, origin);

  if (!meta) {
    return new Response("Not Found", { status: 404 });
  }

  const title = htmlEscape(meta.title);
  const description = htmlEscape(meta.description);
  const canonical = htmlEscape(meta.canonical);
  const image = meta.image ? htmlEscape(meta.image) : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${canonical}" />

<meta property="og:type" content="website" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
${image ? `<meta property="og:image" content="${image}" />` : ""}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
${image ? `<meta name="twitter:image" content="${image}" />` : ""}
</head>
<body>
${image ? `<script type="application/ld+json">${htmlEscape(JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", image }))}</script>` : ""}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
