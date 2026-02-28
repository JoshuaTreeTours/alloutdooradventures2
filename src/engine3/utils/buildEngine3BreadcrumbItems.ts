const toSlug = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();

  const cleaned = decoded
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || undefined;
};

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
  const stateSlug = toSlug(input.stateSlug) ?? toSlug(input.region);
  const citySlug = toSlug(input.citySlug) ?? toSlug(input.city);

  const cityToursUrl =
    stateSlug && citySlug
      ? `/tours?state=${stateSlug}&city=${citySlug}`
      : "/tours";

  return [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/tours" },
    ...(citySlug
      ? [
          {
            label: input.city?.trim() || citySlug,
            href: cityToursUrl,
          },
        ]
      : []),
    { label: input.title, href: input.canonicalUrl },
  ];
};
