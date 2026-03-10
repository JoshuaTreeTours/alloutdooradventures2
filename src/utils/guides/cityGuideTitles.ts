import {
  buildGuideH1,
  buildGuideSeoTitle,
} from "../../lib/seo/titleBuilder";

export const buildCityGuideDisplayTitle = (city: string) => buildGuideH1({ city });

export const buildCityGuideMetaTitle = (city: string) => buildGuideSeoTitle({ city });

export const buildCityGuideH1 = (city: string) => buildGuideH1({ city });

export const buildCityGuideIntroParagraphs = (city: string) => ({
  primary: `Planning a trip to ${city}? This 2026 guide covers the top 10 things to do, from iconic outdoor experiences to local attractions worth adding to your itinerary.`,
  secondary: `Use this list to compare highlights, discover what makes ${city} unique, and find tours that match your travel style.`,
});
