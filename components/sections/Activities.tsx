"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { activitiesContent } from "@/content/activities";
import { TagChip } from "@/components/ui/TagChip";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function Activities() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 4 Boxes Morph Refs
  const morphSectionRef = useRef<HTMLDivElement | null>(null);
  const morphContainerRef = useRef<HTMLDivElement | null>(null);
  const startSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const morphCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const iconWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const miniLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expandedTextRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { prefersReducedMotion } = useSmoothScroll();

  // Pause video when off screen to conserve resources
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          if (video.paused) video.play().catch(() => {});
        } else {
          if (!video.paused) video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Video Section animation
  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;

    const isMobile = window.innerWidth < 768;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        end: "top 20%",
        scrub: 0.6,
      },
    });

    tl.fromTo(
      cardRef.current,
      {
        scale: isMobile ? 0.94 : 0.88,
        borderRadius: isMobile ? "36px" : "48px",
      },
      {
        scale: 1.0,
        borderRadius: isMobile ? "20px" : "24px",
        ease: "power2.out",
      },
      0
    );

    if (videoRef.current) {
      tl.fromTo(
        videoRef.current,
        { scale: 1.1 },
        { scale: 1.02, ease: "none" },
        0
      );
    }

    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, ease: "power2.out" },
        0.2
      );
    }
  }, [prefersReducedMotion]);

  // =========================================================================
  // CHANGE 1: 4 BOXES BECOME SMALL ICON TILES THAT EXPAND ON SCROLL (UNIVERSE STYLE)
  // =========================================================================
  useEffect(() => {
    const section = morphSectionRef.current;
    const container = morphContainerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // DESKTOP: >= 1024px (Pinned Morph Sequence)
      mm.add("(min-width: 1024px)", () => {
        if (prefersReducedMotion) {
          morphCardRefs.current.forEach((cardEl, idx) => {
            if (!cardEl) return;
            const targetSlot = targetSlotRefs.current[idx];
            if (!targetSlot) return;
            const cRect = container.getBoundingClientRect();
            const tRect = targetSlot.getBoundingClientRect();
            gsap.set(cardEl, {
              x: tRect.left - cRect.left,
              y: tRect.top - cRect.top,
              width: tRect.width,
              height: tRect.height,
              borderRadius: 24,
              opacity: 1,
            });
            if (miniLabelRefs.current[idx]) gsap.set(miniLabelRefs.current[idx], { opacity: 0, display: "none" });
            if (expandedTextRefs.current[idx]) gsap.set(expandedTextRefs.current[idx], { opacity: 1, y: 0 });
          });
          return;
        }

        const getMeasurements = () => {
          if (!container) return null;
          const containerRect = container.getBoundingClientRect();

          const data = [0, 1, 2, 3].map((idx) => {
            const startEl = startSlotRefs.current[idx];
            const targetEl = targetSlotRefs.current[idx];
            if (!startEl || !targetEl) return null;

            const startRect = startEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();

            return {
              startX: startRect.left - containerRect.left,
              startY: startRect.top - containerRect.top,
              startW: startRect.width,
              startH: startRect.height,
              endX: targetRect.left - containerRect.left,
              endY: targetRect.top - containerRect.top,
              endW: targetRect.width,
              endH: targetRect.height,
            };
          });

          if (data.some((d) => !d)) return null;
          return data as NonNullable<(typeof data)[0]>[];
        };

        const measurements = getMeasurements();
        if (!measurements) return;

        // Set initial collapsed state (4 small square rounded tiles: 110px x 110px, radius 24px)
        measurements.forEach((m, idx) => {
          const card = morphCardRefs.current[idx];
          const iconWrapper = iconWrapperRefs.current[idx];
          const miniLabel = miniLabelRefs.current[idx];
          const expandedText = expandedTextRefs.current[idx];

          if (card) {
            gsap.set(card, {
              x: m.startX,
              y: m.startY,
              width: m.startW,
              height: m.startH,
              borderRadius: 24,
              opacity: 1,
              willChange: "transform, width, height, border-radius",
            });
          }
          if (iconWrapper) {
            gsap.set(iconWrapper, {
              x: 0,
              y: 0,
              scale: 0.9,
            });
          }
          if (miniLabel) {
            gsap.set(miniLabel, { opacity: 1, y: 0 });
          }
          if (expandedText) {
            gsap.set(expandedText, { opacity: 0, y: 20 });
          }
        });

        // Scrubbed Pin Timeline (300vh pin duration)
        const pinTimeline = gsap.timeline({
          scrollTrigger: {
            id: "activities-tiles-morph",
            refreshPriority: 7,
            trigger: section,
            start: "top top",
            end: () => "+=" + window.innerHeight * 3.0,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
              const updated = getMeasurements();
              if (!updated) return;
              updated.forEach((m, idx) => {
                const card = morphCardRefs.current[idx];
                if (card && pinTimeline.progress() === 0) {
                  gsap.set(card, {
                    x: m.startX,
                    y: m.startY,
                    width: m.startW,
                    height: m.startH,
                  });
                }
              });
            },
          },
        });

        // Morph each tile sequentially
        // Card 0: 0.00 -> 0.22
        // Card 1: 0.22 -> 0.44
        // Card 2: 0.44 -> 0.66
        // Card 3: 0.66 -> 0.88
        // Hold/Read: 0.88 -> 1.00
        const stepDuration = 0.22;

        measurements.forEach((m, idx) => {
          const card = morphCardRefs.current[idx];
          const iconWrapper = iconWrapperRefs.current[idx];
          const miniLabel = miniLabelRefs.current[idx];
          const expandedText = expandedTextRefs.current[idx];

          const startTime = idx * stepDuration;

          if (card) {
            // Explicitly set initial state at time 0 so cards never render uninitialized
            pinTimeline.set(
              card,
              {
                x: m.startX,
                y: m.startY,
                width: m.startW,
                height: m.startH,
                borderRadius: 24,
                opacity: 1,
              },
              0
            );

            pinTimeline.to(
              card,
              {
                x: m.endX,
                y: m.endY,
                width: m.endW,
                height: m.endH,
                borderRadius: 24,
                ease: "power2.inOut",
                duration: stepDuration,
              },
              startTime
            );
          }

          if (miniLabel) {
            pinTimeline.set(miniLabel, { opacity: 1 }, 0);
            pinTimeline.to(
              miniLabel,
              {
                opacity: 0,
                duration: stepDuration * 0.35,
                ease: "power1.out",
              },
              startTime
            );
          }

          if (iconWrapper) {
            const shiftX = Math.round(-(m.endW / 2 - 52));
            pinTimeline.set(iconWrapper, { scale: 0.95, x: 0, y: 0 }, 0);
            pinTimeline.to(
              iconWrapper,
              {
                scale: 1.15,
                x: shiftX,
                y: 8,
                duration: stepDuration,
                ease: "power2.inOut",
              },
              startTime
            );
          }

          if (expandedText) {
            pinTimeline.set(expandedText, { opacity: 0, y: 24 }, 0);
            pinTimeline.to(
              expandedText,
              {
                opacity: 1,
                y: 0,
                duration: stepDuration * 0.65,
                ease: "power2.out",
              },
              startTime + stepDuration * 0.35
            );
          }
        });
      });

      // MOBILE & TABLET: < 1024px (Stacked, expanded with simple reveals)
      mm.add("(max-width: 1023px)", () => {
        morphCardRefs.current.forEach((cardEl, idx) => {
          if (!cardEl) return;
          gsap.set(cardEl, {
            clearProps: "all",
          });
          if (miniLabelRefs.current[idx]) gsap.set(miniLabelRefs.current[idx], { display: "none" });
          if (expandedTextRefs.current[idx]) gsap.set(expandedTextRefs.current[idx], { opacity: 1, y: 0 });
        });
      });
    }, morphSectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="activities" ref={containerRef} className="relative w-full bg-yellow-cream overflow-hidden">
      {/* 1. Expanding Video Card ("Life doesn't happen in classrooms alone") */}
      <div className="py-16 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center w-full">
          <div
            ref={cardRef}
            style={{ willChange: "transform, border-radius", transformOrigin: "center center" }}
            className="relative min-h-[500px] sm:min-h-[580px] rounded-[48px] overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-12 mx-auto select-none"
          >
            {/* Background Video (Clean natural colors, auto play on loop) */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <video
                ref={videoRef}
                src={activitiesContent.videoSrc}
                poster={activitiesContent.posterSrc}
                muted
                playsInline
                autoPlay
                loop
                preload="auto"
                className="w-full h-full object-cover scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Top Tag & Header */}
            <div className="z-10 flex items-center justify-between">
              <TagChip variant="yellow">{activitiesContent.sectionTag}</TagChip>
            </div>

            {/* Clean Centered Headline */}
            <div ref={headlineRef} className="z-10 text-center my-auto py-8">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-white max-w-3xl mx-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)]">
                {activitiesContent.headlinePrefix}{" "}
                <span className="inline-block whitespace-nowrap">
                  <span className="headline-accent text-yellow-golden font-serif italic">
                    {activitiesContent.headlineAccentLetter}
                  </span>
                  {activitiesContent.headlineSuffix}
                </span>
              </h2>
            </div>

            {/* Infinite Marquee of Activity Pills */}
            <div className="z-10 overflow-hidden py-3 border-t border-white/15 select-none">
              <div className="flex gap-3 whitespace-nowrap animate-marquee">
                {[...activitiesContent.pills, ...activitiesContent.pills].map((pill, idx) => (
                  <span
                    key={`${pill}-${idx}`}
                    className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-sans tracking-wide border border-white/15 shadow-sm"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHANGE 1: 4 BOXES BECOME SMALL ICON TILES THAT EXPAND ON SCROLL */}
      <div
        ref={morphSectionRef}
        className="relative w-full min-h-screen bg-yellow-cream z-10 flex flex-col justify-center py-16 select-none"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 w-full">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <TagChip variant="cream" className="mb-3">
              Holistic Development
            </TagChip>
            <h3 className="text-2xl sm:text-4xl font-sans font-light tracking-tight text-indigo-deep">
              Four dimensions of active learning
            </h3>
            <p className="text-xs sm:text-sm text-muted-text mt-2 font-sans">
              Scroll to expand each pillar from curiosity into comprehensive capability
            </p>
          </div>

          {/* Morphing Area Container */}
          <div ref={morphContainerRef} className="relative w-full min-h-[460px]">
          {/* DESKTOP GHOST TARGET SLOTS: 4 Full Boxes in a 4-Column Grid (defines container height) */}
          <div className="hidden lg:grid grid-cols-4 gap-6 w-full max-w-7xl mx-auto pointer-events-none opacity-0">
            {activitiesContent.subCards.map((card, idx) => (
              <div
                key={`target-slot-${card.id}`}
                ref={(el) => {
                  targetSlotRefs.current[idx] = el;
                }}
                className="min-h-[420px] rounded-[24px] border border-[#EDD38A] bg-[#FFEBB0] p-8"
              />
            ))}
          </div>

          {/* DESKTOP GHOST START SLOTS: 4 Small Square Rounded Tiles (110px x 110px, radius 24px) centered */}
          <div className="hidden lg:flex items-center justify-center gap-6 absolute inset-0 pointer-events-none opacity-0">
            {activitiesContent.subCards.map((card, idx) => (
              <div
                key={`start-slot-${card.id}`}
                ref={(el) => {
                  startSlotRefs.current[idx] = el;
                }}
                className="w-[110px] h-[110px] rounded-[24px] border border-[#EDD38A] bg-[#FFEBB0]"
              />
            ))}
          </div>

          {/* DESKTOP MORPHING CARDS (Absolute elements that morph from small tiles to full boxes) */}
          <div className="hidden lg:block">
            {activitiesContent.subCards.map((card, idx) => {
              const iconSrc = `/assets/icon-${card.id}.png`;

              return (
                <div
                  key={`morph-card-${card.id}`}
                  ref={(el) => {
                    morphCardRefs.current[idx] = el;
                  }}
                  className="absolute top-0 left-0 bg-[#FFEBB0] text-[#25245A] border border-[#EDD38A] rounded-[24px] shadow-sm overflow-hidden select-none"
                >
                  {/* Collapsed Tile Content (Icon + Mini Label) */}
                  <div
                    ref={(el) => {
                      iconWrapperRefs.current[idx] = el;
                    }}
                    className="absolute top-3.5 left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <Image
                        src={iconSrc}
                        alt={card.title}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>

                    {/* Mini Label visible only in collapsed tile state */}
                    <div
                      ref={(el) => {
                        miniLabelRefs.current[idx] = el;
                      }}
                      className="text-[11px] font-sans font-semibold tracking-wider text-[#3B3A82] uppercase mt-1 text-center px-1"
                    >
                      {card.title}
                    </div>
                  </div>

                  {/* Expanded Content: Fades and slides in when expanding */}
                  <div
                    ref={(el) => {
                      expandedTextRefs.current[idx] = el;
                    }}
                    className="absolute left-7 right-7 top-24 bottom-6 flex flex-col justify-start pointer-events-none"
                  >
                    <div className="text-xs uppercase tracking-wider text-[#4A4A72] font-sans font-medium mb-1">
                      {card.tagline}
                    </div>
                    <h4 className="text-2xl font-sans font-light tracking-tight text-[#25245A] mb-3">
                      {card.title}
                    </h4>
                    <p className="text-sm text-[#4A4A72] leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MOBILE & TABLET FALLBACK: Normal stacked grid (< 1024px) */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {activitiesContent.subCards.map((card) => {
              const iconSrc = `/assets/icon-${card.id}.png`;

              return (
                <div
                  key={`mobile-card-${card.id}`}
                  className="bg-[#FFEBB0] text-[#25245A] border border-[#EDD38A] rounded-[24px] p-6 sm:p-8 flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="relative w-14 h-14 mb-4">
                      <Image
                        src={iconSrc}
                        alt={card.title}
                        width={56}
                        height={56}
                        className="object-contain"
                      />
                    </div>
                    <div className="text-xs uppercase tracking-wider text-[#4A4A72] font-sans font-medium mb-1">
                      {card.tagline}
                    </div>
                    <h4 className="text-2xl font-sans font-light tracking-tight text-[#25245A] mb-2">
                      {card.title}
                    </h4>
                    <p className="text-sm text-[#4A4A72] leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
