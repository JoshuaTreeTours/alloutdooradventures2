import CrossLinks from "../components/CrossLinks";
import ExperienceGrid from "../components/ExperienceGrid";
import FAQBlock from "../components/FAQBlock";
import Hero from "../components/Hero";
import IntroBlock from "../components/IntroBlock";
import LogisticsBlock from "../components/LogisticsBlock";
import WhyHereBlock from "../components/WhyHereBlock";

const LOCATION_DATA = {
  hero: {
    title: "Mammoth Lakes Adventures",
    subtitle:
      "Volcanic vistas, sapphire lakes, and high-alpine trails make this a Sierra favorite.",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    ctaLabel: "Browse Mammoth tours",
    ctaHref: "/tours?region=mammoth",
  },
  intro: {
    eyebrow: "Mammoth Lakes, California",
    heading: "A basecamp for lakeside hikes and summit days",
    description:
      "Start your mornings with alpine sunrises and end them in cozy mountain towns. Mammoth Lakes delivers waterfall walks, gondola rides, and rewarding day hikes all within a short drive.",
  },
  experiences: [
    {
      title: "Lakes Basin Paddle + Hike",
      description: "Combine a shoreline hike with a guided paddle on twin alpine lakes.",
      duration: "Half day",
    },
    {
      title: "Devils Postpile Explorer",
      description: "Visit basalt columns, rainbow falls, and hidden meadows with a guide.",
      duration: "Full day",
    },
    {
      title: "Sunset Summit Ride",
      description: "Take the gondola up for golden-hour views and a short ridge walk.",
      duration: "Evening",
    },
  ],
  reasons: [
    {
      title: "Lake-to-peak variety",
      description: "Easy lakeside loops plus challenging climbs all in one region.",
    },
    {
      title: "Adventure for every pace",
      description: "From scenic drives to multi-day hikes, build the right tempo.",
    },
    {
      title: "Local guides, local gear",
      description: "Outfitters handle rentals, permits, and tailored itineraries.",
    },
  ],
  logistics: [
    { label: "Best season", detail: "Late June through October for peak access." },
    { label: "Elevation", detail: "Most adventures sit between 7,800–10,000 feet." },
    { label: "Getting there", detail: "3.5–4.5 hours from Reno or Los Angeles." },
    { label: "Town vibe", detail: "Mountain village with cafés, breweries, and gear shops." },
  ],
  faqs: [
    {
      question: "Do I need to worry about altitude?",
      answer:
        "Plan for extra hydration and slower pacing on day one—most visitors acclimate quickly.",
    },
    {
      question: "Are there guided activities for beginners?",
      answer: "Yes, many lake and waterfall hikes are beginner-friendly.",
    },
    {
      question: "What should I bring?",
      answer:
        "Layers, sun protection, and a light rain shell are essentials for alpine weather swings.",
    },
  ],
  crossLinks: [
    {
      title: "June Lake Loop",
      description: "Quiet byways, turquoise waters, and scenic picnic stops.",
      href: "/destinations/lakes/june-lake",
    },
    {
      title: "Yosemite Valley",
      description: "A legendary icon just down the Tioga Road.",
      href: "/destinations/parks/yosemite",
    },
    {
      title: "Bishop & Owens Valley",
      description: "Hot springs, desert vistas, and bouldering heaven.",
      href: "/destinations/valleys/owens",
    },
  ],
};

export default function LocationPage() {
  return (
    <div className="bg-[#f6f1e8] text-[#1f2a1f]">
      <main>
        <Hero {...LOCATION_DATA.hero} />
        <IntroBlock {...LOCATION_DATA.intro} />
        <ExperienceGrid experiences={LOCATION_DATA.experiences} />
        <WhyHereBlock reasons={LOCATION_DATA.reasons} />
        <LogisticsBlock items={LOCATION_DATA.logistics} />
        <FAQBlock faqs={LOCATION_DATA.faqs} />
        <CrossLinks links={LOCATION_DATA.crossLinks} />
      </main>
    </div>
  );
}
