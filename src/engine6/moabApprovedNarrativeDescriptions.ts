export const MOAB_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "18497P15",
  "265766P59",
] as const;

export type MoabTargetedNarrativeDescriptionProductCode =
  (typeof MOAB_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const MOAB_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  MoabTargetedNarrativeDescriptionProductCode,
  string
> = {
  "18497P15":
    "Join the original Moab in a Day tour for a full-day route through Arches National Park, Canyonlands, and Dead Horse Point State Park without self-driving Utah backroads. Morning stops include Park Avenue, Double Arch, Sand Dune Arch, Balanced Rock Trail, and Windows, while afternoon pullouts open onto Canyonlands panoramas and Dead Horse Point overlooks above the Colorado River. Travel in a small group aboard a closed, air-conditioned vehicle with frequent photo stops and guide commentary on desert geology, ecology, and regional heritage. Professional guide service and coordinated logistics from Moab are included for this eight-hour park circuit.",
  "265766P59":
    "Experience Arches and Canyonlands National Parks on a two-day private Moab tour with a guide devoted exclusively to your group. Hike routes are tailored to your fitness level across stops such as Upper Delicate Arch Viewpoint, Balanced Rock Trail, Double Arch, Sand Dune Arch Trail, and Park Avenue Trail while your guide explains the parks' geology, desert ecology, and cultural history. Private transportation between trailheads keeps the pace comfortable and removes the stress of navigating crowded park roads on your own. Professional guide service and coordinated Moab logistics are included for this two-day Arches and Canyonlands hiking experience.",
};

export const getMoabTargetedNarrativeDescription = (productCode: string) =>
  MOAB_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as MoabTargetedNarrativeDescriptionProductCode
  ];
