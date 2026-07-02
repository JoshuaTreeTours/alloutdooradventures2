export const GREAT_SMOKY_MOUNTAINS_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "26480P2",
  "26480P11",
  "26480P6",
  "26480P8",
  "26480P14",
] as const;

export type GreatSmokyMountainsTargetedNarrativeDescriptionProductCode =
  (typeof GREAT_SMOKY_MOUNTAINS_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const GREAT_SMOKY_MOUNTAINS_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  GreatSmokyMountainsTargetedNarrativeDescriptionProductCode,
  string
> = {
  "26480P2":
    "Step back to a simpler era on a guided history and nature walk through Great Smoky Mountains National Park with A Walk in the Woods naturalist guides. Your guide leads a gentle trail past a family cemetery, nineteenth-century barn, and restored settler cabin while sharing Cherokee heritage and Appalachian pioneer stories along the misnamed Little River corridor where early logging towns once thrived. Certified Wilderness First Responders pace this small-group outing from Sugarlands Visitor Center with wildlife and geology interpretation at every turn. Trail snacks and interpretive history commentary are included for travelers who want cultural context without strenuous climbing.",
  "26480P11":
    "Hike to Clear Creek Falls on a guided half-day outing that pairs moderate trail mileage with waterfall scenery in Great Smoky Mountains National Park. A Walk in the Woods naturalist guides lead the route from the Fighting Creek Gap area through forested creek corridors to the falls, sharing wildflower and wildlife insights along the way. The pace suits hikers comfortable with a few hours on uneven terrain, and guides carry Wilderness First Responder certification for added peace of mind in bear country. Professional guide service, trail snacks, and water are included for this Gatlinburg-gateway waterfall hike.",
  "26480P6":
    "Leave the driving to expert naturalist guides on a high-country van tour to the top of the Smoky Mountains in Great Smoky Mountains National Park. Travel the Newfound Gap corridor with photo stops above the sea of ridges, optional Appalachian Trail viewpoints, and commentary on human and natural history from guides who may include former park rangers and thru-hikers. This three-hour outing suits travelers who want big panoramas without long hikes, and luxury van transport keeps the focus on scenery between Clingmans Dome area pullouts and Newfound Gap Road overlooks.",
  "26480P8":
    "Chase peak autumn color in Great Smoky Mountains National Park on a guided fall foliage tour led by naturalists who track leaf progression weekly near Gatlinburg. Itineraries flex to the best color at tour time, with high-elevation overlooks, ridgeline hikes, and quiet cove roads replacing fixed routes when leaves peak at different elevations. Guides may include former park rangers and biologists who explain why the Smokies produce vivid displays, and easy to moderate hiking keeps the outing accessible while maximizing photography along the daily route.",
  "26480P14":
    "Build your ideal Smoky Mountains day on a private custom tour with A Walk in the Woods naturalist guides in Great Smoky Mountains National Park. Choose from waterfall hikes, history strolls, high-country vistas, or a mix tailored to your group's fitness and interests. Your guide presents options at the meetup, then leads a full-day adventure with an included deli picnic lunch. This private format suits families and small groups who want flexible pacing through Appalachian forest trails and scenic overlooks without joining a fixed itinerary group from the Gatlinburg gateway.",
};

export const getGreatSmokyMountainsTargetedNarrativeDescription = (
  productCode: string
) =>
  GREAT_SMOKY_MOUNTAINS_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as GreatSmokyMountainsTargetedNarrativeDescriptionProductCode
  ];
