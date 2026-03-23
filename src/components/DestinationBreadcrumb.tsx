import React from "react";
import { Link } from "wouter";

type DestinationBreadcrumbProps = {
  state: string;
  city: string;
  title?: string | null;
  statePath: string;
  cityPath: string;
  className?: string;
};

export default function DestinationBreadcrumb({
  state,
  city,
  title,
  statePath,
  cityPath,
  className = "text-xs text-white/80",
}: DestinationBreadcrumbProps) {
  return (
    <nav aria-label="Destination breadcrumb" className={className}>
      <Link href="/destinations">
        <a className="underline-offset-4 hover:underline">Destinations</a>
      </Link>{" "}
      /{" "}
      <Link href={statePath}>
        <a className="underline-offset-4 hover:underline">{state}</a>
      </Link>{" "}
      /{" "}
      <Link href={cityPath}>
        <a className="underline-offset-4 hover:underline">{city}</a>
      </Link>
      {title ? (
        <>
          {" "}
          /{" "}
          <span aria-current="page" className="text-white">
            {title}
          </span>
        </>
      ) : null}
    </nav>
  );
}
