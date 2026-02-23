import {
  detectTourContext,
  type DetectTourContextInput,
} from "./detectTourContext";

export type PalmSpringsContext = {
  geology?: string[];
  environment?: string[];
  locationContext?: string[];
  activityContext?: string[];
};

const BASE_GEOLOGY = [
  "The San Andreas system marks the transform boundary between the Pacific and North American plates.",
  "Fault movement and basin subsidence helped shape the Coachella Valley landscape.",
  "Exposed layers in badlands and canyon cuts show deformation, uplift, and pressure zones over time.",
  "Seismic processes and desert erosion together define much of today's topography.",
];

const BASE_ENVIRONMENT = [
  "Palm Springs sits within the Colorado Desert portion of the larger Sonoran Desert system.",
  "Fan palm oases form where groundwater reaches the surface along fractures and canyon systems.",
  "Alluvial fans spread sediment from mountain fronts into the basin after runoff events.",
  "Arid climate swings and episodic rain drive active erosion patterns in washes and canyons.",
];

const BASE_LOCATION_CONTEXT = [
  "The Coachella Valley is a low basin framed by the San Jacinto and Santa Rosa mountain blocks.",
  "Steep elevation gradients create fast transitions between valley floor heat and cooler mountain zones.",
  "Regional wind corridors influence visibility, sand transport, and daily comfort on open routes.",
];

const getActivityContext = (context: ReturnType<typeof detectTourContext>) => {
  const items: string[] = [];

  if (context.isJeepTour) {
    items.push(
      "Jeep routes use off-road desert terrain where wash surfaces and rough tracks expose landform changes at ground level."
    );
  }

  if (context.isHikingTour) {
    items.push(
      "Hiking segments make terrain and desert ecology easier to read, including plant zones, soils, and drainage lines."
    );
  }

  if (context.isAerialTramwayTour) {
    items.push(
      "Aerial tramway climbs compress major elevation change into one route, highlighting rapid climate and vegetation shifts."
    );
  }

  if (context.isFaultTour) {
    items.push(
      "Fault-focused stops connect visible landforms to active tectonic structure in the San Andreas zone."
    );
  }

  if (context.isCanyonTour) {
    items.push(
      "Canyon routes show erosion and seasonal water flow patterns that carve and reshape narrow desert passages."
    );
  }

  if (context.isOasisTour) {
    items.push(
      "Oasis areas indicate reliable groundwater pathways that support native fan palms in otherwise dry terrain."
    );
  }

  return items;
};

const pick = (items: string[], count: number) => items.slice(0, count);

export const getPalmSpringsAuthorityContext = (
  input: DetectTourContextInput
): PalmSpringsContext => {
  const context = detectTourContext(input);
  const activityContext = getActivityContext(context);

  return {
    geology: context.isFaultTour
      ? pick(BASE_GEOLOGY, 4)
      : context.isCanyonTour
        ? pick(
            BASE_GEOLOGY.filter(item => !item.includes("San Andreas")),
            2
          )
        : pick(
            BASE_GEOLOGY.filter(item => !item.includes("San Andreas")),
            1
          ),
    environment:
      context.isOasisTour || context.isHikingTour || context.isJeepTour
        ? pick(BASE_ENVIRONMENT, 3)
        : pick(BASE_ENVIRONMENT, 2),
    locationContext: pick(BASE_LOCATION_CONTEXT, 2),
    activityContext,
  };
};
