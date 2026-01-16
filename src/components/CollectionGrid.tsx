import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

import Image from "./Image";

type CollectionItem = {
  title: string;
  description: string;
  image: string;
  href: string;
  badge?: string;
};

type CollectionGridProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: CollectionItem[];
};

export default function CollectionGrid({
  eyebrow,
  title,
  description,
  items,
}: CollectionGridProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#7a8a6b]">
          {eyebrow}
        </span>
        <h2 className="mt-3 text-2xl font-semibold text-[#2f4a2f] md:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#405040] md:text-base">
          {description}
        </p>
      </div>
      <div
        ref={sectionRef}
        className={`mt-10 grid gap-6 transition-all duration-[250ms] ease-out md:grid-cols-3 ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link key={item.title} href={item.href}>
            <a className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-48">
                <Image
                  src={item.image}
                  fallbackSrc="/hero.jpg"
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                {item.badge ? (
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-base font-semibold text-[#1f2a1f]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#405040] leading-relaxed">
                  {item.description}
                </p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-[0.2em] text-[#2f4a2f]">
                  Explore collection →
                </span>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}
