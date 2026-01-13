import fs from "node:fs";
import path from "node:path";

import { featuredDestinations, states } from "../src/data/destinations";

type ImageReference = {
  label: string;
  src: string;
};

const imageReferences: ImageReference[] = [];

const addReference = (label: string, src: string | undefined) => {
  if (!src) {
    return;
  }
  imageReferences.push({ label, src: src.trim() });
};

featuredDestinations.forEach((destination) => {
  addReference(`featured destination: ${destination.name}`, destination.image);
});

states.forEach((state) => {
  addReference(`state hero: ${state.name}`, state.heroImage);
  state.cities.forEach((city) => {
    city.heroImages.forEach((image, index) => {
      addReference(`city hero: ${city.name} (${index + 1})`, image);
    });
  });
});

const publicDir = path.join(process.cwd(), "public");
const missingFiles: ImageReference[] = [];
const nonAbsolutePaths: ImageReference[] = [];

imageReferences.forEach((reference) => {
  const src = reference.src;
  if (!src) {
    return;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return;
  }

  if (!src.startsWith("/")) {
    nonAbsolutePaths.push(reference);
    return;
  }

  const filePath = path.join(publicDir, src);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(reference);
  }
});

if (nonAbsolutePaths.length > 0 || missingFiles.length > 0) {
  const messages: string[] = [];

  if (nonAbsolutePaths.length > 0) {
    messages.push(
      `Non-absolute image paths:\n${nonAbsolutePaths
        .map((reference) => `- ${reference.label}: ${reference.src}`)
        .join("\n")}`,
    );
  }

  if (missingFiles.length > 0) {
    messages.push(
      `Missing local image files:\n${missingFiles
        .map((reference) => `- ${reference.label}: ${reference.src}`)
        .join("\n")}`,
    );
  }

  throw new Error(messages.join("\n\n"));
}

const localImageCount = imageReferences.filter((reference) =>
  reference.src.startsWith("/"),
).length;

console.log(
  `Validated ${imageReferences.length} image references (${localImageCount} local).`,
);
