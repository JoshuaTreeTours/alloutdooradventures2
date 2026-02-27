import generatedTourImagesRaw from "../../data/generatedImages/tourImages.json";

export type GeneratedTourImageEntry = {
  heroUrl: string;
  bottomUrl?: string;
  prompts?: {
    heroPrompt: string;
    bottomPrompt: string;
  };
  generatedAt?: string;
};

const generatedTourImages =
  (generatedTourImagesRaw as Record<string, GeneratedTourImageEntry>) ?? {};

export const getGeneratedTourImageEntry = (tourId: string) =>
  generatedTourImages[tourId];
