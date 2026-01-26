import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

import { buildCanonicalUrl, buildImageUrl, DEFAULT_SEO } from "../utils/seo";

type SeoProps = {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  image?: string;
  robots?: string;
  googlebot?: string;
};

const upsertMetaTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const upsertLinkTag = (
  selector: string,
  attributes: Record<string, string>,
) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

export default function Seo({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  url,
  type = DEFAULT_SEO.type,
  image = DEFAULT_SEO.image,
  robots = "index,follow,max-image-preview:large",
  googlebot = "index,follow,max-image-preview:large",
}: SeoProps) {
  const [location] = useLocation();
  const canonicalUrl = buildCanonicalUrl(url ?? location ?? "/");
  const resolvedImage = buildImageUrl(image);

  useLayoutEffect(() => {
    document.title = title;

    upsertMetaTag("meta[name=\"description\"]", {
      name: "description",
      content: description,
    });
    upsertMetaTag("meta[property=\"og:title\"]", {
      property: "og:title",
      content: title,
    });
    upsertMetaTag("meta[property=\"og:description\"]", {
      property: "og:description",
      content: description,
    });
    upsertMetaTag("meta[property=\"og:type\"]", {
      property: "og:type",
      content: type,
    });
    upsertMetaTag("meta[property=\"og:url\"]", {
      property: "og:url",
      content: canonicalUrl,
    });
    upsertMetaTag("meta[property=\"og:image\"]", {
      property: "og:image",
      content: resolvedImage,
    });
    upsertMetaTag("meta[name=\"twitter:card\"]", {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMetaTag("meta[name=\"twitter:title\"]", {
      name: "twitter:title",
      content: title,
    });
    upsertMetaTag("meta[name=\"twitter:description\"]", {
      name: "twitter:description",
      content: description,
    });
    upsertMetaTag("meta[name=\"twitter:image\"]", {
      name: "twitter:image",
      content: resolvedImage,
    });
    upsertMetaTag("meta[name=\"robots\"]", {
      name: "robots",
      content: robots,
    });
    upsertMetaTag("meta[name=\"googlebot\"]", {
      name: "googlebot",
      content: googlebot,
    });
    upsertLinkTag("link[rel=\"canonical\"]", {
      rel: "canonical",
      href: canonicalUrl,
    });
  }, [canonicalUrl, description, googlebot, resolvedImage, robots, title, type]);

  return null;
}
