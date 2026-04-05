export type Engine6AuthoritativeHeroEntry = {
  productCode: string;
  viatorUrl: string;
  city: string;
  state: string;
  authoritativeHeroImageUrl: string;
};

// Reusable onboarding registry for Engine6 Viator tours that provide a
// user-supplied authoritative hero URL. Add future tours here to lock
// canonical image identity across page/card/schema/og surfaces.
export const ENGINE6_AUTHORITATIVE_HERO_REGISTRY: Engine6AuthoritativeHeroEntry[] =
  [
    {
      productCode: "315439P1",
      viatorUrl:
        "https://www.viator.com/tours/New-York-City/Horse-and-Carriage-Rides-through-Central-Park-NYC/d687-315439P1",
      city: "New York City",
      state: "New York",
      authoritativeHeroImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2e/b8/6a/2d/caption.jpg?w=700&h=500&s=1",
    },
    {
      productCode: "5625914P1",
      viatorUrl:
        "https://www.viator.com/tours/New-York-City/Beyond-The-City-Little-Stony-Point/d687-5625914P1",
      city: "New York City",
      state: "New York",
      authoritativeHeroImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/32/0c/e8/fe/caption.jpg?w=700&h=500&s=1",
    },
  ];

const AUTHORITATIVE_HERO_BY_PRODUCT_CODE = new Map(
  ENGINE6_AUTHORITATIVE_HERO_REGISTRY.map(entry => [
    entry.productCode.toUpperCase(),
    entry,
  ])
);

export const getEngine6AuthoritativeHeroEntry = (
  productCode: string | null | undefined
): Engine6AuthoritativeHeroEntry | null => {
  const normalizedCode = productCode?.trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  return AUTHORITATIVE_HERO_BY_PRODUCT_CODE.get(normalizedCode) ?? null;
};
