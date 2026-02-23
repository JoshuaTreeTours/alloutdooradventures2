import type { BookingTourData } from "./extractBookingTourData";
import { normalizeTourDetails } from "./normalizeTourDetails";

type RewriteInput = BookingTourData;

export type SanAndreasRewrite = {
  overview: string;
  details: {
    duration?: unknown;
    meetingPoint?: unknown;
    groupSize?: unknown;
    age?: unknown;
    accessibility?: unknown;
    cancellation?: unknown;
  };
  highlights: string[];
  localAuthority: string;
};

export const rewriteSanAndreasTour = (tourData: RewriteInput): SanAndreasRewrite => {
  const overview =
    "The Shared San Andreas Fault Jeep Tour focuses on one of Southern California’s most studied active fault systems, where the Pacific Plate and North American Plate meet in a right-lateral transform boundary. In the Indio Hills northeast of Palm Springs, this plate motion has uplifted and fractured sedimentary formations, creating fault canyons, narrow washes, and desert oases fed by groundwater moving through alluvial layers. The route uses private access through Metate Ranch, which allows guided entry into terrain not available on standard public roads. Throughout the tour, guides explain how fault slip, erosion, flash flooding, and groundwater recharge shape the landscape over time. The result is a field-based geology experience that connects regional tectonics with visible landforms in the Coachella Valley, while also providing historical context for long-term Indigenous land use in the same corridor.";

  const details = normalizeTourDetails({
    duration: tourData.duration,
    meetingPoint: tourData.meetingPoint,
    groupSize: tourData.groupSize,
    age: tourData.age,
    accessibility: tourData.accessibility,
    cancellation: tourData.cancellation,
  });

  const highlights = [
    "Travel by Jeep through fault canyons where uplifted and eroded sediments expose active geologic structure.",
    "Walk a short slot canyon section to observe how runoff and sediment transport carve narrow desert passages.",
    "Visit a California fan palm oasis and learn how fault-related groundwater pathways support this habitat.",
    "Review the Cahuilla connection to the Paltewet village site and long-term use of desert water and plant resources.",
    "Optional grinding stone hike offers additional context on bedrock, cultural history, and traditional food processing areas.",
  ];

  const localAuthority =
    "Palm Springs sits within the broader Coachella Valley fault network, where the Banning, Mission Creek, and southern San Andreas strands influence basin shape, groundwater movement, and desert habitat distribution. Reading this landscape through tectonics and ecology helps explain why palm oases, washes, and rocky uplifts occur in close proximity across the valley floor and foothills.";

  return {
    overview,
    details: {
      duration: details.duration,
      meetingPoint: details.meetingPoint,
      groupSize: details.groupSize,
      age: details.age,
      accessibility: details.accessibility,
      cancellation: details.cancellation,
    },
    highlights,
    localAuthority,
  };
};
