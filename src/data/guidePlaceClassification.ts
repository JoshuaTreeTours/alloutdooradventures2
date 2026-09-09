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
  verificationSources?: string[];
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
    verificationSources: [
      "https://countywideplan.sbcounty.gov/community/east-desert-unincorporated/joshua-tree/",
      "https://www.nps.gov/jotr/",
    ],
    notes:
      "Joshua Tree is an unincorporated gateway community. Joshua Tree National Park is a separate federally managed national park and must not be described as a city or urban park.",
  },
  "us/texas/houston": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://www.houstontx.gov/",
      "https://www.visithoustontexas.com/",
    ],
    notes:
      "Houston is an incorporated Texas city. Regional Gulf Coast attractions and bayou corridors may be discussed as nearby experiences, but must not be represented as neighborhoods or municipal parkland unless they actually are within Houston.",
  },
  "us/texas/san-antonio": {
    placeType: "city",
    verified: true,
    associatedProtectedArea: {
      name: "San Antonio Missions National Historical Park",
      type: "other-protected-area",
      managingAuthority: "National Park Service",
    },
    verificationSources: [
      "https://www.sa.gov/",
      "https://www.nps.gov/saan/",
      "https://www.visitsanantonio.com/",
    ],
    notes:
      "San Antonio is an incorporated Texas city. San Antonio Missions National Historical Park is a separate National Park Service unit within the city and must be described as federal historic parkland, not a city park.",
  },
  "us/texas/dallas": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://dallascityhall.com/",
      "https://www.visitdallas.com/",
    ],
    notes:
      "Dallas is an incorporated Texas city. Fort Worth and other Metroplex destinations are separate cities and should be framed as regional trips rather than Dallas neighborhoods.",
  },
};

export const getGuidePlaceClassification = (
  stateSlug: string,
  citySlug: string,
  _displayName?: string
): GuidePlaceClassification =>
  VERIFIED_GUIDE_PLACE_CLASSIFICATIONS[`us/${stateSlug}/${citySlug}`] ?? {
    placeType: "city",
    verified: false,
  };

export const isGuidePlaceClassificationVerified = (
  stateSlug: string,
  citySlug: string
) => getGuidePlaceClassification(stateSlug, citySlug).verified;
