import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";

import CityTourBookingRoute from "../src/pages/destinations/states/tours/CityTourBookingRoute";
import FlagstaffTourBookingRoute from "../src/pages/tours/FlagstaffTourBookingRoute";
import { flagstaffTours } from "../src/data/flagstaffTours";
import { tours } from "../src/data/tours";

const fareharborTours = tours.filter(
  tour => tour.bookingProvider === "fareharbor"
);

const cityTours = fareharborTours
  .filter(tour => tour.destination.stateSlug && tour.destination.citySlug)
  .slice(0, 6);
const flagstaffSample = flagstaffTours.slice(0, 4);

const bookingCases = [
  ...cityTours.map(tour => ({
    path: `/destinations/${tour.destination.stateSlug}/${tour.destination.citySlug}/tours/${tour.slug}/book`,
    type: "city" as const,
    params: {
      stateSlug: tour.destination.stateSlug,
      citySlug: tour.destination.citySlug,
      tourSlug: tour.slug,
    },
  })),
  ...flagstaffSample.map(tour => ({
    path: `/tours/${tour.slug}/book`,
    type: "flagstaff" as const,
    params: {
      tourSlug: tour.slug,
    },
  })),
];

const uniqueCases = Array.from(
  new Map(bookingCases.map(caseData => [caseData.path, caseData])).values()
).slice(0, 10);

if (uniqueCases.length < 5) {
  throw new Error(
    `Expected at least 5 booking paths, found ${uniqueCases.length}.`
  );
}

const failures: string[] = [];

for (const bookingCase of uniqueCases) {
  if (bookingCase.path === "/") {
    failures.push(`${bookingCase.path} resolved to /`);
    continue;
  }

  const hook = () => {
    const [location] = React.useState(bookingCase.path);
    const navigate = () => undefined;
    return [location, navigate] as const;
  };
  const element =
    bookingCase.type === "flagstaff" ? (
      <FlagstaffTourBookingRoute params={bookingCase.params} />
    ) : (
      <CityTourBookingRoute params={bookingCase.params} />
    );
  const html = renderToStaticMarkup(<Router hook={hook}>{element}</Router>);

  if (!html.includes("<iframe")) {
    failures.push(`${bookingCase.path} did not render an iframe`);
    continue;
  }

  if (!html.includes("fareharbor.com/embeds/book/")) {
    failures.push(
      `${bookingCase.path} iframe missing FareHarbor embed URL`
    );
  }
}

if (failures.length) {
  console.error("Booking smoke test failed:");
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `Booking smoke test passed for ${uniqueCases.length} booking pages.`
);
