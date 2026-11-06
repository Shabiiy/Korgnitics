"use client";

import React, { useEffect, useRef } from "react";
import { lifeSkillsContent } from "@/content/lifeSkills";
import { TagChip } from "@/components/ui/TagChip";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function LifeSkills() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headerLeftRef = useRef<HTMLDivElement | null>(null);
  const headerRightRef = useRef<HTMLParagraphElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    // Header reveal from Left & Right
    if (headerLeftRef.current && headerRightRef.current) {
      gsap.fromTo(
        headerLeftRef.current,
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerLeftRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        headerRightRef.current,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRightRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    if (gridRef.current) {
      const cards = Array.from(gridRef.current.children);

      cards.forEach((card, idx) => {
        // Alternating directional offset (Left, Center, Right)
        const col = idx % 3;
        const xOffset = col === 0 ? -40 : col === 2 ? 40 : 0;

        gsap.fromTo(
          card,
          { x: xOffset, y: 35, opacity: 0, scale: 0.95 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            delay: idx * 0.08,
            ease: "cubic-bezier(0.22, 1, 0.36, 1)",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }
  }, [prefersReducedMotion]);

  return (
    <section id="life-skills" ref={containerRef} className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header with Left/Right Entrance */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div ref={headerLeftRef}>
          <TagChip variant="cream" className="mb-4">
            {lifeSkillsContent.sectionTag}
          </TagChip>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-indigo-deep">
            {lifeSkillsContent.headingPart1}{" "}
            <span className="block sm:inline">
              {lifeSkillsContent.headingPart2}{" "}
              <span className="headline-accent text-yellow-golden font-serif italic">
                {lifeSkillsContent.headingAccentLetter}
              </span>
              {lifeSkillsContent.headingPart3}
            </span>
          </h2>
        </div>

        <p
          ref={headerRightRef}
          className="max-w-md text-sm sm:text-base text-muted-text font-sans leading-relaxed"
        >
          {lifeSkillsContent.subtext}
        </p>
      </div>

      {/* 3-Column Grid of 6 Alternating Cards */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lifeSkillsContent.cards.map((card) => {
          const isIndigo = card.theme === "indigo";

          return (
            <div
              key={card.id}
              className={`group relative rounded-kcard p-6 sm:p-8 flex flex-col justify-between border shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-xl ${
                isIndigo
                  ? "bg-indigo-deep text-light-text border-indigo"
                  : "bg-yellow-surface text-indigo-deep border-yellow-border"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={`text-xs font-sans font-semibold tracking-wider uppercase ${
                      isIndigo ? "text-yellow-golden" : "text-indigo-deep/70"
                    }`}
                  >
                    {card.number}
                  </span>

                  {/* Corner arrow square that slides and rotates on hover */}
                  <div
                    className={`w-8 h-8 rounded-kbtn flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 ${
                      isIndigo
                        ? "bg-white/10 text-yellow-golden group-hover:bg-yellow-golden group-hover:text-indigo-deep"
                        : "bg-indigo-deep/10 text-indigo-deep group-hover:bg-yellow-golden group-hover:text-indigo-deep"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <div
                  className={`text-xs tracking-wider uppercase font-sans font-medium mb-1 ${
                    isIndigo ? "text-light-text/60" : "text-muted-text"
                  }`}
                >
                  {card.tagline}
                </div>

                <h3
                  className={`text-2xl sm:text-3xl font-sans font-light tracking-tight mb-4 ${
                    isIndigo ? "text-white" : "text-indigo-deep"
                  }`}
                >
                  {card.title}
                </h3>

                <p
                  className={`text-sm leading-relaxed font-sans mb-6 ${
                    isIndigo ? "text-light-text/80" : "text-muted-text"
                  }`}
                >
                  {card.description}
                </p>
              </div>

              {/* Practices Tags */}
              <div
                className={`pt-4 border-t flex flex-wrap gap-2 ${
                  isIndigo ? "border-white/10" : "border-yellow-border/60"
                }`}
              >
                {card.practices.map((practice) => (
                  <span
                    key={practice}
                    className={`text-[11px] px-2.5 py-1 rounded-ktag font-sans ${
                      isIndigo
                        ? "bg-white/10 text-light-text/90"
                        : "bg-yellow-golden/30 text-indigo-deep"
                    }`}
                  >
                    {practice}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

