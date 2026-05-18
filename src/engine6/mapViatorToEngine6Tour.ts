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
};
const ENGINE6_OVERVIEW_OVERRIDES: Record<
  string,
  (args: { city: string; state: string; sourceOverview: string }) => string
> = {
  "6740JTREE": () =>
    "Experience Joshua Tree National Park from the open air aboard a custom Hummer built for desert touring. This guided small-group adventure travels from the Greater Palm Springs area into one of California’s most iconic national parks, where dramatic rock formations, Joshua tree forests, rugged desert valleys, and wide Mojave views define the landscape. With pickup and departure options available from Palm Desert, Palm Springs, and Yucca Valley, the tour is designed for convenient access from across the Coachella Valley and High Desert. Along the way, your guide shares insight into the park’s geology, desert ecology, wildlife, and cultural history while making time for scenic viewpoints and photo stops, including highlights such as Joshua Tree National Park, Keys View, Barker Dam Trail, and Cap Rock Trail. The open-air Hummer format gives guests a more immersive way to experience the desert than a traditional bus or enclosed vehicle, with elevated views, fresh desert air, and a close connection to the terrain throughout the journey.",
  "2335P1": () =>
    "Explore one of the Coachella Valley’s defining geologic landscapes on this guided off-road Jeep tour into the San Andreas Fault zone near Palm Springs. The route travels through desert canyons and washes shaped by active tectonic forces, where your naturalist guide interprets fault movement, earthquake geology, and the landforms that reveal how the valley evolved over time. Along the way, you experience rugged terrain and wide desert vistas while learning how climate, erosion, and plate dynamics interact across this section of Southern California. Designed as a destination-first geology adventure rather than a standard city sightseeing loop, this small-group experience combines outdoor exploration with clear scientific context in one of the region’s most consequential fault environments.",
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
  const sourceSnippet = stripMarketingLanguage(sourceOverview)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ")
    .trim();

  const opening = toSentence(
    `${title} is a ${activityLabel} in ${normalizedLocation} focused on efficient access to key sights and local context`
  );
  const middleA = toSentence(
    [
      highlightText
        ? `Expect a route that covers ${highlightText}`
        : "The experience combines signature landmarks with practical local insights",
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
    "It is best for first-time visitors, time-conscious travelers, and small groups that want clear pacing without sacrificing major highlights"
  );

  const parts = [opening, middleA, logistics, sourceSnippet, closer].filter(
    Boolean
  );
  const withLimit = () => {
    const limited: string[] = [];
    for (const part of parts) {
      const next = [...limited, part].join(" ");
      if (countWords(next) > 120) break;
      limited.push(part);
    }
    return limited.join(" ");
  };

  let summary = withLimit();
  if (countWords(summary) < 90) {
    const expansion = toSentence(
      `This ${city} tour is designed for travelers who want reliable logistics and substantive interpretation at each phase of the outing`
    );
    const expanded = `${summary} ${expansion}`.trim();
    summary = countWords(expanded) <= 120 ? expanded : summary;
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
  const overviewText = buildAuthoritativeOverview({
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
  const normalizedOverview =
    ENGINE6_OVERVIEW_OVERRIDES[payload.rawProductCode]?.({
      city,
      state,
      sourceOverview: sourceOverviewText,
    }) ?? overviewText;

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
