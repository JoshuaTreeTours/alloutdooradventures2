type GuideCardProps = {
  item: {
    title: string;
    description: string;
  };
  index: number;
  learnMoreUrl: string;
  anchorId?: string;
};

export default function GuideCard({ item, index, learnMoreUrl, anchorId }: GuideCardProps) {
  return (
    <li id={anchorId} className="rounded-2xl border border-black/10 bg-white p-4 md:p-5">
      <p className="font-semibold text-[#1f2a1f]">
        {index + 1}. {item.title}
      </p>
      <p className="mt-2 text-sm leading-7 text-[#405040] md:text-base">
        {item.description}
      </p>
      <a
        href={learnMoreUrl}
        target={learnMoreUrl.startsWith("http") ? "_blank" : undefined}
        rel={learnMoreUrl.startsWith("http") ? "nofollow noopener noreferrer" : undefined}
        className="mt-3 inline-block text-sm font-medium text-[#1f2a1f] underline"
      >
        Learn more
      </a>
    </li>
  );
}
