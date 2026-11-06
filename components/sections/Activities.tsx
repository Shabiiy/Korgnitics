"use client";

import React, { useEffect, useRef } from "react";
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
  const subcardsRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;

    // Cinematic scroll expansion: card smoothly expands from 0.88 to 1.0 with soft radius transition
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

    // Sub-cards scroll expansion: icons start small and expand along with the cards on scroll
    if (subcardsRef.current) {
      const cardEls = subcardsRef.current.querySelectorAll(".activity-subcard");
      const iconEls = subcardsRef.current.querySelectorAll(".activity-subcard-icon");

      const tlSubcards = gsap.timeline({
        scrollTrigger: {
          trigger: subcardsRef.current,
          start: "top 92%",
          end: "top 45%",
          scrub: 0.8,
        },
      });

      cardEls.forEach((cardEl, idx) => {
        const iconEl = iconEls[idx];
        const delay = idx * 0.1;

        tlSubcards.fromTo(
          cardEl,
          {
            scale: 0.88,
            y: 45,
            opacity: 0.65,
            borderRadius: "36px",
          },
          {
            scale: 1.0,
            y: 0,
            opacity: 1.0,
            borderRadius: "24px",
            ease: "power2.out",
          },
          delay
        );

        if (iconEl) {
          tlSubcards.fromTo(
            iconEl,
            {
              scale: 0.5,
              opacity: 0.5,
            },
            {
              scale: 1.0,
              opacity: 1.0,
              ease: "power2.out",
            },
            delay
          );
        }
      });
    }
  }, [prefersReducedMotion]);

  return (
    <section id="activities" ref={containerRef} className="py-16 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Expanding Card */}
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
            {/* Subtle neutral gradient for tag and pill legibility (NO blue/indigo overlay) */}
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
              <span className="headline-accent text-yellow-golden font-serif italic">
                {activitiesContent.headlineAccentLetter}
              </span>
              {activitiesContent.headlineSuffix}
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

      {/* 4 Cards Below Video (Learning, Friendship, Playing, Expression) */}
      <div
        ref={subcardsRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
      >
        {activitiesContent.subCards.map((card) => {
          const iconSrc = `/assets/icon-${card.id}.png`;

          return (
            <div
              key={card.id}
              style={{ willChange: "transform, opacity, border-radius" }}
              className="activity-subcard rounded-kcard p-8 bg-yellow-surface text-indigo-deep border border-yellow-border shadow-sm flex flex-col justify-between transition-[box-shadow,border-color] duration-300 hover:shadow-lg hover:border-yellow-golden/50"
            >
              <div>
                {/* Transparent Extracted Icon with Scroll Expansion */}
                <div className="relative w-full h-32 mb-6 flex items-center justify-center overflow-visible">
                  <div
                    style={{ willChange: "transform, opacity" }}
                    className="activity-subcard-icon relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"
                  >
                    <Image
                      src={iconSrc}
                      alt={card.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="text-xs uppercase tracking-wider text-muted-text font-sans font-medium">
                  {card.tagline}
                </div>
                <h3 className="text-2xl font-sans font-light tracking-tight text-indigo-deep mt-1 mb-3">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-text leading-relaxed font-sans">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
