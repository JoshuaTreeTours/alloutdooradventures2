import { Link } from "wouter";

type SeeAllToursBubbleProps = {
  cityName?: string;
  citySlug?: string;
  stateSlug?: string;
};

const titleCaseSlug = (value?: string) => {
  if (!value) return "";

  return value
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const buildToursHref = ({ stateSlug, citySlug }: SeeAllToursBubbleProps) => {
  if (stateSlug && citySlug) {
    return `/tours?state=${stateSlug}&city=${citySlug}`;
  }

  if (stateSlug) {
    return `/tours?state=${stateSlug}`;
  }

  return "/tours";
};

export default function SeeAllToursBubble({
  cityName,
  citySlug,
  stateSlug,
}: SeeAllToursBubbleProps) {
  const resolvedCityName = cityName?.trim() || titleCaseSlug(citySlug);
  const href = buildToursHref({ citySlug, stateSlug });
  const label = resolvedCityName
    ? `See all ${resolvedCityName} tours`
    : "See all tours";

  return (
    <div className="mt-6 flex justify-center">
      <Link href={href}>
        <a
          aria-label={label}
          className="inline-flex items-center rounded-full border border-[#2f4a2f]/20 bg-[#f6f1e8] px-5 py-2 text-sm font-semibold text-[#2f4a2f] shadow-sm transition hover:bg-[#efe7d8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f4a2f] focus-visible:ring-offset-2"
        >
          {label}
        </a>
      </Link>
    </div>
  );
}
