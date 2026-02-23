import { useEffect, useMemo, useState } from "react";

import type { Tour } from "../data/tours.types";
import { getFareharborItemFromUrl, normalizeFareharborUrl } from "./fareharbor";

const PILOT_FLAG = "ENABLE_FH_CONTENT_PILOT_PALM_SPRINGS";

type FareHarborExtract = {
  title?: string;
  description?: string;
  highlights?: string[];
  duration?: string;
  meetingLocation?: string;
  pickupDetails?: string;
  whatsIncluded?: string[];
  requirements?: string[];
  difficultyNotes?: string;
  ageRestrictions?: string;
  equipmentProvided?: string[];
  cancellationInfo?: string;
};

export type PalmSpringsTourContent = {
  quickFacts: {
    duration?: string;
    location?: string;
    startingPrice?: string;
    pickupAvailability?: string;
  };
  whatYoullExperience: string;
  highlights: string[];
  whoItsFor: string[];
  meetingPickupSummary?: string;
  whatsIncluded: string[];
  notIncluded: string[];
  faqCandidates: Array<{ question: string; answer: string }>;
};

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const extractMeta = (html: string, name: string) => {
  const match = html.match(
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)`, "i")
  );
  return match?.[1] ? stripHtml(match[1]) : undefined;
};

const splitSentences = (text: string | undefined, max = 3) => {
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .slice(0, max);
};

const fetchCache = new Map<string, Promise<FareHarborExtract | null>>();

export const isPalmSpringsPilotEnabled = () =>
  process.env[PILOT_FLAG] === "true";

export const isPalmSpringsTour = (tour: Tour | null, pathname?: string) =>
  Boolean(
    tour &&
    (tour.destination.citySlug === "palm-springs" ||
      pathname?.includes("/palm-springs/"))
  );

const parseFareHarborHtml = (html: string): FareHarborExtract => {
  const title = extractMeta(html, "twitter:title");
  const description =
    extractMeta(html, "description") ??
    extractMeta(html, "twitter:description");

  const infoChunks =
    html
      .match(/<li[^>]*>(.*?)<\/li>/gis)
      ?.map(chunk => stripHtml(chunk))
      .filter(Boolean) ?? [];
  const highlights = infoChunks.filter(chunk => chunk.length > 20).slice(0, 6);

  const duration = html.match(/Duration\s*[:\-]\s*([^<\n]+)/i)?.[1]?.trim();
  const meetingLocation = html
    .match(/Meeting(?:\s+Location)?\s*[:\-]\s*([^<\n]+)/i)?.[1]
    ?.trim();
  const pickupDetails = html.match(/Pickup\s*[:\-]\s*([^<\n]+)/i)?.[1]?.trim();
  const cancellationInfo = html
    .match(/Cancellation\s*[:\-]\s*([^<\n]+)/i)?.[1]
    ?.trim();

  return {
    title,
    description,
    highlights,
    duration,
    meetingLocation,
    pickupDetails,
    cancellationInfo,
  };
};

export const fetchFareHarborExtract = async (url: string) => {
  if (!url) return null;

  const normalizedUrl = normalizeFareharborUrl(url) ?? url;
  if (fetchCache.has(normalizedUrl)) {
    return fetchCache.get(normalizedUrl) ?? null;
  }

  const request = fetch(normalizedUrl)
    .then(async response => {
      if (!response.ok) {
        return null;
      }
      const html = await response.text();
      return parseFareHarborHtml(html);
    })
    .catch(() => null);

  fetchCache.set(normalizedUrl, request);
  return request;
};

const toExperienceText = (tour: Tour, source?: FareHarborExtract | null) => {
  const sentences = splitSentences(source?.description).filter(sentence => {
    const normalized = sentence.toLowerCase();
    return (
      !normalized.includes("book now") && !normalized.includes("fareharbor")
    );
  });

  if (sentences.length >= 2) {
    return sentences.join(" ");
  }

  const location = `${tour.destination.city}, ${tour.destination.state}`;
  return `${tour.title} is built for travelers who want a clear plan and more time on the trail in ${location}. You can expect guided pacing, practical local context, and an itinerary focused on the strongest scenery for this part of the desert.`;
};

export const buildPalmSpringsTourContent = (
  tour: Tour,
  startingPriceLabel: string | null,
  source?: FareHarborExtract | null
): PalmSpringsTourContent => {
  const experienceText = toExperienceText(tour, source);
  const locationLabel =
    source?.meetingLocation ??
    `${tour.destination.city}, ${tour.destination.state}`;
  const highlights = (
    source?.highlights?.length
      ? source.highlights
      : splitSentences(source?.description ?? tour.longDescription, 4)
  ).slice(0, 6);

  const pickupSummary =
    source?.pickupDetails ??
    "Check the booking page for exact pickup zones and timing.";

  const whoItsFor = [
    "Travelers who want a guided outing with route logistics handled.",
    "Visitors looking for a manageable pace with photo stops.",
    source?.difficultyNotes ??
      "Best for guests comfortable with light to moderate outdoor activity.",
  ];

  const whatsIncluded = source?.whatsIncluded?.length
    ? source.whatsIncluded
    : [
        "Professional guide service for the full tour window.",
        "Transportation or route logistics as listed at booking.",
      ];

  const notIncluded = [
    "Guide gratuity.",
    "Personal snacks and additional purchases.",
  ];

  const faqCandidates = [
    {
      question: "Where does this tour meet?",
      answer: source?.meetingLocation
        ? `Meeting is typically arranged at ${source.meetingLocation}. Confirm your exact check-in point after booking.`
        : "The exact check-in point is confirmed on your booking confirmation.",
    },
    {
      question: "Is pickup available?",
      answer: pickupSummary,
    },
  ];

  return {
    quickFacts: {
      duration: source?.duration ?? tour.badges.duration,
      location: locationLabel,
      startingPrice: startingPriceLabel ?? "$129",
      pickupAvailability: pickupSummary,
    },
    whatYoullExperience: experienceText,
    highlights,
    whoItsFor,
    meetingPickupSummary: `${locationLabel}. ${pickupSummary}`,
    whatsIncluded,
    notIncluded,
    faqCandidates,
  };
};

export const usePalmSpringsFareHarborContent = (
  tour: Tour | null,
  bookingUrl: string,
  startingPriceLabel: string | null
) => {
  const [source, setSource] = useState<FareHarborExtract | null>(null);

  const shouldEnrich =
    isPalmSpringsPilotEnabled() &&
    isPalmSpringsTour(tour) &&
    Boolean(getFareharborItemFromUrl(bookingUrl));

  useEffect(() => {
    if (!shouldEnrich) {
      return;
    }

    let isCancelled = false;
    fetchFareHarborExtract(bookingUrl).then(result => {
      if (!isCancelled && result) {
        setSource(result);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [bookingUrl, shouldEnrich]);

  const content = useMemo(
    () =>
      tour
        ? buildPalmSpringsTourContent(tour, startingPriceLabel, source)
        : null,
    [source, startingPriceLabel, tour]
  );

  return { shouldEnrich, content };
};
