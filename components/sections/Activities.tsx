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

    // Scroll expansion effect: start at 70% width, scale 0.85, radius 48px -> full width, scale 1.0, radius 24px
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "top 25%",
          scrub: true,
        },
      });

      tl.fromTo(
        cardRef.current,
        { scale: 0.85, borderRadius: "48px", width: "85%" },
        { scale: 1.0, borderRadius: "24px", width: "100%", ease: "power2.out" }
      );

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: "power2.out" },
          0.3
        );
      }
    }

    // Sub-cards reveal at 85% viewport
    if (subcardsRef.current) {
      const items = subcardsRef.current.children;
      gsap.fromTo(
        items,
        { y: 40, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          scrollTrigger: {
            trigger: subcardsRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, [prefersReducedMotion]);

  return (
    <section id="activities" ref={containerRef} className="py-16 px-3 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Expanding Card */}
      <div className="flex justify-center w-full">
        <div
          ref={cardRef}
          className="relative min-h-[500px] sm:min-h-[580px] rounded-kcard overflow-hidden bg-black border border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-12 transition-all duration-300 mx-auto select-none"
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
          const shapeSrc = `/assets/shape-${card.id}.png`;

          return (
            <div
              key={card.id}
              className="rounded-kcard p-8 bg-yellow-surface text-indigo-deep border border-yellow-border shadow-sm flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                {/* Authentic Geometric Shape from reference design */}
                <div className="relative w-full h-32 mb-6 flex items-center justify-center">
                  <div className="relative w-28 h-28">
                    <Image
                      src={shapeSrc}
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
