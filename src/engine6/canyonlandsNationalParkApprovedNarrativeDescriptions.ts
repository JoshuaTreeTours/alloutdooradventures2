export const CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES =
  [
    "24134P3",
    "6896MOABCHPARK",
    "6896MOABWRIM",
    "14649P15",
    "265766P60",
    "14649P17",
    "18497P14",
    "148657P1",
  ] as const;

export type CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode =
  (typeof CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode,
  string
> = {
  "24134P3":
    "Discover the rugged beauty and ancient legends of Canyonlands National Park on a 4WD tour from Moab. Go off-roading in a sturdy Jeep to reach the Island in the Sky district and other remote areas, where the Colorado River slices through steep ravines and ancient Pueblo rock art decorates the sandstone cliffs. Stops include Island in the Sky, Shafer Trail, Gooseneck Overlook. Hold on tight as your driver and guide navigates the switchbacks of Shafer Trail, and fill your camera roll with amazing perspective shots of the red-rock canyons. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "6896MOABCHPARK":
    "Hit the dusty trail on a full-day 4x4 tour into the Needles District of Canyonlands National Park. Expert guides navigate Chesler Park highlights such as Elephant Hill, Devil's Lane, and Devil's Kitchen, with an optional hike on the Joint Trail. Stops include Needles District, Chesler Park, Elephant Hill, Devil's Lane, Devil's Kitchen, Joint Trail. Buffet lunch and 4x4 transport keep the day focused on remote sandstone spires away from Island in the Sky crowds. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "6896MOABWRIM":
    "Go off-roading by 4-wheel drive deep into Canyonlands National Park via the White Rim Road, a scenic route of switchbacks and red rock formations. This full-day tour with an expert guide includes popular spots such as Island in the Sky, Gooseneck Overlook, Musselman Arch, Lathrop Canyon and the Shafer Trail leading to the Colorado River. Stops include White Rim Road, Island in the Sky, Gooseneck Overlook, Musselman Arch, Lathrop Canyon, Shafer Trail. Take short optional guided hikes that lead to hidden passages, secret canyons and the caves of Canyonlands. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "14649P15":
    "Soar above Canyonlands National Park on a 45-minute scenic helicopter flight from Moab. Capture aerial views of Dead Horse Point, Thelma and Louise Point, the Colorado River, Behind the Rocks, and Island in the Sky rim country with pilot narration. Stops include Dead Horse Point, Thelma and Louise Point, Colorado River, Island in the Sky, Grand View Point. Window seats and headsets keep the short flight focused on canyon overlooks and red-rock photo angles. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "265766P60":
    "Join Master Naturalist guides for a full-day private tour and hike focused on Canyonlands National Park. The itinerary stops at natural arches and sandstone formations, with time for off-the-beaten-path features when conditions allow. Stops include Mesa Arch, Grand View Point Overlook, Green River Overlook, Upheaval Dome. Guides share the park's human and geological history along with flora and fauna context throughout the day. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "14649P17":
    "Discover Canyonlands National Park from the air and learn more about the geology of the Colorado Plateau with this airplane tour. Take off from Moab and fly over the mountains, canyons, rivers, and surrounding landscape of Southeastern Utah and Western Colorado, with informative commentary from your pilot along the way. Stops include Dead Horse Point State Park, Island in the Sky, Fisher Towers, La Sal Mountains, Confluence of the Colorado and Green Rivers, Needles District. Window seats and headsets keep the geology-focused flight easy to follow. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "18497P14":
    "In Canyonlands National Park, join a private small-group sunset outing that pairs a short bumpy 4x4 ride on Long Canyon Road with a half-mile scramble hike to a secluded vista. Start time shifts with sunset so picture stops land in warm evening light away from crowded overlooks. Stops include Long Canyon Road, Canyonlands National Park, Secluded sunset overlook. The private format keeps pacing flexible for photos and short walks. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
  "148657P1":
    "Perfect your photography skills while exploring Dead Horse Point State Park and Canyonlands National Park. You and your photographer guide will head out in time to catch the early morning light. Stops include Dead Horse Point State Park, Canyonlands National Park, Island in the Sky. Your guide will also be available to teach you about composition and help you navigate your camera's settings while you work sunrise light across Island in the Sky overlooks and canyon rim viewpoints. Ideal for visitors basing in Moab who want a guided Canyonlands National Park experience without coordinating park logistics, trailheads, or backcountry routes on their own.",
};

export const getCanyonlandsNationalParkTargetedNarrativeDescription = (
  productCode: string
) =>
  CANYONLANDS_NATIONAL_PARK_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as CanyonlandsNationalParkTargetedNarrativeDescriptionProductCode
  ];
