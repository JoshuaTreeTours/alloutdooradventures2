import ogManifest from "../src/data/ogManifest.json";

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
  image: string;
};

type ParsedTourPath = {
  stateSlug: string;
  citySlug: string;
  tourSlug: string;
  canonicalPath: string;
};

type OgManifestEntry = {
  title: string;
  description: string;
  image?: string;
};

function toTitleCaseSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseTourPath(path: string): ParsedTourPath | null {
  const match = path.match(
    /^\/destinations\/([a-z0-9-]+)\/([a-z0-9-]+)\/tours\/([^/?#]+)\/?$/i,
  );
  if (!match) return null;

  return {
    stateSlug: match[1].toLowerCase(),
    citySlug: match[2].toLowerCase(),
    tourSlug: match[3].toLowerCase(),
    canonicalPath: path,
  };
}


function getTourPathFromRequest(url: URL) {
  const pathParam = url.searchParams.get("path")?.trim();
  if (pathParam) {
    return pathParam.startsWith("/") ? pathParam : `/${pathParam}`;
  }

  const pathFromRewrite = url.pathname.replace(/^\/api\/og/, "").trim();
  if (!pathFromRewrite) {
    return "/";
  }

  return pathFromRewrite.startsWith("/") ? pathFromRewrite : `/${pathFromRewrite}`;
}

function getStaticOgMeta(path: string, origin: string): OgMeta | null {
  const manifest = ogManifest as Record<string, OgManifestEntry>;
  const hit = manifest[path];
  if (hit) {
    const image =
      hit.image && /^https?:\/\//i.test(hit.image)
        ? hit.image
        : `${origin}/hero.jpg`;

    return {
      title: hit.title,
      description: hit.description,
      canonical: `${origin}${path}`,
      image,
    };
  }

  const parsed = parseTourPath(path);
  if (!parsed) return null;

  const stateName = toTitleCaseSlug(parsed.stateSlug);
  const cityName = toTitleCaseSlug(parsed.citySlug);
  const tourName = toTitleCaseSlug(parsed.tourSlug);

  return {
    title: `${tourName} | ${cityName}, ${stateName} Tours`,
    description: `Book ${tourName} in ${cityName}, ${stateName}. Curated tours & experiences on All Outdoor Adventures.`,
    canonical: `${origin}${parsed.canonicalPath}`,
    image: `${origin}/hero.jpg`,
  };
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;

  const path = getTourPathFromRequest(url);
  const meta = getStaticOgMeta(path, origin);

  if (!meta) {
    return new Response("Not Found", { status: 404 });
  }

  const title = htmlEscape(meta.title);
  const description = htmlEscape(meta.description);
  const canonical = htmlEscape(meta.canonical);
  const image = htmlEscape(meta.image);

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
<meta property="og:image" content="${image}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
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
