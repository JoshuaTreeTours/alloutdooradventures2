import { buildEngine6ViatorBookingUrl } from "./buildEngine6ViatorBookingUrl";
import { normalizeEngine6AggregateRating } from "./rating";
import { formatEngine6StartingPriceLabel } from "./priceDisplay";
import { resolveEngine6PathForProductCode } from "./routes";
import {
  buildEngine6CanonicalPath,
  buildEngine6MetaDescription,
  buildEngine6SeoTitle,
  cleanEngine6Description,
  formatEngine6CategoryLabel,
} from "./seo";
import type { Engine6ApiResponse, Engine6Tour } from "./types";

const ENGINE6_OPENING_PATTERNS = [
  "Join one of the best experiences in %CITY% with this %TOUR_TYPE%.",
  "Discover one of the top-rated experiences in %CITY% on this %TOUR_TYPE%.",
  "Experience one of the most popular things to do in %CITY% with this %TOUR_TYPE%.",
  "Explore one of the best outdoor adventures in %CITY% on this %TOUR_TYPE%.",
] as const;
const ENGINE6_OPENING_PATTERN_OVERRIDES: Record<string, number> = {
  "100569P5": 0,
};
const ENGINE6_OPENING_SENTENCE_OVERRIDES: Record<string, string> = {
  "100569P5": "Join one of the best experiences in Anchorage...",
  "365892P1":
    "Explore Los Angeles on a private full-day sightseeing tour with hotel pickup, a comfortable air-conditioned vehicle, and stops at Venice Beach, Santa Monica Pier, Beverly Hills, Hollywood, and the Hollywood Sign.",
  "15131P4":
    "Fly above Los Angeles on a private helicopter tour with sweeping aerial views of Hollywood, downtown Los Angeles, and the city’s most recognizable landmarks.",
  "148509P1":
    "Go behind the scenes of Hollywood filmmaking on a guided Warner Bros. Studio Tour featuring working backlots, sound stages, and iconic film and TV sets.",
  "106439P1":
    "See the homes of celebrities and iconic landmarks on a guided sightseeing tour through Hollywood, Beverly Hills, and the Sunset Strip.",
  "170119P1":
    "Explore Los Angeles in a single day on a guided tour covering Hollywood, Beverly Hills, Santa Monica, and coastal highlights with multiple photo stops.",
  "47235P1":
    "See the most famous highlights of Los Angeles in one day, including Hollywood, Beverly Hills, Santa Monica, and Venice Beach with guided stops along the way.",
  "2030UNIENTRY":
    "Enjoy a full day at Universal Studios Hollywood with access to thrilling rides, immersive movie-themed attractions, and behind-the-scenes studio experiences.",
  "163975P1":
    "Settle into Santa Barbara’s coastal rhythm on a guided trolley tour that links landmark neighborhoods, beaches, and historic architecture in one easy loop.",
  "447486P2":
    "Sail Santa Barbara’s waterfront on a happy-hour yacht cruise with coastal views, relaxed onboard seating, and a social golden-hour atmosphere.",
  "117409P1":
    "Head beyond the coast on a guided Santa Ynez Valley day trip focused on wine-country towns, vineyard landscapes, and relaxed tasting stops.",
};
const ENGINE6_OVERVIEW_OVERRIDES: Record<
  string,
  (args: { city: string; state: string; sourceOverview: string }) => string
