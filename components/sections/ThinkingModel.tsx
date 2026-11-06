"use client";

import React, { useEffect, useRef, useState } from "react";
import { thinkingModelContent } from "@/content/thinkingModel";
import { TagChip } from "@/components/ui/TagChip";
import { Quote, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function ThinkingModel() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headerLeftRef = useRef<HTMLDivElement | null>(null);
  const headerRightRef = useRef<HTMLParagraphElement | null>(null);
  const lineDesktopRef = useRef<HTMLDivElement | null>(null);
  const lineMobileRef = useRef<HTMLDivElement | null>(null);
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    // 1. Header entrance animation: Left headline from left, Right description from right
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
            start: "top 85%",
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
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // 2. Golden Line Journey Animation: scrubbed as user scrolls through the section
    const isDesktop = window.innerWidth >= 1024;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 70%",
      end: "bottom 65%",
      scrub: 0.8,
      onUpdate: (self) => {
        const prog = self.progress;

        // Draw horizontal line on desktop, vertical on mobile
        if (isDesktop && lineDesktopRef.current) {
          lineDesktopRef.current.style.width = `${prog * 100}%`;
        } else if (!isDesktop && lineMobileRef.current) {
          lineMobileRef.current.style.height = `${prog * 100}%`;
        }

        // Active step illumination as golden line passes through each card
        // 0: > 0.04, 1: > 0.24, 2: > 0.46, 3: > 0.68, 4: > 0.88
        let currentActive = 0;
        if (prog >= 0.85) currentActive = 4;
        else if (prog >= 0.65) currentActive = 3;
        else if (prog >= 0.44) currentActive = 2;
        else if (prog >= 0.22) currentActive = 1;
        else if (prog >= 0.04) currentActive = 0;

        if (currentActive !== activeStepRef.current) {
          activeStepRef.current = currentActive;
          setActiveStep(currentActive);
        }
      },
    });

    // 3. Bottom Quote entrance
    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          scrollTrigger: {
            trigger: quoteRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    return () => {
      st.kill();
    };
  }, [prefersReducedMotion]);

  return (
    <section id="thinking-model" ref={containerRef} className="py-20 px-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto rounded-kcard bg-indigo-deep text-light-text p-6 sm:p-12 md:p-16 border border-indigo/40 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(253,185,46,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Top Header with Left/Right Entrance Animations */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 relative z-10">
          <div ref={headerLeftRef}>
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

          <p
            ref={headerRightRef}
            className="max-w-md text-sm sm:text-base text-light-text/80 font-sans leading-relaxed"
          >
            {thinkingModelContent.subtext}
          </p>
        </div>

        {/* 5-Step Process with Connecting Golden Journey Line */}
        <div className="relative my-12">
          {/* DESKTOP JOURNEY TRACK: Visible continuous golden line passing through the boxes */}
          <div className="hidden lg:block absolute top-[42px] left-6 right-6 h-[2.5px] z-20 pointer-events-none">
            {/* Base faint golden guide rail */}
            <div className="absolute inset-0 bg-yellow-golden/20 rounded-full" />

            {/* Glowing Golden Journey Line drawing through the boxes */}
            <div
              ref={lineDesktopRef}
              className="absolute left-0 top-0 h-full bg-yellow-golden rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_#FDB92E,0_0_24px_rgba(253,185,46,0.6)]"
              style={{ width: "0%" }}
            >
              {/* Leading golden pulse orb travelling through the boxes */}
              <div className="absolute -right-2 -top-1.5 w-4 h-4 rounded-full bg-yellow-golden ring-2 ring-white shadow-[0_0_12px_#FDB92E,0_0_24px_#FDB92E] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-deep" />
              </div>
            </div>
          </div>

          {/* MOBILE/TABLET JOURNEY TRACK: Vertical golden line connecting boxes */}
          <div className="lg:hidden absolute top-8 bottom-8 left-[38px] w-[2.5px] z-20 pointer-events-none">
            {/* Base faint guide rail */}
            <div className="absolute inset-0 bg-yellow-golden/20 rounded-full" />

            {/* Active drawing vertical line */}
            <div
              ref={lineMobileRef}
              className="absolute top-0 left-0 w-full bg-yellow-golden rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_#FDB92E]"
              style={{ height: "0%" }}
            >
              {/* Leading orb on mobile */}
              <div className="absolute -left-1.5 -bottom-2 w-4 h-4 rounded-full bg-yellow-golden ring-2 ring-white shadow-[0_0_12px_#FDB92E]" />
            </div>
          </div>

          {/* 5 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {thinkingModelContent.steps.map((step, idx) => {
              const isLit = idx <= activeStep;
              const isCurrentHead = idx === activeStep;

              return (
                <div
                  key={step.number}
                  className={`rounded-kcard p-5 sm:p-6 transition-all duration-500 ease-out flex flex-col justify-between border relative overflow-hidden ${
                    isLit
                      ? "bg-indigo/70 border-yellow-golden shadow-xl shadow-yellow-golden/15 -translate-y-2"
                      : "bg-indigo-deep/70 border-white/10 opacity-70"
                  }`}
                >
                  {/* Internal card golden beam glow when active */}
                  {isLit && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-golden to-transparent opacity-80" />
                  )}

                  <div className="relative z-10">
                    {/* Step circle node (Centered with the journey line) */}
                    <div className="relative mb-5 flex items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-sans font-semibold text-xs transition-all duration-500 z-30 relative ${
                          isLit
                            ? "bg-yellow-golden text-indigo-deep ring-4 ring-yellow-golden/30 shadow-[0_0_16px_rgba(253,185,46,0.6)] scale-110"
                            : "bg-indigo-deep text-light-text/75 border border-white/20"
                        }`}
                      >
                        {step.number}
                      </div>

                      {/* Small badge pulse if active head */}
                      {isCurrentHead && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-sans font-bold text-yellow-golden animate-pulse">
                          <Sparkles className="w-3 h-3" />
                          Journey
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-xl font-sans font-medium mb-1 transition-colors duration-300 ${
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

                  {/* Step stage indicator */}
                  <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-sans">
                    <span className={isLit ? "text-yellow-golden" : "text-light-text/40"}>
                      Phase 0{idx + 1}
                    </span>
                    <span className={isLit ? "text-white font-medium" : "text-light-text/40"}>
                      {isLit ? "Active Node" : "Upcoming"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central Quote Card with Smooth Reveal */}
        <div
          ref={quoteRef}
          className="mt-14 rounded-kcard bg-yellow-golden text-indigo-deep p-8 sm:p-10 border border-yellow-border/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
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

