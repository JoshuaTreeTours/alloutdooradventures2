export const SEO_BRAND_SUFFIX = " | Outdoor Adventures";

type TitleParts = {
  city: string;
  activity?: string;
  productName?: string;
};

export const buildGuideSeoTitle = ({ city }: TitleParts) =>
  `Top 10 Things to Do in ${city} (2026 Guide)${SEO_BRAND_SUFFIX}`;

export const buildGuideH1 = ({ city }: TitleParts) =>
  `Top 10 Things to Do in ${city}`;

export const buildToursSeoTitle = ({ city }: TitleParts) =>
  `Best Tours in ${city}${SEO_BRAND_SUFFIX}`;

export const buildToursH1 = ({ city }: TitleParts) => `Best Tours in ${city}`;

export const buildCategorySeoTitle = ({ city, activity }: TitleParts) =>
  `${activity ?? "Outdoor"} Tours in ${city}${SEO_BRAND_SUFFIX}`;

export const buildCategoryH1 = ({ city, activity }: TitleParts) =>
  `${activity ?? "Outdoor"} Tours in ${city}`;

export const buildProductSeoTitle = ({ city, productName }: TitleParts) =>
  `${productName ?? "Tour"} in ${city}${SEO_BRAND_SUFFIX}`;
