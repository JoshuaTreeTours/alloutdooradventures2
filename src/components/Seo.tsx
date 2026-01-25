import { useLayoutEffect } from "react";
import { useLocation } from "wouter";

import { buildCanonicalUrl, DEFAULT_SEO } from "../utils/seo";

type SeoProps = {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
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
}: SeoProps) {
  const [location] = useLocation();
  const canonicalUrl = buildCanonicalUrl(url ?? location ?? "/");

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
    upsertLinkTag("link[rel=\"canonical\"]", {
      rel: "canonical",
      href: canonicalUrl,
    });
  }, [canonicalUrl, description, title, type]);

  return null;
}
