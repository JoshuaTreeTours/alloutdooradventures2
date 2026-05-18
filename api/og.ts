export const config = { runtime: "edge" };

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

function getStaticOgMeta(path: string, origin: string): OgMeta | null {
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
<body></body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
