"use client";

import React, { useEffect, useRef, useState } from "react";
import { thinkingModelContent } from "@/content/thinkingModel";
import { TagChip } from "@/components/ui/TagChip";
import { Quote } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function ThinkingModel() {
  const containerRef = useRef<HTMLElement | null>(null);
  const stepsContainerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const basePathRef = useRef<SVGPathElement | null>(null);
  const journeyPathRef = useRef<SVGPathElement | null>(null);
  const headDotRef = useRef<SVGGElement | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { prefersReducedMotion } = useSmoothScroll();

  // =========================================================================
  // CHANGE 2: THINKING MODEL, GOLDEN LINE JOURNEY (SVG PATH & FOLLOWER DOT)
  // =========================================================================
  useEffect(() => {
    const container = containerRef.current;
    const stepsContainer = stepsContainerRef.current;
    const journeyPath = journeyPathRef.current;
    const basePath = basePathRef.current;
    const headDot = headDotRef.current;
    if (!container || !stepsContainer || !journeyPath || !basePath || !headDot) return;

    let totalLength = 0;
    let nodeThresholds = [0.1, 0.3, 0.5, 0.7, 0.9];

    const calculatePath = () => {
      if (!stepsContainer || !journeyPath || !basePath) return;
      const containerRect = stepsContainer.getBoundingClientRect();

      const points: { x: number; y: number }[] = [];
      nodeRefs.current.forEach((node) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        points.push({
          x: Math.round(rect.left - containerRect.left + rect.width / 2),
          y: Math.round(rect.top - containerRect.top + rect.height / 2),
        });
      });

      if (points.length < 5) return;

      // Construct SVG path through the centers of all 5 step nodes
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }

      basePath.setAttribute("d", d);
      journeyPath.setAttribute("d", d);

      totalLength = journeyPath.getTotalLength();
      if (totalLength === 0) return;

      journeyPath.style.strokeDasharray = `${totalLength}`;
      journeyPath.style.strokeDashoffset = `${totalLength}`;

      // Calculate the progress fraction where the line reaches each node
      let accumulated = 0;
      const thresholds = [0.02];
      for (let i = 1; i < points.length; i++) {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        accumulated += Math.sqrt(dx * dx + dy * dy);
        thresholds.push(Math.min(0.98, accumulated / totalLength));
      }
      nodeThresholds = thresholds;
    };

    calculatePath();

    if (prefersReducedMotion) {
      if (journeyPath) journeyPath.style.strokeDashoffset = "0";
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        card.style.borderColor = "#FDB92E";
        card.style.transform = "translateY(-6px)";
        const node = nodeRefs.current[idx];
        if (node) {
          node.style.backgroundColor = "#FDB92E";
          node.style.color = "#25245A";
        }
      });
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP: >= 1024px (Pinned Golden Line Journey)
      mm.add("(min-width: 1024px)", () => {
        calculatePath();

        const st = ScrollTrigger.create({
          id: "thinking-model-golden-line",
          refreshPriority: 6,
          trigger: container,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.8,
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: () => {
            calculatePath();
          },
          onUpdate: (self) => {
            const p = self.progress;

            if (totalLength > 0 && journeyPath) {
              // Draw the line as far as scroll reached
              const offset = totalLength * (1 - p);
              journeyPath.style.strokeDashoffset = `${offset}`;

              // Move the glowing head dot to the current line tip
              if (headDot) {
                if (p <= 0.01) {
                  headDot.style.opacity = "0";
                } else {
                  headDot.style.opacity = "1";
                  const currentLen = Math.min(totalLength, Math.max(0, p * totalLength));
                  const pt = journeyPath.getPointAtLength(currentLen);
                  headDot.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
                }
              }
            }

            // Light up each box as the golden line reaches it (and stay highlighted)
            cardRefs.current.forEach((card, idx) => {
              if (!card) return;
              const node = nodeRefs.current[idx];
              const threshold = nodeThresholds[idx] || (idx * 0.2 + 0.1);

              if (p >= threshold) {
                // Reached: golden border, slight lift -6px, number turns golden
                card.style.borderColor = "#FDB92E";
                card.style.transform = "translateY(-6px)";
                if (node) {
                  node.style.backgroundColor = "#FDB92E";
                  node.style.color = "#25245A";
                  node.style.borderColor = "#FDB92E";
                }
              } else {
                // Before reaching or on reverse scroll up: return to base state
                card.style.borderColor = "rgba(255, 255, 255, 0.12)";
                card.style.transform = "translateY(0px)";
                if (node) {
                  node.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  node.style.color = "#ffffff";
                  node.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }
              }
            });
          },
        });
      });

      // MOBILE & TABLET: < 1024px (Normal scroll flow)
      mm.add("(max-width: 1023px)", () => {
        calculatePath();
        if (journeyPath) journeyPath.style.strokeDashoffset = "0";
        cardRefs.current.forEach((card, idx) => {
          if (!card) return;
          card.style.borderColor = "#FDB92E";
          const node = nodeRefs.current[idx];
          if (node) {
            node.style.backgroundColor = "#FDB92E";
            node.style.color = "#25245A";
          }
        });
      });
    }, container);

    const handleResize = () => {
      calculatePath();
    };

    if (document.fonts) {
      document.fonts.ready.then(calculatePath);
    }
    const timer = setTimeout(calculatePath, 300);

    window.addEventListener("resize", handleResize);
    ScrollTrigger.addEventListener("refresh", calculatePath);

    return () => {
      clearTimeout(timer);
      ctx.revert();
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.removeEventListener("refresh", calculatePath);
    };
  }, [prefersReducedMotion]);

  return (
    <section id="thinking-model" ref={containerRef} className="relative w-full min-h-screen py-16 px-3 sm:px-6 md:px-8 flex flex-col justify-center bg-yellow-cream select-none">
      <div className="max-w-7xl mx-auto w-full rounded-kcard bg-indigo-deep text-light-text p-6 sm:p-12 md:p-16 border border-indigo/40 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(253,185,46,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative z-10">
          <div className="reveal-slide-left">
            <TagChip variant="indigo" className="mb-4">
              {thinkingModelContent.sectionTag}
            </TagChip>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-white reveal-text">
              {thinkingModelContent.headingPart1}{" "}
              <span className="text-yellow-golden block sm:inline">
                {thinkingModelContent.headingPart2}{" "}
                <span className="headline-accent text-white font-serif italic">
                  {thinkingModelContent.headingAccentLetter}
                </span>
                {thinkingModelContent.headingPart3}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm sm:text-base text-light-text/80 font-sans leading-relaxed reveal-slide-right">
            {thinkingModelContent.subtext}
          </p>
        </div>

        {/* 5-Step Process with Connecting SVG Golden Journey Line */}
        <div ref={stepsContainerRef} className="relative my-12">
          {/* SVG Overlay through the centers of all 5 step nodes */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
            aria-hidden="true"
          >
            {/* Base faint guide path */}
            <path
              ref={basePathRef}
              fill="none"
              stroke="rgba(253, 185, 46, 0.2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Active golden journey path */}
            <path
              ref={journeyPathRef}
              fill="none"
              stroke="#FDB92E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glowing follower dot at the tip of the golden line */}
            <g ref={headDotRef} className="transition-opacity duration-150">
              <circle r="7" fill="#FDB92E" stroke="#ffffff" strokeWidth="2" />
              <circle r="13" fill="none" stroke="#FDB92E" strokeWidth="1.5" opacity="0.6" />
            </g>
          </svg>

          {/* 5 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {thinkingModelContent.steps.map((step, idx) => (
              <div
                key={step.number}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                style={{
                  transition: "border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease",
                  willChange: "transform, border-color",
                }}
                className="rounded-kcard p-5 sm:p-6 bg-indigo-deep/70 border border-white/10 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="relative z-10">
                  {/* Step circle node through which the golden line journeys */}
                  <div className="relative mb-5 flex items-center">
                    <div
                      ref={(el) => {
                        nodeRefs.current[idx] = el;
                      }}
                      style={{
                        transition: "background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease",
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center font-sans font-semibold text-xs border border-white/20 bg-white/10 text-white z-30"
                    >
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-xl font-sans font-medium text-white mb-1">
                    {step.stepName}
                  </h3>

                  <div className="text-xs font-serif italic text-light-text/90 mb-3">
                    "{step.question}"
                  </div>

                  <p className="text-xs text-light-text/75 leading-relaxed font-sans">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-sans text-light-text/50">
                  <span>Phase 0{idx + 1}</span>
                  <span>Cognitive Cycle</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Quote Card */}
        <div className="mt-14 rounded-kcard bg-yellow-golden text-indigo-deep p-8 sm:p-10 border border-yellow-border/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden reveal-text">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full bg-indigo-deep text-yellow-golden flex items-center justify-center flex-shrink-0 shadow-md">
              <Quote className="w-6 h-6" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-sans font-light tracking-tightest leading-tight">
              "{thinkingModelContent.quote}"
            </p>
          </div>

          <div className="flex-shrink-0 relative z-10">
            <span className="px-4 py-2 rounded-ktag bg-indigo-deep text-yellow-golden text-xs uppercase tracking-wider font-sans font-semibold">
              Core Philosophy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