> = {
  "6740JTREE": () =>
    "Skip the crowds and see a wilder side of Joshua Tree on a guide-led backroads outing from Palm Springs and the Coachella Valley. Riding in an open-air Hummer, you travel through high-desert terrain where Joshua tree forests, granite piles, broad valleys, and distant mountain lines open up in every direction. The pace stays relaxed, with time for pullouts, photos, and short walks at signature spots such as Keys View, Barker Dam, and Cap Rock when conditions allow. Along the way, your guide connects what you are seeing to the park’s geology, wildlife, and human history without turning the day into a lecture. It’s a scenic, low-stress way to experience Joshua Tree National Park while still getting off the usual highway rhythm.",
  "2335P1": () =>
    "Explore one of the Coachella Valley’s defining geologic landscapes on this guided off-road Jeep tour into the San Andreas Fault zone near Palm Springs. The route travels through desert canyons and washes shaped by active tectonic forces, where your naturalist guide interprets fault movement, earthquake geology, and the landforms that reveal how the valley evolved over time. Along the way, you experience rugged terrain and wide desert vistas while learning how climate, erosion, and plate dynamics interact across this section of Southern California. Designed as a destination-first geology adventure rather than a standard city sightseeing loop, this small-group experience combines outdoor exploration with clear scientific context in one of the region’s most consequential fault environments.",
  "335698P7": () =>
    "Short on time but want a solid first look at Joshua Tree National Park? This half-day small-group tour from the Palm Springs region covers key landscapes efficiently while keeping the experience personal and unhurried. You ride between major viewpoints and iconic rock areas, then get out for brief walks and interpretive stops at places such as Hidden Valley, Cap Rock, or Keys View depending on timing and conditions. Your guide handles routing and park logistics so you can focus on the scenery: twisted Joshua trees, rounded granite monoliths, open desert basins, and long mountain horizons. Commentary is approachable and useful, touching on geology, plants, and park history without overloading the outing. It’s ideal for first-time visitors, photographers, and anyone seeking the highlights in a compact format.",
  "237571P2": () =>
    "If you want real trail time in Joshua Tree rather than a drive-through overview, this full-day guided hike delivers. Starting from the Palm Springs area, you head into the park with a naturalist guide who sets a route to match conditions and group pace, then leads you across desert paths framed by Joshua trees, sculpted granite, and open basins. Expect sustained walking, frequent interpretation, and plenty of chances to look closely at the details most visitors miss—from weathered rock textures and fault-shaped landforms to hardy plant communities and signs of desert wildlife. Breaks are built in for water, photos, and big-view moments, but the focus stays on being out on the trail. It’s a strong choice for travelers who want both movement and meaningful park context.",
  "335698P13": () =>
    "This Joshua Tree experience is built around movement: climbing, stepping, and scrambling through the park’s granite world with a guide who coaches technique and pacing as you go. Instead of staying on flat viewpoints, you work through boulder clusters and natural rock corridors, using hands and feet to reach higher perches with wide Mojave and Colorado Desert views. The route emphasizes active problem-solving and body awareness, with options that keep adventurous beginners engaged while still rewarding more experienced hikers. Between scrambles, your guide shares practical insight into how wind, water, and tectonic forces shaped these formations and why desert life survives here. From the Palm Springs/Joshua Tree area, it’s an energetic half-day outdoors for travelers who want something more physical than a standard scenic stop circuit.",
  "3351P15": () =>
    "Explore Indian Canyons on a guided bike-and-hike experience from Palm Springs that combines cycling sections with on-foot trail segments through canyon corridors and desert scenery. The route emphasizes the area’s canyon landscape, native palm oasis setting, and the broader Coachella Valley desert environment while logistics and pacing are managed by your guide. As an active, structured outing, it is a practical choice for travelers who want a single experience that blends sightseeing, light interpretation of local desert ecology and geology, and hands-on outdoor movement.",
  "191303P1": () =>
    "This guided electric-bike tour explores Coronado Island in a small group of up to six travelers using custom Fat Woody beach cruisers. Riders roll past the Glorietta Bay Promenade, Coronado Beach, and Coronado Ferry Landing while a local guide shares Coronado history, manages route pacing, and helps capture photos along the way. Bikes include an integrated speaker system for beach tunes, and each guest receives a color-matched helmet plus bottled water. The 3-hour format is designed for confident riders who want scenic waterfront coverage, light storytelling, and a relaxed but structured coastal loop near San Diego.",
  "69764P1": () =>
    "This 3-hour whale watching cruise from San Diego follows the local coastline for seasonal marine-life viewing and open-ocean scenery. Depending on conditions, sightings can include whales, dolphins, and seabirds while your crew shares practical context about local waters and wildlife behavior, including naturalist or captain commentary when offered onboard. The route is paced as a classic coastal outing with clear logistics and broad photo opportunities from the boat. It is a strong fit for families, couples, and first-time visitors who want a dependable San Diego ocean activity centered on wildlife and views.",
  "18125P5": () =>
    "This private Segway tour offers a fun, efficient way to explore Balboa Park with a dedicated guide in San Diego. You glide through the park to see gardens, museum exteriors, Spanish Colonial Revival architecture, and other landmark areas while covering more ground than a typical walking route. The private format supports a more personalized pace and commentary tailored to your group. It is a strong fit for visitors who want an engaging overview of Balboa Park without spending the day on foot.",
  "173946P1": () =>
    "This half-day 4x4 adventure near San Diego takes you into inland backcountry terrain for a guide-led, outdoor-focused route. The experience explores changing dirt tracks, elevation gains, and scenic overlooks in the Otay wilderness area, creating a rugged alternative to standard city sightseeing. Travel is managed by a guide with route pacing adjusted to conditions and group comfort. With a private format and clear logistics, it is a strong fit for travelers who want a more active outing that prioritizes terrain, landscape views, and hands-on adventure over typical urban tour stops.",
  "3885SW303BS": ({ city, state, sourceOverview }) => {
    const supportsLucerne = /lucerne/i.test(sourceOverview);
    const supportsTitlis = /\b(mt\.?\s*titlis|mount titlis)\b/i.test(
      sourceOverview
    );
    const destinationClause = [
      supportsLucerne ? "Lucerne" : null,
      supportsTitlis ? "Mount Titlis" : null,
    ]
      .filter(Boolean)
      .join(" and ");

    return [
      `Mount Titlis and Lucerne Day Trip from Zurich is a full-day guided excursion from ${city}, ${state} that combines lake-city sightseeing with high-alpine mountain scenery.`,
      destinationClause
        ? `Travel through central Switzerland toward ${destinationClause}, following a structured day-trip format that keeps transfers and timing coordinated.`
        : "Travel through central Switzerland on a structured day-trip format that keeps transfers and timing coordinated.",
      "The outing focuses on efficient mountain access, panoramic viewpoints, and clear guided logistics, making it a practical option for travelers who want major Swiss highlights in one day.",
      "It is designed for visitors who prefer a single organized itinerary instead of arranging separate rail and lift connections on their own.",
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  },
  "163975P1": () =>
    "Santa Barbara Trolley Tour is a relaxed city overview that pairs coastal scenery with historic landmarks in a comfortable, open-air style ride. As the trolley rolls through town, you pass waterfront icons like Stearns Wharf and East Beach, continue by the Andrée Clark Bird Refuge and Butterfly Beach, and take in the city’s Spanish-influenced architecture around the courthouse and El Presidio district. The route also includes a dedicated stop at Old Mission Santa Barbara, where you have about 10 minutes to look around before rejoining the tour. Along the way, your guide adds practical local context on neighborhoods, history, and daily life, so the experience feels more personal than a standard transfer. It’s an easy way to understand Santa Barbara’s scenic, coastal, and historic character early in your visit.",
  "447486P2": () =>
    "Santa Barbara Happy Hour on a Yacht is a harbor-focused cruise that shifts the experience from city streets to open water during golden hour. You board near Santa Barbara Harbor and settle into a relaxed social setting as the yacht cruises along the waterfront with broad views of the coastline, marina activity, and mountain backdrop. Instead of stop-and-go land sightseeing, the format emphasizes steady sailing, fresh ocean air, and time to unwind with your group while the captain navigates calm coastal routes. Expect a polished but casual vibe designed around conversation, photos, and sunset light across the American Riviera. It’s an easy way to experience Santa Barbara from the water in a short, memorable happy-hour window.",
  "117409P1": () =>
    "Santa Ynez Valley Tour is a full-day wine-country outing from Santa Barbara that trades shoreline views for inland ranchland, vineyard slopes, and small-town main streets. The route usually follows Highway 154 over San Marcos Pass into the Santa Ynez Valley, then moves between tasting stops in communities such as Solvang, Los Olivos, and Santa Ynez depending on the day’s winery lineup. Your guide handles driving and timing, so you can focus on scenery, local wine styles, and a relaxed pace between pours. Expect a social small-group format with structured stops, practical destination context, and enough free moments to browse tasting rooms or village blocks. It’s an easy way to experience one of Santa Barbara County’s best-known wine regions without self-driving logistics.",
};

const pickOpeningPatternIndex = (seed: string) => {
  const override = ENGINE6_OPENING_PATTERN_OVERRIDES[seed];
  if (typeof override === "number") {
    return override;
  }

  if (!seed) {
    return 0;
  }

  const value = seed
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return value % ENGINE6_OPENING_PATTERNS.length;
};

const buildEngine6OpeningSentence = ({
  city,
  title,
  categoryLabel,
  productCode,
}: {
  city: string;
  title: string;
  categoryLabel: string | null;
  productCode: string;
}) => {
  const normalizedCity = city.trim() || "this destination";
  const titleIncludesCity = title
    .toLowerCase()
    .includes(normalizedCity.toLowerCase());
  const tourType =
    categoryLabel?.toLowerCase() ??
    (titleIncludesCity ? "tour" : title.toLowerCase());
  const safeTourType = tourType.includes("tour")
    ? tourType
    : `${tourType} tour`;
  const pattern =
    ENGINE6_OPENING_PATTERNS[pickOpeningPatternIndex(productCode)] ??
    ENGINE6_OPENING_PATTERNS[0];

  return pattern
    .replace("%CITY%", normalizedCity)
    .replace("%TOUR_TYPE%", safeTourType);
};

const toSentence = (value: string) => {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const countWords = (value: string) =>
  value.trim().split(/\s+/).filter(Boolean).length;

const stripMarketingLanguage = (value: string) =>
  value
    .replace(/\bonce in a lifetime\b/gi, "")
    .replace(/\btrip of a lifetime\b/gi, "")
    .replace(/\bmust-?do\b/gi, "notable")
    .replace(/\bbucket list\b/gi, "popular");

const buildAuthoritativeOverview = ({
  title,
  city,
  state,
  categoryLabel,
  durationText,
  highlights,
  itinerary,
  meetingPointText,
  sourceOverview,
}: {
  title: string;
  city: string;
  state: string;
  categoryLabel: string | null;
  durationText: string | null;
  highlights: string[];
  itinerary: Array<{ title: string }>;
  meetingPointText: string | null;
  sourceOverview: string;
}) => {
  const normalizedLocation = `${city}, ${state}`;
  const activityLabel =
    categoryLabel?.toLowerCase().replace(/\s+tour$/i, " tour") ?? "guided tour";
  const cleanedSourceOverview = stripMarketingLanguage(sourceOverview)
    .replace(/\s+/g, " ")
    .trim();
  const highlightText = highlights
    .slice(0, 3)
    .map(item => item.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const stopText = itinerary
    .slice(0, 3)
    .map(stop => stop.title.replace(/\.$/, "").trim())
    .filter(Boolean)
    .join(", ");
  const sourceSnippet = cleanedSourceOverview
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();

  const opening = toSentence(
    `Set in ${normalizedLocation}, ${title} is a ${activityLabel} built around a guide-led experience and practical local context`
  );
  const middleA = toSentence(
    [
      highlightText
        ? `During the outing, you can expect activities such as ${highlightText}`
        : "The experience blends local interpretation with hands-on activity",
      stopText ? `with scheduled stops such as ${stopText}` : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const logistics = toSentence(
    [
      "The format is guided and follows a structured itinerary",
      durationText ? `with a typical duration of ${durationText}` : "",
      meetingPointText
        ? `and departure details centered on ${meetingPointText}`
        : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
  const closer = toSentence(
    `Overall, this ${city} experience balances clear guidance, real destination context, and a relaxed pace suited to small groups`
  );

  const parts = [opening, middleA, logistics, sourceSnippet, closer].filter(
    Boolean
  );
  const withLimit = () => {
    const limited: string[] = [];
    for (const part of parts) {
      const next = [...limited, part].join(" ");
      if (countWords(next) > 150) break;
      limited.push(part);
    }
    return limited.join(" ");
  };

  let summary = withLimit();
  if (countWords(summary) < 100) {
    const expansion = toSentence(
      `Expect accurate location details, on-the-ground orientation, and enough flexibility to enjoy each stop without feeling rushed`
    );
    const expanded = `${summary} ${expansion}`.trim();
    summary = countWords(expanded) <= 150 ? expanded : summary;
  }

  return summary;
};

const ENGINE6_CANONICAL_PATH_PATTERN =
  /^\/destinations\/([^/]+)\/([^/]+)\/tours\/[^/]+$/;

const slugToLabel = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const ENGINE6_ITINERARY_DESCRIPTION_OVERRIDES: Record<string, string[]> = {
  "163975P1": [
    "Roll past Stearns Wharf for broad harbor views, fishing-pier history, and a classic first look at Santa Barbara’s shoreline.",
    "Continue along East Beach, where palms, volleyball courts, and mountain-meets-ocean scenery define the city’s laid-back coastal mood.",
    "Pass the Andrée Clark Bird Refuge to see lagoon habitat, walking paths, and one of the quieter nature pockets near the waterfront.",
    "Glide by Butterfly Beach, a scenic Montecito stretch known for calm surf, ocean light, and postcard-worthy coastal homes.",
    "Travel past the Santa Barbara Museum of Natural History, a longtime local institution set near native landscape and oak-lined grounds.",
    "Stop at Old Mission Santa Barbara for about 10 minutes to view the landmark church and grounds; admission ticket is not included.",
    "Pass the Santa Barbara County Courthouse to admire its Spanish Colonial Revival design and one of downtown’s signature civic landmarks.",
    "Ride by El Presidio de Santa Barbara State Historic Park, where preserved adobe-era structures reflect the city’s early colonial roots.",
    "Finish along the Santa Barbara waterfront with marina views, palm-lined promenades, and a final sweep of the coast.",
  ],
  "117409P1": [
    "Leave Santa Barbara and climb over San Marcos Pass on Highway 154, where coastal terrain gives way to ranchlands and vineyard valleys.",
    "Arrive in Santa Ynez Valley wine country for guided tasting-stop rotations based on the day’s participating wineries.",
    "Spend time in Solvang to explore Danish-style streets, local shops, and tasting rooms between winery visits.",
    "Continue through Los Olivos for small-town wine-country atmosphere and additional tasting opportunities when scheduled.",
    "Travel through Santa Ynez with route commentary on valley history, agriculture, and regional winemaking styles.",
    "Return to Santa Barbara with a final scenic drive back over the pass after the day’s tasting itinerary wraps.",
  ],
  "447486P2": [
    "Depart from Santa Barbara Harbor and settle in for a relaxed happy-hour yacht cruise.",
    "Glide past Stearns Wharf for classic waterfront views from the water.",
    "Cruise along East Beach and the Santa Barbara coastline with open-ocean breezes.",
    "Take in channel and mountain sunset views as golden-hour light builds offshore.",
    "Return to Santa Barbara Harbor to finish the coastal yacht experience.",
  ],
  "5096P30": [
    "Begin your sightseeing loop on Hollywood Boulevard at the Big Bus Welcome Center, where departures run throughout the day.",
    "Pass the TCL Chinese Theatre to see one of Hollywood’s signature landmarks with its famous celebrity handprints.",
    "See the Rockwalk at Guitar Center, a Sunset Strip tribute honoring influential musicians.",
    "Cruise past The Comedy Store, the iconic club that helped launch generations of stand-up talent.",
    "Take in Sunset Plaza’s upscale mix of boutiques, restaurants, and classic Sunset Strip views.",
    "Ride through West Hollywood’s high-energy district known for nightlife, culture, and celebrity hotspots.",
    "Stop near Beverly Gardens Park for Beverly Hills sign photos and manicured garden views.",
    "Visit Beverly Center, one of Los Angeles’s best-known destinations for premium retail shopping.",
    "Pass Museum Row, a major LA arts corridor anchored by museums such as LACMA and the Petersen Automotive Museum.",
    "Explore The Grove and the Original Farmers Market for open-air shopping, dining, and local food favorites.",
  ],
  "67760P2": [
    "Stroll Santa Monica Pier for ocean panoramas, lively boardwalk energy, and easy access to nearby shopping streets.",
    "Sample Los Angeles food options with time to browse popular retail spots such as The Grove.",
    "Take in close-up Hollywood Sign views while exploring science-focused exhibits and hilltop city vistas.",
    "Walk Hollywood’s iconic theater district, including landmark venues and classic Walk of Fame photo moments.",
  ],
  "32779P6": [
    "Travel deep into Catalina’s interior for sweeping island viewpoints and frequent wildlife sightings across protected terrain.",
  ],
  "5144BRUNCH": [
    "Settle into a relaxed bay cruise with live onboard ambiance, skyline views, and a polished Sunday brunch setting.",
    "Cruise beneath the Coronado Bridge past Seaport Village and the USS Midway along San Diego’s iconic waterfront corridor.",
    "Watch downtown skyline views broaden from the dining deck as the yacht glides through central harbor waters.",
    "Take in open-water panoramas while brunch service and live entertainment continue throughout the sailing.",
    "Pass naval installations, Shelter Island marinas, and Cabrillo’s coastal point on the scenic return across San Diego Bay.",
  ],
};

const rewriteItineraryDescriptionToSingleSentence = (
  args: {
    productCode: string;
    item: NonNullable<Engine6ApiResponse["extracted"]["itinerary"]>[number];
    index: number;
  }
) => {
  const override =
    ENGINE6_ITINERARY_DESCRIPTION_OVERRIDES[args.productCode]?.[args.index];
  if (override) {
    return override;
  }

  const { item } = args;
  const title = item.title?.trim() || "This stop";
  const duration = item.duration?.trim();
  const admission = item.admissionNote?.trim();
  const sourceDescription = item.description?.trim() ?? "";
  const cleanedSource = sourceDescription
    .replace(/\s+/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(you will|you'll|we will|we'll)\b/gi, "")
    .trim();
  const sourceSentence =
    cleanedSource
      .split(/[.!?]/)
      .map(part => part.trim())
      .find(Boolean) ?? "";
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normalizedSentence = sourceSentence
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const repeatsTitle =
    normalizedTitle.length > 0 &&
    normalizedSentence.length > 0 &&
    (normalizedSentence === normalizedTitle ||
      normalizedSentence.includes(normalizedTitle));
  const polishedSourceSentence = sourceSentence
    .replace(/^(enjoy|experience|discover|visit|explore|see)\s+/i, "")
    .replace(/^take in\s+/i, "")
    .replace(/^check out\s+/i, "")
    .replace(/^pass(?: by)?\s+/i, "")
    .replace(/^you(?:'ll| will)\s+/i, "")
    .replace(/^[a-z]/, m => m.toUpperCase())
    .replace(/[;:,]\s*$/, "")
    .trim();

  const durationClause = duration ? ` over ${duration}` : "";
  const admissionClause = admission ? `; ${admission}` : "";

  if (polishedSourceSentence && !repeatsTitle) {
    return `${polishedSourceSentence}${admissionClause}.`
      .replace(/\s+/g, " ")
      .replace(/\s+([;,.])/g, "$1")
      .replace(/\.\./g, ".")
      .trim();
  }

  const fallbackLead =
    item.stopType === "pass-by"
      ? "Continue along the route with clear views of key waterfront and city landmarks"
      : "Settle into a guided sightseeing segment with broad local views and destination context";

  return `${fallbackLead}${durationClause}${admissionClause}.`
    .replace(/\s+/g, " ")
    .replace(/\s+([;,.])/g, "$1")
    .replace(/\.\./g, ".")
    .trim();
};

export const mapViatorToEngine6Tour = (
  payload: Engine6ApiResponse
): Engine6Tour => {
  const title =
    payload.extracted.title ?? `Outdoor Adventure ${payload.rawProductCode}`;
  const generatedCanonicalPath = buildEngine6CanonicalPath({
    state: payload.extracted.state ?? "destination",
    city: payload.extracted.city ?? "destination",
    title,
  });
  const canonicalPath =
    resolveEngine6PathForProductCode(payload.rawProductCode) ??
    generatedCanonicalPath;
  const [, routeStateSlug = "", routeCitySlug = ""] =
    ENGINE6_CANONICAL_PATH_PATTERN.exec(canonicalPath) ?? [];
  const routeCityLabel = slugToLabel(routeCitySlug) ?? null;
  const routeStateLabel = slugToLabel(routeStateSlug) ?? null;
  const city = routeCityLabel ?? payload.extracted.city ?? "Destination";
  const state = routeStateLabel ?? payload.extracted.state ?? "Destination";

  if (!payload.extracted.city || !payload.extracted.state) {
    console.warn("[engine6-location] missing explicit location fields", {
      productCode: payload.rawProductCode,
      extractedCity: payload.extracted.city,
      extractedState: payload.extracted.state,
      fallbackCity: city,
      fallbackState: state,
    });
  }
  const finalHeroImageUrl =
    typeof payload.extracted.heroImageUrl === "string" &&
    /^https?:\/\//i.test(payload.extracted.heroImageUrl) &&
    !payload.extracted.heroImageUrl.includes("/hero.jpg") &&
    !payload.extracted.heroImageUrl.includes("/images/hiking-hero.jpg")
      ? payload.extracted.heroImageUrl
      : null;
  const strictResolvedHero =
    finalHeroImageUrl &&
    payload.diagnostics.heroSourceProductCode &&
    payload.diagnostics.heroSourceProductUrl &&
    payload.diagnostics.heroSourceFieldPath &&
    payload.diagnostics.heroHost &&
    payload.diagnostics.heroSourceFieldPath.startsWith(
      "product.media.images"
    ) &&
    payload.diagnostics.heroSourceProductCode.toUpperCase() ===
      payload.rawProductCode.toUpperCase() &&
    payload.diagnostics.finalHeroUrl === finalHeroImageUrl
      ? {
          url: finalHeroImageUrl,
          sourceProductCode: payload.diagnostics.heroSourceProductCode,
          sourceProductUrl: payload.diagnostics.heroSourceProductUrl,
          sourceFieldPath: payload.diagnostics.heroSourceFieldPath,
          host: payload.diagnostics.heroHost,
        }
      : null;

  if (!strictResolvedHero) {
    throw new Error(
      `Engine6 strict hero contract violation for ${payload.rawProductCode}: resolved hero must be exact-product product.media.images with full provenance`
    );
  }
  const sourceOverviewText = cleanEngine6Description(
    payload.extracted.overviewText ?? ""
  );
  const highlights = payload.extracted.highlights ?? [];
  const itinerary =
    payload.extracted.itinerary?.map((item, index) => ({
      ...item,
      ...(item.description
        ? {
            description: rewriteItineraryDescriptionToSingleSentence({
              productCode: payload.rawProductCode,
              item,
              index,
            }),
          }
        : {}),
    })) ?? [];
  const itinerarySummaryText = payload.extracted.itinerarySummaryText ?? null;
  const faqs = payload.extracted.faqs ?? [];
  const included = payload.extracted.included ?? [];
  const requirements = payload.extracted.requirements ?? [];
  const categories = payload.extracted.categories ?? [];
  const primaryCategory =
    payload.extracted.primaryCategory ?? categories[0] ?? null;
  const categoryLabel = formatEngine6CategoryLabel(primaryCategory);
  const rawDescription =
    payload.extracted.overviewText ??
    payload.extracted.seoDescription ??
    `Explore ${title} with local guides in ${city}, ${state}.`;
  const cleanedDescription = cleanEngine6Description(rawDescription);
  const openingSentence = buildEngine6OpeningSentence({
    city,
    title,
    categoryLabel,
    productCode: payload.rawProductCode,
  });
  const enforcedOpeningSentence =
    ENGINE6_OPENING_SENTENCE_OVERRIDES[payload.rawProductCode] ??
    openingSentence;
  const descriptionBody = cleanedDescription.replace(/\s+/g, " ").trim();
  const description = [enforcedOpeningSentence, descriptionBody]
    .filter(Boolean)
    .join(" ");
  const metaDescription = buildEngine6MetaDescription(
    payload.extracted.seoDescription ?? description
  );
  const aggregateRating = normalizeEngine6AggregateRating(
    payload.extracted.aggregateRating
  );
  const bookingUrl = buildEngine6ViatorBookingUrl(
    payload.rawProductCode,
    payload.extracted.productUrl
  );
  const ctaOwner = "viator";
  const fallbackFieldNames = [
    !payload.extracted.title ? "title" : null,
    !payload.extracted.city ? "city" : null,
    !payload.extracted.state ? "state" : null,
    !payload.extracted.heroImageUrl ? "heroImageUrl" : null,
    !payload.extracted.priceFormatted ? "priceFormatted" : null,
    !payload.extracted.meetingPointText ? "meetingPointText" : null,
  ].filter((value): value is string => Boolean(value));

  const formattedStartingPrice = formatEngine6StartingPriceLabel(
    payload.extracted.priceAmount
  );
  const synthesizedOverview = buildAuthoritativeOverview({
    title,
    city,
    state,
    categoryLabel,
    durationText: payload.extracted.durationText ?? null,
    highlights,
    itinerary,
    meetingPointText: payload.extracted.meetingPointText ?? null,
    sourceOverview: sourceOverviewText,
  });
  const overriddenOverview = ENGINE6_OVERVIEW_OVERRIDES[payload.rawProductCode]?.({
    city,
    state,
    sourceOverview: sourceOverviewText,
  });
  const normalizedOverview =
    overriddenOverview || sourceOverviewText || synthesizedOverview;


  if (payload.rawProductCode === "335698P13") {
    const requiredReviewCount = 86;
    if (payload.extracted.reviewCount !== requiredReviewCount) {
      throw new Error(
        `Engine6 hard-fail: 335698P13 must render ${requiredReviewCount} reviews above the fold; received ${payload.extracted.reviewCount ?? "null"}`
      );
    }
  }

  return {
    productCode: payload.rawProductCode,
    title,
    seoTitle:
      payload.extracted.seoTitle ??
      buildEngine6SeoTitle({ title, city, state }),
    seoDescription: metaDescription,
    description,
    metaDescription,
    city,
    state,
    resolvedImageUrl: strictResolvedHero.url,
    heroImageUrl: strictResolvedHero.url,
    resolvedHero: strictResolvedHero,
    priceAmount: payload.extracted.priceAmount,
    priceFormatted: formattedStartingPrice,
    aggregateRating,
    reviewCount: payload.extracted.reviewCount,
    durationText: payload.extracted.durationText ?? null,
    meetingPointText:
      payload.extracted.meetingPointText ?? "See booking details",
    overviewText: normalizedOverview || null,
    highlights,
    itinerary,
    itinerarySummaryText,
    faqs,
    included,
    requirements,
    primaryCategory,
    categories,
    categoryLabel,
    pagePath: canonicalPath,
    canonicalPath,
    bookingUrl,
    ownership: {
      routeOwner: ctaOwner,
      ctaOwner,
      presentationOwner: "engine6",
      commercialOwner: "viator",
      commercialFallbackReason: "none",
    },
    diagnostics: {
      source: payload.source,
      commercialPriceFieldPath: payload.diagnostics.commercialPriceFieldPath,
      commercialPriceRawValue: payload.diagnostics.commercialPriceRawValue,
      priceSourceUsed: payload.diagnostics.priceSourceUsed,
      heroImageFieldPath: payload.diagnostics.heroImageFieldPath,
      heroVariantFieldPath: payload.diagnostics.heroVariantFieldPath,
      selectedHeroWidth: payload.diagnostics.selectedHeroWidth,
      selectedHeroHeight: payload.diagnostics.selectedHeroHeight,
      imageSourceUsed: payload.diagnostics.imageSourceUsed,
      heroSourceType: payload.diagnostics.heroSourceType,
      heroQualityClassification: payload.diagnostics.heroQualityClassification,
      finalHeroUrl: payload.diagnostics.finalHeroUrl,
      heroFallbackTriggered: payload.diagnostics.heroFallbackTriggered,
      heroCandidatesPresent: payload.diagnostics.heroCandidatesPresent,
      heroCandidateCount: payload.diagnostics.heroCandidateCount,
      heroCandidateCountBeforeFiltering:
        payload.diagnostics.heroCandidateCountBeforeFiltering,
      heroCandidateCountAfterFiltering:
        payload.diagnostics.heroCandidateCountAfterFiltering,
      heroPlaceholderFallbackReason:
        payload.diagnostics.heroPlaceholderFallbackReason,
      captionPrecedenceApplied: payload.diagnostics.captionPrecedenceApplied,
      candidateFamilyIdentityDeterminable:
        payload.diagnostics.candidateFamilyIdentityDeterminable,
      heroSurfaceParity: payload.diagnostics.heroSurfaceParity,
      rejectedForeignHeroCandidates:
        payload.diagnostics.rejectedForeignHeroCandidates,
      heroSourceProductCode: payload.diagnostics.heroSourceProductCode,
      heroSourceProductUrl: payload.diagnostics.heroSourceProductUrl,
      heroSourceFieldPath: payload.diagnostics.heroSourceFieldPath,
      heroHost: payload.diagnostics.heroHost,
      productUrlFieldPath: payload.diagnostics.productUrlFieldPath,
      bookingUrlSource:
        payload.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      ratingFieldPath: payload.diagnostics.ratingFieldPath,
      reviewCountFieldPath: payload.diagnostics.reviewCountFieldPath,
      overviewFieldPath: payload.diagnostics.overviewFieldPath,
      highlightsFieldPath: payload.diagnostics.highlightsFieldPath,
      meetingPointFieldPath: payload.diagnostics.meetingPointFieldPath,
      itineraryFieldPath: payload.diagnostics.itineraryFieldPath,
      itineraryItemCount: payload.diagnostics.itineraryItemCount,
      itinerarySourceUsed: payload.diagnostics.itinerarySourceUsed,
      itineraryStructuredSourceUsed:
        payload.diagnostics.itineraryStructuredSourceUsed,
      itineraryFallbackSummaryUsed:
        payload.diagnostics.itineraryFallbackSummaryUsed,
      itinerarySummaryFieldPath:
        payload.diagnostics.itinerarySummaryFieldPath ?? null,
      faqsFieldPath: payload.diagnostics.faqsFieldPath,
      faqFieldPath: payload.diagnostics.faqFieldPath,
      faqCount: payload.diagnostics.faqCount,
      faqSourceUsed: payload.diagnostics.faqSourceUsed,
      requirementsFieldPath: payload.diagnostics.requirementsFieldPath,
      highlightClassificationReason:
        payload.diagnostics.highlightClassificationReason,
      classificationFieldPath: payload.diagnostics.classificationFieldPath,
      fieldLevelFallbackUsed: fallbackFieldNames.length > 0,
      fallbackFieldNames,
    },
  };
};
