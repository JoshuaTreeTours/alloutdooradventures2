import type { IncomingMessage, ServerResponse } from "node:http";

const ONE_DAY_SECONDS = 60 * 60 * 24;

const BAD_REQUEST = (res: ServerResponse, message: string) => {
  res.statusCode = 400;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const host = req.headers.host || "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const requestUrl = new URL(req.url || "/", `${protocol}://${host}`);
  const target = requestUrl.searchParams.get("url")?.trim();

  if (!target) {
    BAD_REQUEST(res, "Missing url query parameter");
    return;
  }

  let parsedTarget: URL;
  try {
    parsedTarget = new URL(target);
  } catch {
    BAD_REQUEST(res, "Invalid url");
    return;
  }

  if (!["http:", "https:"].includes(parsedTarget.protocol)) {
    BAD_REQUEST(res, "Only http/https URLs are supported");
    return;
  }

  try {
    const upstream = await fetch(parsedTarget.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AllOutdoorAdventuresBot/1.0; +https://www.alloutdooradventures.com)",
      },
    });

    if (!upstream.ok) {
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Unable to fetch image" }));
      return;
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const bytes = Buffer.from(await upstream.arrayBuffer());

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", `public, max-age=${ONE_DAY_SECONDS}`);
    res.end(bytes);
  } catch {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Image proxy request failed" }));
  }
}
