import { createContext, useContext } from "react";

import { DEFAULT_SEO, buildCanonicalUrl } from "../utils/seo";

export type SeoData = {
  title: string;
  description: string;
  url: string;
  type: string;
};

export type SeoCollector = {
  set: (data: SeoData) => void;
  get: () => SeoData;
};

const SeoContext = createContext<SeoCollector | null>(null);

export const SeoProvider = SeoContext.Provider;

export const useSeoCollector = () => useContext(SeoContext);

export const createSeoCollector = (path?: string): SeoCollector => {
  let current: SeoData = {
    ...DEFAULT_SEO,
    url: buildCanonicalUrl(path ?? DEFAULT_SEO.url),
  };

  return {
    set: (data) => {
      current = data;
    },
    get: () => current,
  };
};
