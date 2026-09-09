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
  "us/california/santa-barbara": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://santabarbaraca.gov/",
      "https://santabarbaraca.com/",
    ],
    notes:
      "Santa Barbara is an incorporated California coastal city. Montecito, Goleta, Los Padres National Forest, and Channel Islands National Park are separate neighboring communities or protected landscapes and must not be represented as Santa Barbara municipal attractions.",
  },
  "us/california/palm-springs": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://www.palmspringsca.gov/",
      "https://visitpalmsprings.com/",
      "https://www.aguacaliente.org/",
      "https://www.nps.gov/jotr/",
    ],
    notes:
      "Palm Springs is an incorporated city in the Coachella Valley. Indian Canyons and Tahquitz Canyon are Agua Caliente cultural landscapes; Mount San Jacinto State Park and Joshua Tree National Park are separate protected areas with their own managers and rules.",
  },
  "us/florida/key-west": {
    placeType: "city",
    verified: true,
    associatedProtectedArea: {
      name: "Dry Tortugas National Park",
      type: "national-park",
      managingAuthority: "National Park Service",
    },
    verificationSources: [
      "https://www.cityofkeywest-fl.gov/",
      "https://fla-keys.com/key-west/",
      "https://www.nps.gov/drto/",
    ],
    notes:
      "Key West is an incorporated Florida island city. Dry Tortugas National Park is a separate remote National Park Service unit about 70 miles west of Key West and is reached by boat or seaplane rather than road.",
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
  "us/florida/tampa": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://www.tampa.gov/",
      "https://www.visittampabay.com/",
    ],
    notes:
      "Tampa is an incorporated Florida city on Tampa Bay. Clearwater, St. Petersburg, and the Gulf beach communities are separate municipalities and should be framed as regional trips rather than Tampa neighborhoods or city beaches.",
  },
  "us/ohio/cleveland": {
    placeType: "city",
    verified: true,
    associatedProtectedArea: {
      name: "Cuyahoga Valley National Park",
      type: "national-park",
      managingAuthority: "National Park Service",
    },
    verificationSources: [
      "https://www.clevelandohio.gov/",
      "https://www.thisiscleveland.com/",
      "https://www.nps.gov/cuva/",
    ],
    notes:
      "Cleveland is an incorporated Ohio city. Cuyahoga Valley National Park is a separate National Park Service unit between Cleveland and Akron and must not be described as Cleveland municipal parkland.",
  },
  "us/ohio/columbus": {
    placeType: "city",
    verified: true,
    verificationSources: [
      "https://www.columbus.gov/",
      "https://www.experiencecolumbus.com/",
    ],
    notes:
      "Columbus is an incorporated Ohio city. Central Ohio Metro Parks and surrounding municipalities are separate jurisdictions and should be identified accurately when used as regional outdoor recommendations.",
  },
  "us/south-carolina/charleston": {
    placeType: "city",
    verified: true,
    associatedProtectedArea: {
      name: "Fort Sumter and Fort Moultrie National Historical Park",
      type: "other-protected-area",
      managingAuthority: "National Park Service",
    },
    verificationSources: [
      "https://www.charleston-sc.gov/",
      "https://www.charlestoncvb.com/",
      "https://www.nps.gov/fosu/",
    ],
    notes:
      "Charleston is an incorporated South Carolina city. Fort Sumter is a separate National Park Service site in Charleston Harbor, and surrounding beach communities such as Folly Beach and Sullivan's Island are separate municipalities.",
  },
  "us/utah/moab": {
    placeType: "city",
    verified: true,
    associatedProtectedArea: {
      name: "Arches National Park",
      type: "national-park",
      managingAuthority: "National Park Service",
    },
    verificationSources: [
      "https://moabcity.org/",
      "https://www.discovermoab.com/",
      "https://www.nps.gov/arch/",
      "https://www.nps.gov/cany/",
    ],
    notes:
      "Moab is an incorporated Utah city and outdoor gateway. Arches and Canyonlands are separate National Park Service units; Dead Horse Point is a Utah state park; extensive surrounding recreation lands are managed separately, including by the Bureau of Land Management.",
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
