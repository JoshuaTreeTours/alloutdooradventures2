export type InternationalGuideCandidate = {
  country: string;
  countrySlug: string;
  cityName: string;
  citySlug: string;
  tourCount?: number;
  sourceLabel: string;
  guideUrl?: string;
  destinationUrl?: string;
};

export type InternationalGuideAuditMember = {
  cityName: string;
  citySlug: string;
  tourCount: number | null;
  sourceLabels: string[];
  guideUrls: string[];
  destinationUrls: string[];
};

export type InternationalGuideAuditCluster = {
  country: string;
  countrySlug: string;
  suspectedCanonicalDestination: string;
  duplicateVariantSlugs: string[];
  matchReasons: string[];
  members: InternationalGuideAuditMember[];
  recommendation: string;
};

export type InternationalGuideAuditReport = {
  generatedAt: string;
  totalCandidates: number;
  countriesScanned: number;
  clusters: InternationalGuideAuditCluster[];
};

type CandidateWithIndex = InternationalGuideCandidate & { index: number };

const SPECIAL_CHARACTER_REPLACEMENTS: Record<string, string> = {
  ß: "ss",
  æ: "ae",
  ǽ: "ae",
  ø: "o",
  œ: "oe",
  ð: "d",
  þ: "th",
  ł: "l",
  đ: "d",
};

const KNOWN_CITY_ALIAS_GROUPS: Array<{
  countrySlug: string;
  canonical: string;
  aliases: string[];
}> = [
  {
    countrySlug: "portugal",
    canonical: "lisbon",
    aliases: ["lisbon", "lisboa"],
  },
  {
    countrySlug: "austria",
    canonical: "vienna",
    aliases: ["vienna", "wien"],
  },
  {
    countrySlug: "germany",
    canonical: "munich",
    aliases: ["munich", "muenchen", "munchen", "münchen"],
  },
  {
    countrySlug: "netherlands",
    canonical: "the hague",
    aliases: ["the hague", "den haag", "s gravenhage", "'s-gravenhage"],
  },
  {
    countrySlug: "denmark",
    canonical: "copenhagen",
    aliases: ["copenhagen", "kobenhavn", "københavn", "koebenhavn"],
  },
];

export const normalizeDestinationName = (value: string): string => {
  const withCharacterFallbacks = value
    .toLowerCase()
    .replace(
      /[ßæǽøœðþłđ]/g,
      char => SPECIAL_CHARACTER_REPLACEMENTS[char] ?? char
    );

  return withCharacterFallbacks
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
};

export const normalizeSlugAsName = (value: string): string =>
  normalizeDestinationName(value.replace(/-/g, " "));

const aliasCanonicalByCountry = KNOWN_CITY_ALIAS_GROUPS.reduce<
  Map<string, Map<string, string>>
>((countries, group) => {
  const countryAliases =
    countries.get(group.countrySlug) ?? new Map<string, string>();
  const canonicalKey = normalizeDestinationName(group.canonical);
  group.aliases.forEach(alias => {
    countryAliases.set(normalizeDestinationName(alias), canonicalKey);
  });
  countries.set(group.countrySlug, countryAliases);
  return countries;
}, new Map());

const getAliasCanonicalKey = (countrySlug: string, value: string) =>
  aliasCanonicalByCountry
    .get(countrySlug)
    ?.get(normalizeDestinationName(value)) ?? null;

const getComparisonKeys = (
  candidate: InternationalGuideCandidate
): string[] => {
  const rawKeys = [
    `name:${normalizeDestinationName(candidate.cityName)}`,
    `slug:${normalizeSlugAsName(candidate.citySlug)}`,
  ];
  const aliasKeys = [candidate.cityName, candidate.citySlug]
    .map(value => getAliasCanonicalKey(candidate.countrySlug, value))
    .filter((value): value is string => Boolean(value))
    .map(value => `alias:${value}`);

  return Array.from(new Set([...rawKeys, ...aliasKeys]));
};

const getMatchReason = (
  countrySlug: string,
  left: InternationalGuideCandidate,
  right: InternationalGuideCandidate
) => {
  const leftNameKey = normalizeDestinationName(left.cityName);
  const rightNameKey = normalizeDestinationName(right.cityName);
  if (leftNameKey === rightNameKey) {
    return "name match after lowercase/diacritic/punctuation/whitespace normalization";
  }

  const leftSlugKey = normalizeSlugAsName(left.citySlug);
  const rightSlugKey = normalizeSlugAsName(right.citySlug);
  if (leftSlugKey === rightSlugKey) {
    return "slug match after punctuation/diacritic normalization";
  }

  const leftAlias =
    getAliasCanonicalKey(countrySlug, left.cityName) ??
    getAliasCanonicalKey(countrySlug, left.citySlug);
  const rightAlias =
    getAliasCanonicalKey(countrySlug, right.cityName) ??
    getAliasCanonicalKey(countrySlug, right.citySlug);
  if (leftAlias && rightAlias && leftAlias === rightAlias) {
    return "known native-language/English alias pair";
  }

  return "shared conservative comparison key";
};

