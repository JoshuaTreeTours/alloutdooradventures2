export const CAIRNS_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES = [
  "3253P11",
  "2845P3",
  "22448P1",
  "76865P1",
  "5364FREE",
  "2845MIC_C",
  "5641FITZROY",
  "2570CTR",
  "611960119T1",
  "11730P6",
  "20046P3",
  "42277P10",
  "2570KURANDA",
  "37685P1",
  "2845P1",
] as const;

export type CairnsTargetedNarrativeDescriptionProductCode =
  (typeof CAIRNS_TARGETED_NARRATIVE_DESCRIPTION_PRODUCT_CODES)[number];

export const CAIRNS_TARGETED_NARRATIVE_DESCRIPTIONS: Record<
  CairnsTargetedNarrativeDescriptionProductCode,
  string
> = {
  "3253P11":
    "In Cairns, this Gold Class package boards at Reef Fleet Terminal on Spence Street and runs to two exclusive Outer Reef sites on a 35-meter catamaran. The published format keeps a private lounge, concierge service, guided snorkel time, and a BBQ lunch on one ticket rather than a shared pontoon day. The format suits visitors who want a smaller lounge group on the reef without chartering the whole vessel. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and the Outer Reef that define this outing rather than a Green Island ferry.",
  "2845P3":
    "In Cairns, this Great Adventures day leaves Reef Fleet Terminal by fast catamaran for an Outer Reef activity platform with snorkeling, a semi-submersible, and an underwater observatory. The published block lists about three hours at the platform plus buffet lunch rather than a sailing lagoon stop at Upolu Reef. The format suits visitors who want pontoon facilities and reef education without a VIP lounge upgrade. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and the Outer Reef platform that define this outing rather than a Michaelmas Cay beach landing.",
  "22448P1":
    "In Cairns, this full-day catamaran outing runs from Reef Fleet Terminal to the Marine World outer-reef platform with marine-biologist guides. The public page lists snorkeling, a glass-bottom boat, an observatory, and a buffet lunch on one booking rather than a 25-guest schooner to Green Island. The format suits visitors who want a science-led reef window without assembling snorkel and glass-bottom tickets separately. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and Marine World that define this outing rather than a Fitzroy Island ferry day.",
  "76865P1":
    "In Cairns, Reef Daytripper checks in on Marlin Marina D-Finger and sails to Upolu Reef for guided snorkeling in a sheltered lagoon. The published format is a smaller sailing day with tropical buffet lunch rather than a large Outer Reef pontoon. The format suits visitors who want lagoon snorkeling without a Green Island shore stop. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Marlin Marina and Upolu Reef that define this outing rather than a Kuranda rail and cableway circuit.",
  "5364FREE":
    "In Cairns, Ocean Free boards at Reef Fleet Terminal on a 25-guest schooner and moors at Green Island for snorkeling and island time. The public page lists snorkel tuition, a seafood smorgasbord, and a glass of wine on the return sail rather than an Outer Reef pontoon stay. The format suits visitors who want a small sailing group at Green Island without a scenic flight. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and Green Island that define this outing rather than a Daintree and Cape Tribulation coach day.",
  "2845MIC_C":
    "In Cairns, Ocean Spirit checks in at Reef Fleet Terminal and sails to Michaelmas Cay for beach snorkeling, a semi-submersible, and a marine-biologist briefing. The published format lands on the cay rather than a Green Island village stop or an Outer Reef pontoon. The format suits visitors who want a sand-cay reef window without a Tablelands food tour. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and Michaelmas Cay that define this outing rather than a Paronella Park historic day.",
  "5641FITZROY":
    "In Cairns, this ferry day crosses to Fitzroy Island with published free time for snorkeling, beach hours, a glass-bottom upgrade, or rainforest trails. The public page is an island ferry ticket rather than a guided Outer Reef pontoon or a Kuranda Gold Class rail ride. The format suits visitors who want a continental-island day without a Daintree River cruise. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Cairns and Fitzroy Island that define this outing rather than a night wildlife walk at Lake Barrine.",
  "2570CTR":
    "In Cairns, this coach day covers a guided walk at Mossman Gorge, a Daintree River wildlife cruise, and time at Cape Tribulation Beach. The published format stays in the Wet Tropics rather than a reef catamaran or a Skyrail gondola. The format suits visitors who want rainforest and river time in one booking without assembling gorge and cruise tickets independently. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Mossman Gorge, the Daintree River, and Cape Tribulation that define this outing rather than a 40-minute Reef Hopper flight.",
  "611960119T1":
    "In Cairns, this small-group outing heads onto the Atherton Tablelands for daylight wildlife walks, afternoon tea at Lake Barrine, and after-dark spotlighting. The public page lists dinner and a maximum of 11 travelers rather than a daytime food-and-wine tasting circuit. The format suits visitors who want a nocturnal rainforest window without a reef sailing day. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Lake Barrine and the Atherton Tablelands that define this outing rather than a Green Island snorkel transfer.",
  "11730P6":
    "In Cairns, this ten-hour food and wine day climbs onto the Atherton Tablelands for produce tastings, breakfast, buffet lunch, and wine samples. The published format is a guided tasting circuit rather than a waterfall-and-castle historic day at Paronella Park. The format suits visitors who want plateau food stops without a night spotlighting walk. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Cairns pickup and the Atherton Tablelands that define this outing rather than a Michaelmas Cay sail.",
  "20046P3":
    "In Cairns, this 40-minute Reef Hopper flight leaves GSL Aviation on Royal Flying Doctor Street and passes Green Island, Arlington Reef, Upolu Reef, Double Island, and Palm Cove. The published format is a high-wing aerial circuit with guaranteed window seats rather than a full-day snorkel cruise. The format suits visitors who want an overhead reef window without boarding a pontoon. Meeting points are confirmed at booking in Cairns, and the itinerary stays on those coastal and reef landmarks that define this outing rather than a Mossman Gorge walk.",
  "42277P10":
    "In Cairns, this small-group Kuranda day links Skyrail Rainforest Cableway, the Kuranda Scenic Railway, and the Army Duck tour at Rainforestation Nature Park. The public page includes both transit tickets and the Army Duck rather than Gold Class rail seating alone. The format suits visitors who want guided transfers between the cableway, railway, and rainforest park without assembling those tickets independently. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Skyrail, the scenic railway, and Rainforestation Nature Park that define this outing rather than an Outer Reef VIP lounge day.",
  "2570KURANDA":
    "In Cairns, this skip-the-line day pairs Gold Class on the Kuranda Scenic Railway with a one-way Skyrail Rainforest Cableway gondola and free time in Kuranda village. The published format is rail-and-cableway transit rather than a small-group Army Duck add-on. Pickup is listed from Cairns, Palm Cove, Trinity Beach, or Port Douglas, or at the Smithfield Skyrail terminal. Meeting points are confirmed at booking in Cairns, and the itinerary stays on the scenic railway, Kuranda, and Skyrail that define this outing rather than a Fitzroy Island ferry.",
  "37685P1":
    "In Cairns, this Atherton Tablelands historic day covers a guided visit to Paronella Park plus Lake Barrine, Millaa Millaa Falls, and the Curtain Fig Tree. The published format is a castle-and-waterfall circuit rather than a food-and-wine tasting van. The format suits visitors who want those four stops in one coach day without assembling park entry independently. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Paronella Park, Lake Barrine, Millaa Millaa Falls, and the Curtain Fig Tree that define this outing rather than a Cape Tribulation beach day.",
  "2845P1":
    "In Cairns, this Great Adventures catamaran runs from Reef Fleet Terminal to Green Island with snorkeling equipment and a glass-bottom boat on the published ticket. The public page also lists a self-guided island walk as an inclusion of this boat day rather than an audio or app-only tour. The format suits visitors who want a shorter island-and-reef window without a 25-guest schooner or an Outer Reef pontoon. Meeting points are confirmed at booking in Cairns, and the itinerary stays on Reef Fleet Terminal and Green Island that define this outing rather than a Tablelands night walk.",
};

export const getCairnsTargetedNarrativeDescription = (productCode: string) =>
  CAIRNS_TARGETED_NARRATIVE_DESCRIPTIONS[
    productCode as CairnsTargetedNarrativeDescriptionProductCode
  ];
