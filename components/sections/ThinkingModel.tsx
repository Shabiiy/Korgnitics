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
  const lineRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || !lineRef.current) return;

    // Line drawing scrub across the 5 steps
    const isDesktop = window.innerWidth >= 1024;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 65%",
      end: "bottom 70%",
      scrub: true,
      onUpdate: (self) => {
        const prog = self.progress;

        // Draw horizontal line on desktop, or vertical line on mobile
        if (lineRef.current) {
          if (isDesktop) {
            lineRef.current.style.width = `${prog * 100}%`;
          } else {
            lineRef.current.style.height = `${prog * 100}%`;
          }
        }

        // Active step illumination only on step change
        const currentActive = Math.min(4, Math.floor(prog * 5));
        if (currentActive !== activeStepRef.current) {
          activeStepRef.current = currentActive;
          setActiveStep(currentActive);
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section id="thinking-model" ref={containerRef} className="py-20 px-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto rounded-kcard bg-indigo-deep text-light-text p-6 sm:p-12 md:p-16 border border-indigo/40 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow without heavy blur-3xl */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(59,58,130,0.3)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <TagChip variant="indigo" className="mb-4">
              {thinkingModelContent.sectionTag}
            </TagChip>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-white">
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

          <p className="max-w-md text-sm sm:text-base text-light-text/80 font-sans leading-relaxed">
            {thinkingModelContent.subtext}
          </p>
        </div>

        {/* 5-Step Process with Connecting Animated Line */}
        <div className="relative my-12">
          {/* Base Track Line */}
          <div className="hidden lg:block absolute top-7 left-8 right-8 h-0.5 bg-white/10 -z-0">
            {/* Animated drawing line */}
            <div
              ref={lineRef}
              className="h-full bg-yellow-golden transition-all duration-75 ease-out shadow-sm shadow-yellow-golden/50"
              style={{ width: "0%" }}
            />
          </div>

          {/* 5 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {thinkingModelContent.steps.map((step, idx) => {
              const isLit = idx <= activeStep;

              return (
                <div
                  key={step.number}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className={`rounded-kcard p-5 sm:p-6 transition-all duration-500 flex flex-col justify-between border ${
                    isLit
                      ? "bg-indigo/60 border-yellow-golden shadow-lg shadow-yellow-golden/10 -translate-y-1"
                      : "bg-indigo-deep/60 border-white/10 opacity-75"
                  }`}
                >
                  <div>
                    {/* Step circle node */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-sans font-semibold text-xs mb-4 transition-all duration-300 ${
                        isLit
                          ? "bg-yellow-golden text-indigo-deep ring-4 ring-yellow-golden/20"
                          : "bg-white/10 text-light-text border border-white/20"
                      }`}
                    >
                      {step.number}
                    </div>

                    <h3
                      className={`text-xl font-sans font-medium mb-1 transition-colors ${
                        isLit ? "text-yellow-golden" : "text-white"
                      }`}
                    >
                      {step.stepName}
                    </h3>

                    <div className="text-xs font-serif italic text-light-text/90 mb-3">
                      "{step.question}"
                    </div>

                    <p className="text-xs text-light-text/75 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Quote Card */}
        <div className="mt-14 rounded-kcard bg-yellow-golden text-indigo-deep p-8 sm:p-10 border border-yellow-border/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-deep text-yellow-golden flex items-center justify-center flex-shrink-0">
              <Quote className="w-6 h-6" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-sans font-light tracking-tightest leading-tight">
              "{thinkingModelContent.quote}"
            </p>
          </div>

          <div className="text-xs tracking-wider uppercase font-sans font-semibold px-4 py-2 rounded-ktag bg-indigo-deep text-yellow-golden flex-shrink-0">
            Core Philosophy
          </div>
        </div>
      </div>
    </section>
  );
}

