export type JoshuaTreeTourType =
  | "hike"
  | "climb"
  | "stargazing"
  | "sightseeing"
  | "private-sunset"
  | "family-easy";

type SeasonalNotes = {
  winter: string[];
  spring: string[];
  summer: string[];
  fall: string[];
};

export type JoshuaTreeKnowledgeEntry = {
  narrativeParagraphs: string[];
  safetyLogisticsBullets: string[];
  geologyEcologyBullets: string[];
  seasonalNotes: SeasonalNotes;
  photographyNotes?: string[];
};

export const JOSHUA_TREE_KNOWLEDGE_BASE: Record<JoshuaTreeTourType, JoshuaTreeKnowledgeEntry> = {
  hike: {
    narrativeParagraphs: [
      "Hiking-focused outings in Joshua Tree usually move at a steady pace with interpretation breaks rather than nonstop mileage.",
      "Foot travel reveals how compacted sand, granite slabs, and uneven washes change step length and pacing through the day.",
      "Guides commonly use short pauses to explain route decisions, sun exposure, and how wind can shift comfort quickly in open terrain.",
    ],
    safetyLogisticsBullets: [
      "Carry water from the start and continue drinking before thirst builds.",
      "Wear closed-toe footwear with grip suitable for rock and gravel.",
      "Use sun layers that can adapt to wind and temperature swings.",
      "Start earlier when possible for cooler movement windows.",
      "Expect low shade coverage on many walking segments.",
      "Keep a conservative pace on uneven surfaces and loose rock.",
    ],
    geologyEcologyBullets: [
      "Rock formations show long-term weathering patterns from wind and temperature shifts.",
      "Desert vegetation clusters around subtle soil and moisture differences.",
      "Transition zones between higher and lower desert conditions can appear within short distances.",
      "Wildlife activity is often highest during cooler morning and evening windows.",
    ],
    seasonalNotes: {
      winter: ["Cool mornings are common; bring layers for the first part of the route."],
      spring: ["Spring often has comfortable temperatures but can include windy afternoons."],
      summer: ["Heat exposure can become significant; early departures reduce midday strain."],
      fall: ["Fall conditions can vary day to day; check wind and temperature before departure."],
    },
  },
  climb: {
    narrativeParagraphs: [
      "Climbing-oriented formats pair walking approaches with instruction on movement efficiency and controlled pacing on stone.",
      "Sessions often focus on body positioning, balance, and progression rather than volume or speed.",
      "Guided climbing days generally include repeated safety checks and practical coaching adjusted to participant comfort.",
    ],
    safetyLogisticsBullets: [
      "Closed-toe shoes and sun protection are important for both approach and climbing segments.",
      "Hand care and hydration become more important in dry, abrasive conditions.",
      "Temperature and rock-surface heat can influence route choice throughout the day.",
      "Expect rest intervals between efforts to maintain movement quality.",
      "Listen for guide instructions on spacing and movement sequence.",
      "Wind can affect comfort at exposed walls and boulder zones.",
    ],
    geologyEcologyBullets: [
      "Joshua Tree granite provides textured surfaces that reward precise foot placement.",
      "Rock temperature can change quickly with direct sun and wind shifts.",
      "Desert varnish and weathering patterns are visible across many climbing surfaces.",
      "Sparse vegetation around stone corridors reflects limited water retention in the substrate.",
    ],
    seasonalNotes: {
      winter: ["Colder stone temperatures can reduce grip comfort early in the day."],
      spring: ["Spring is often favorable for balanced temperatures during movement sessions."],
      summer: ["Heat management is critical; many groups prefer earliest possible start times."],
      fall: ["Fall can offer stable conditions with cooler rock surfaces than midsummer."],
    },
    photographyNotes: [
      "Side light near morning or late afternoon usually adds texture to granite surfaces.",
      "Pause during instruction breaks for cleaner action framing and safer camera handling.",
    ],
  },
  stargazing: {
    narrativeParagraphs: [
      "Stargazing experiences emphasize dark-sky timing, orientation, and controlled pacing in low-light terrain.",
      "Guides typically explain sky navigation basics before deeper viewing so participants can track major celestial references.",
      "Night outings prioritize comfort planning, layered clothing, and careful footing on uneven ground.",
    ],
    safetyLogisticsBullets: [
      "Bring warm layers even when daytime temperatures were mild.",
      "Use red-light or low-intensity lighting to preserve night vision.",
      "Move deliberately on dark terrain and maintain group spacing.",
      "Limit screen brightness when checking devices.",
      "Plan hydration and snacks before night temperatures drop.",
      "Wind can increase perceived cold after sunset.",
    ],
    geologyEcologyBullets: [
      "Open desert horizons support broad sky visibility in clear conditions.",
      "Low humidity often improves contrast for visible stars and planets.",
      "Night activity patterns differ from daytime, affecting sound and movement cues.",
      "Terrain features can influence local airflow and nighttime comfort.",
    ],
    seasonalNotes: {
      winter: ["Clear winter nights can be excellent for visibility but require warm layers."],
      spring: ["Spring nights can be comfortable, though winds sometimes increase after dusk."],
      summer: ["Late-evening heat can linger; hydration remains important after sunset."],
      fall: ["Fall often brings comfortable evening temperatures with good sky clarity."],
    },
    photographyNotes: [
      "Stable support and longer exposures are useful for low-light sky images.",
      "Foreground silhouettes can improve depth without relying on named landmarks.",
    ],
  },
  sightseeing: {
    narrativeParagraphs: [
      "Sightseeing and drive-led formats combine vehicle movement with short interpretive stops where conditions allow.",
      "This style suits travelers who want landscape context without sustained hiking intensity.",
      "Guides often balance scenic pacing with practical logistics so guests can focus on observation rather than navigation.",
    ],
    safetyLogisticsBullets: [
      "Short walks may still involve uneven ground and limited shade.",
      "Wind and sun exposure can change quickly during open-air stops.",
      "Layered clothing improves comfort between drive segments and viewpoints.",
      "Carry water for both riding and stop-based movement.",
      "Expect timing adjustments for weather and group flow.",
      "Use stable footwear even on brief walk segments.",
    ],
    geologyEcologyBullets: [
      "Drive transitions can show rapid shifts in terrain texture and vegetation density.",
      "Rock forms and basin views help illustrate long-term desert erosion patterns.",
      "Guide narration often connects visible landforms to climate and water scarcity.",
      "Desert plant communities reflect elevation and soil differences across short distances.",
    ],
    seasonalNotes: {
      winter: ["Winter often supports comfortable daytime sightseeing with cooler wind exposure."],
      spring: ["Spring can offer strong visibility with occasional gusty afternoon windows."],
      summer: ["Vehicle-based formats reduce sustained exertion, but stop timing still matters in heat."],
      fall: ["Fall frequently provides balanced temperatures for mixed drive and walk pacing."],
    },
  },
  "private-sunset": {
    narrativeParagraphs: [
      "Private sunset formats prioritize pacing flexibility and timing around changing light conditions.",
      "Guides can adapt stop length and movement rhythm to group preference while preserving safety margins.",
      "Evening outings often shift from warm daytime temperatures to cooler post-sunset conditions quickly.",
    ],
    safetyLogisticsBullets: [
      "Bring both sun protection and a warm layer for temperature swings.",
      "Low-angle light can reduce contrast on trails and uneven surfaces.",
      "Hydration remains important even during shorter evening windows.",
      "Expect variable wind as temperatures drop near dusk.",
      "Footwear with grip supports safer movement during fading light.",
      "Private pacing allows additional buffer for photo and rest stops.",
    ],
    geologyEcologyBullets: [
      "Low-angle sunset light highlights texture in rock faces and desert washes.",
      "Evening conditions can reveal different wildlife and sound patterns than daytime.",
      "Shifting color temperature changes depth perception across open terrain.",
      "Desert cooling cycles can be felt quickly in exposed areas.",
    ],
    seasonalNotes: {
      winter: ["Sunset windows are shorter in winter and can cool rapidly afterward."],
      spring: ["Spring sunsets often provide clear visibility with occasional wind."],
      summer: ["Evening departures reduce peak heat exposure but may stay warm into dusk."],
      fall: ["Fall sunsets are often comfortable, with cooler air after sundown."],
    },
    photographyNotes: ["Golden-hour side light is often strongest shortly before sunset."],
  },
  "family-easy": {
    narrativeParagraphs: [
      "Family-oriented and easier-paced experiences emphasize comfort, frequent pauses, and simple movement patterns.",
      "Guides typically focus on practical interpretation and terrain awareness suitable for mixed age ranges.",
      "This format is designed to reduce route stress while maintaining meaningful desert context.",
    ],
    safetyLogisticsBullets: [
      "Frequent water breaks help maintain comfort across mixed age groups.",
      "Choose footwear that supports short walks on uneven surfaces.",
      "Plan for sun protection even on brief outings.",
      "Layering helps manage rapid temperature shifts.",
      "Expect pacing adjustments based on group needs.",
      "Confirm age and participation guidance on the booking page.",
    ],
    geologyEcologyBullets: [
      "Easy routes can still provide clear views of desert rock and plant systems.",
      "Guides often use accessible examples to explain arid-land ecology.",
      "Short interpretive stops can show how terrain affects route planning.",
      "Desert conditions are dynamic even on beginner-friendly formats.",
    ],
    seasonalNotes: {
      winter: ["Layered clothing is useful for cool starts and milder midday windows."],
      spring: ["Spring generally supports comfortable family pacing with sun protection."],
      summer: ["Early scheduling is usually more comfortable for family groups in heat."],
      fall: ["Fall often offers steady temperatures for easy movement and interpretation."],
    },
  },
};
