type FAQItem = {
  question: string;
  answer: string;
};

type FAQBlockProps = {
  heading?: string;
  faqs?: FAQItem[];
};

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "Do I need a guide for day hikes?",
    answer: "Most trails are well-marked, but guided trips add safety and local insight.",
  },
  {
    question: "What should I pack?",
    answer: "Layers, a refillable water bottle, sun protection, and sturdy shoes.",
  },
  {
    question: "Are tours family-friendly?",
    answer: "Yes—look for our easy or moderate difficulty options for kids.",
  },
];

export default function FAQBlock({
  heading = "Frequently asked questions",
  faqs = DEFAULT_FAQS,
}: FAQBlockProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16" aria-label="FAQ">
      <h2 className="text-2xl md:text-3xl font-semibold text-[#2f4a2f] text-center">
        {heading}
      </h2>
      <div className="mt-10 space-y-6">
        {faqs.map((faq) => (
          <div
            key={faq.question}
            className="rounded-lg border border-black/10 bg-[#f7f3ea] p-6"
          >
            <h3 className="text-base font-semibold text-[#1f2a1f]">
              {faq.question}
            </h3>
            <p className="mt-2 text-sm text-[#405040] leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