class DisjointSet {
  private parents: number[];

  constructor(size: number) {
    this.parents = Array.from({ length: size }, (_, index) => index);
  }

  find(index: number): number {
    const parent = this.parents[index];
    if (parent === index) {
      return index;
    }
    const root = this.find(parent);
    this.parents[index] = root;
    return root;
  }

  union(left: number, right: number) {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) {
      this.parents[rightRoot] = leftRoot;
    }
  }
}

const mergeExactCandidates = (
  candidates: InternationalGuideCandidate[]
): CandidateWithIndex[] => {
  const byRoute = new Map<
    string,
    InternationalGuideCandidate & { sourceLabels: Set<string> }
  >();

  candidates.forEach(candidate => {
    const key = `${candidate.countrySlug}/${candidate.citySlug}`;
    const existing = byRoute.get(key);
    if (existing) {
      existing.tourCount =
        (existing.tourCount ?? 0) + (candidate.tourCount ?? 0);
      existing.sourceLabels.add(candidate.sourceLabel);
      if (
        candidate.cityName &&
        candidate.cityName.length > existing.cityName.length
      ) {
        existing.cityName = candidate.cityName;
      }
      return;
    }

    byRoute.set(key, {
      ...candidate,
      sourceLabels: new Set([candidate.sourceLabel]),
    });
  });

  return Array.from(byRoute.values()).map((candidate, index) => ({
    ...candidate,
    sourceLabel: Array.from(candidate.sourceLabels).sort().join(", "),
    index,
  }));
};

export const buildInternationalGuideCanonicalizationAudit = (
  candidates: InternationalGuideCandidate[],
  generatedAt = new Date().toISOString()
): InternationalGuideAuditReport => {
  const mergedCandidates = mergeExactCandidates(candidates);
  const byCountry = new Map<string, CandidateWithIndex[]>();

  mergedCandidates.forEach(candidate => {
    const countryCandidates = byCountry.get(candidate.countrySlug) ?? [];
    countryCandidates.push(candidate);
    byCountry.set(candidate.countrySlug, countryCandidates);
  });

  const clusters: InternationalGuideAuditCluster[] = [];

  byCountry.forEach(countryCandidates => {
    const dsu = new DisjointSet(countryCandidates.length);
    const candidatesByKey = new Map<string, number[]>();

    countryCandidates.forEach((candidate, countryIndex) => {
      getComparisonKeys(candidate).forEach(key => {
        const matches = candidatesByKey.get(key) ?? [];
        matches.forEach(matchIndex => dsu.union(countryIndex, matchIndex));
        matches.push(countryIndex);
        candidatesByKey.set(key, matches);
      });
    });

    const grouped = new Map<number, CandidateWithIndex[]>();
    countryCandidates.forEach((candidate, countryIndex) => {
      const root = dsu.find(countryIndex);
      grouped.set(root, [...(grouped.get(root) ?? []), candidate]);
    });

    grouped.forEach(members => {
      if (members.length < 2) {
        return;
      }

      const matchReasons = new Set<string>();
      members.forEach((left, leftIndex) => {
        members.slice(leftIndex + 1).forEach(right => {
          matchReasons.add(getMatchReason(left.countrySlug, left, right));
        });
      });

      const canonical = [...members].sort((a, b) => {
        const tourDelta = (b.tourCount ?? 0) - (a.tourCount ?? 0);
        if (tourDelta !== 0) {
          return tourDelta;
        }
        return a.cityName.localeCompare(b.cityName);
      })[0];

      clusters.push({
        country: canonical.country,
        countrySlug: canonical.countrySlug,
        suspectedCanonicalDestination: canonical.cityName,
        duplicateVariantSlugs: members.map(member => member.citySlug).sort(),
        matchReasons: Array.from(matchReasons).sort(),
        members: members
          .map(member => ({
            cityName: member.cityName,
            citySlug: member.citySlug,
            tourCount: member.tourCount ?? null,
            sourceLabels: member.sourceLabel.split(", "),
            guideUrls: member.guideUrl ? [member.guideUrl] : [],
            destinationUrls: member.destinationUrl
              ? [member.destinationUrl]
              : [],
          }))
          .sort((a, b) => a.cityName.localeCompare(b.cityName)),
        recommendation:
          "Review this cluster before expanding inventory; no redirect, canonical, sitemap, route, breadcrumb, or guide-generation change was made by this audit.",
      });
    });
  });

  return {
    generatedAt,
    totalCandidates: mergedCandidates.length,
    countriesScanned: byCountry.size,
    clusters: clusters.sort(
      (a, b) =>
        a.country.localeCompare(b.country) ||
        a.suspectedCanonicalDestination.localeCompare(
          b.suspectedCanonicalDestination
        )
    ),
  };
};
