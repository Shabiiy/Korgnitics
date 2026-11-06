"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { campusLifeContent } from "@/content/campusLife";
import { TagChip } from "@/components/ui/TagChip";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function CampusLife() {
  const containerRef = useRef<HTMLElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string>("learning-spaces");
  const [activeFilter, setActiveFilter] = useState("Clubs & Societies");
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !cardsContainerRef.current) return;

    // Clip-path reveals from bottom (inset(100% 0 0 0) -> inset(0)) with inner scale 1.2 -> 1
    const cardElements = cardsContainerRef.current.querySelectorAll(".campus-card-reveal");

    cardElements.forEach((card) => {
      const img = card.querySelector(".campus-card-img");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        card,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.0,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
        0
      );

      if (img) {
        tl.fromTo(
          img,
          { scale: 1.2 },
          {
            scale: 1.0,
            duration: 1.2,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
          0
        );
      }
    });
  }, [prefersReducedMotion]);

  return (
    <section id="campus-life" ref={containerRef} className="py-20 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <TagChip variant="cream" className="mb-4">
            {campusLifeContent.sectionTag}
          </TagChip>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-indigo-deep">
            {campusLifeContent.headingPart1}{" "}
            <span className="headline-accent text-yellow-golden font-serif italic">
              {campusLifeContent.headingAccentLetter}
            </span>
            {campusLifeContent.headingPart2}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="max-w-md text-sm text-muted-text font-sans leading-relaxed">
            {campusLifeContent.intro}
          </p>

          {/* Interactive filter toggle pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-yellow-surface border border-yellow-border">
            {campusLifeContent.buttons.map((btn) => {
              const isSelected = activeFilter === btn.label;
              return (
                <button
                  key={btn.label}
                  onClick={() => setActiveFilter(btn.label)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-yellow-golden text-indigo-deep shadow-sm"
                      : "text-indigo-deep/70 hover:text-indigo-deep"
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campus Photo Cards Container */}
      {/* Desktop: Flex accordion (hover flex: 1 -> 2). Mobile: Vertical tap accordion */}
      <div
        ref={cardsContainerRef}
        className="hidden lg:flex gap-4 h-[520px] transition-all duration-500"
      >
        {campusLifeContent.spaces.map((space) => {
          const isExpanded = hoveredCardId === space.id;

          return (
            <div
              key={space.id}
              onMouseEnter={() => setHoveredCardId(space.id)}
              className={`campus-card-reveal relative rounded-kcard overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border border-yellow-border/60 shadow-lg cursor-pointer ${
                isExpanded ? "flex-[2.2]" : "flex-[1]"
              }`}
            >
              {/* Image */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <Image
                  src={space.imageSrc}
                  alt={space.imageAlt}
                  fill
                  className="campus-card-img object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-deep via-indigo-deep/40 to-transparent" />
              </div>

              {/* Card Content Overlay */}
              <div className="h-full flex flex-col justify-between p-8 text-white relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-sans px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                    Mysuru Campus
                  </span>
                  <div
                    className={`w-9 h-9 rounded-kbtn flex items-center justify-center transition-all ${
                      isExpanded
                        ? "bg-yellow-golden text-indigo-deep rotate-45"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-white mb-2">
                    {space.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-light-text/80 leading-relaxed font-sans line-clamp-2 mb-4">
                    {space.subtitle}
                  </p>

                  {/* Chips that fade in when expanded */}
                  <div
                    className={`flex flex-wrap gap-2 transition-opacity duration-300 ${
                      isExpanded ? "opacity-100 max-h-24" : "opacity-0 max-h-0 overflow-hidden"
                    }`}
                  >
                    {space.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="text-xs px-2.5 py-1 rounded-ktag bg-white/20 backdrop-blur-md text-white font-sans"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Accordion View (<1024px) */}
      <div className="lg:hidden flex flex-col gap-4">
        {campusLifeContent.spaces.map((space) => {
          const isExpanded = hoveredCardId === space.id;

          return (
            <div
              key={space.id}
              onClick={() => setHoveredCardId(isExpanded ? "" : space.id)}
              className="relative rounded-kcard overflow-hidden border border-yellow-border shadow-md"
            >
              <div className="relative h-64 sm:h-72 w-full">
                <Image
                  src={space.imageSrc}
                  alt={space.imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-deep via-indigo-deep/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-sans px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                      Mysuru Campus
                    </span>
                    <div className="w-8 h-8 rounded-kbtn bg-yellow-golden text-indigo-deep flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-sans font-light tracking-tight text-white mb-1">
                      {space.title}
                    </h3>
                    <p className="text-xs text-light-text/85 mb-3">{space.subtitle}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {space.facilities.map((facility) => (
                        <span
                          key={facility}
                          className="text-[11px] px-2 py-0.5 rounded-ktag bg-white/20 text-white"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

