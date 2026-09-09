export type GuidePlaceType =
  | "city"
  | "town"
  | "unincorporated-community"
  | "gateway-community"
  | "national-park"
  | "state-park"
  | "region"
  | "island"
  | "resort-area";

export type ProtectedAreaType =
  | "national-park"
  | "national-monument"
  | "state-park"
  | "national-forest"
  | "other-protected-area";

export type GuidePlaceClassification = {
  placeType: GuidePlaceType;
  verified: boolean;
  associatedProtectedArea?: {
    name: string;
    type: ProtectedAreaType;
    managingAuthority?: string;
  };
  notes?: string;
};

const VERIFIED_GUIDE_PLACE_CLASSIFICATIONS: Record<
  string,
  GuidePlaceClassification
> = {
  "us/california/joshua-tree": {
    placeType: "gateway-community",
    verified: true,
    associatedProtectedArea: {
      name: "Joshua Tree National Park",
      type: "national-park",
      managingAuthority: "National Park Service",
    },
    notes:
      "Joshua Tree is an unincorporated gateway community. Joshua Tree National Park is a separate federally managed national park and must not be described as a city or urban park.",
  },
};

export const getGuidePlaceClassification = (
  stateSlug: string,
  citySlug: string
): GuidePlaceClassification =>
  VERIFIED_GUIDE_PLACE_CLASSIFICATIONS[`us/${stateSlug}/${citySlug}`] ?? {
    placeType: "city",
    verified: false,
  };

export const isGuidePlaceClassificationVerified = (
  stateSlug: string,
  citySlug: string
) => getGuidePlaceClassification(stateSlug, citySlug).verified;
