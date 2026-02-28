const toSlug = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || undefined;
};

const titleCaseFromSlug = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

export type Engine3BreadcrumbItem = {
  label: string;
  href: string;
};

export const buildEngine3BreadcrumbItems = (input: {
  title: string;
  canonicalUrl: string;
  stateSlug?: string;
  citySlug?: string;
  region?: string;
  city?: string;
}): Engine3BreadcrumbItem[] => {
  const regionSlug = toSlug(input.stateSlug) ?? toSlug(input.region);
  const citySlug = toSlug(input.citySlug) ?? toSlug(input.city);

  return [
    { label: "Destinations", href: "/destinations" },
    ...(regionSlug
      ? [
          {
            label: titleCaseFromSlug(regionSlug),
            href: `/destinations/${regionSlug}`,
          },
        ]
      : []),
    ...(regionSlug && citySlug
      ? [
          {
            label: titleCaseFromSlug(citySlug),
            href: `/destinations/${regionSlug}/${citySlug}`,
          },
        ]
      : []),
    { label: input.title, href: input.canonicalUrl },
  ];
};
