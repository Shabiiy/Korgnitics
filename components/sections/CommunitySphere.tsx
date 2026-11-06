"use client";

import React, { useEffect, useRef, useState } from "react";
import { communityContent } from "@/content/community";
import { TagChip } from "@/components/ui/TagChip";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function CommunitySphere() {
  const containerRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bordersRef = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    // Left Column reveals from the LEFT
    if (leftColRef.current) {
      gsap.fromTo(
        leftColRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: leftColRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Draw borders left to right
    bordersRef.current.forEach((border) => {
      if (!border) return;
      gsap.fromTo(
        border,
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1,
          duration: 0.85,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          scrollTrigger: {
            trigger: border,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Rows slide in from the RIGHT
    rowsRef.current.forEach((row, idx) => {
      if (!row) return;
      gsap.fromTo(
        row,
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.75,
          delay: idx * 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: row,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }, [prefersReducedMotion]);

  return (
    <section id="community-sphere" ref={containerRef} className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column - Slides from LEFT */}
        <div ref={leftColRef} className="lg:col-span-5 lg:sticky lg:top-28">
          <TagChip variant="cream" className="mb-4">
            {communityContent.sectionTag}
          </TagChip>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-indigo-deep mb-6">
            <span>{communityContent.headingPart1}</span>
            <br />
            <span>
              {communityContent.headingPart2}{" "}
              <span className="headline-accent text-yellow-golden font-serif italic">
                {communityContent.headingAccentLetter}
              </span>
              {communityContent.headingPart3}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-muted-text font-sans leading-relaxed">
            {communityContent.intro}
          </p>
        </div>

        {/* Right Column: 4 Interactive Rows */}
        <div className="lg:col-span-7 flex flex-col">
          {communityContent.rows.map((row, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={row.number}
                ref={(el) => {
                  rowsRef.current[idx] = el;
                }}
                className="group relative"
              >
                {/* Border line */}
                <div
                  ref={(el) => {
                    bordersRef.current[idx] = el;
                  }}
                  className="w-full h-px bg-yellow-border/80"
                />

                <div
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="py-7 px-3 sm:px-5 cursor-pointer rounded-xl transition-colors duration-200 hover:bg-yellow-surface/40 flex flex-col"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-baseline gap-4 sm:gap-6">
                      <span className="text-sm font-sans font-medium text-yellow-golden">
                        {row.number}
                      </span>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-sans font-light tracking-tight text-indigo-deep group-hover:text-indigo transition-colors">
                          {row.title}
                        </h3>
                        <p className="text-xs text-muted-text/80 font-sans mt-0.5">
                          {row.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-kbtn border border-yellow-border flex items-center justify-center text-indigo-deep group-hover:bg-yellow-golden group-hover:border-yellow-golden transition-all flex-shrink-0">
                      {isOpen ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:rotate-45" />
                      )}
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isOpen && (
                    <div className="pl-8 sm:pl-12 mt-4 pt-4 border-t border-yellow-border/40 text-sm text-indigo-deep leading-relaxed font-sans bg-yellow-surface/60 p-4 rounded-lg">
                      <p className="mb-3">{row.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {row.points.map((pt) => (
                          <span
                            key={pt}
                            className="text-xs px-2.5 py-1 rounded-ktag bg-white/60 text-indigo-deep font-medium"
                          >
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Closing border */}
          <div className="w-full h-px bg-yellow-border/80" />
        </div>
      </div>
    </section>
  );
}

