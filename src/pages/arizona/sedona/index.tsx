import React from "react";
import data from "../../../data/generated/arizona.sedona.tours.json";

export default function CityToursIndex() {
  const tours = data.tours || [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Sedona Tours</h1>
      <p className="mt-3 opacity-90">
        Hand-picked experiences in Sedona, Arizona.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tours.map((tour) => (
          <a
            key={tour.id}
            className="rounded-2xl border p-5 hover:shadow-sm"
            href={"/arizona/sedona/" + tour.slug}
          >
            <div className="font-semibold">{tour.title}</div>
            <div className="mt-1 text-sm opacity-80">
              {tour.shortDescription || "Explore with a top-rated local experience."}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
