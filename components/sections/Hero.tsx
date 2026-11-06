"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { heroContent } from "@/content/hero";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TagChip } from "@/components/ui/TagChip";
import { ChevronDown, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const videoCardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textGradientRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);
  const headlineLine1Ref = useRef<HTMLDivElement | null>(null);
  const headlineLine2Ref = useRef<HTMLDivElement | null>(null);
  const accent1Ref = useRef<HTMLSpanElement | null>(null);
  const accent2Ref = useRef<HTMLSpanElement | null>(null);
  const subtextCtaRef = useRef<HTMLDivElement | null>(null);
  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const uiLayerRef = useRef<HTMLDivElement | null>(null);

  const isUiInteractableRef = useRef(false);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Call ScrollTrigger.refresh() once metadata loads
    const handleLoadedMetadata = () => {
      ScrollTrigger.refresh();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (video.readyState >= 1) {
      ScrollTrigger.refresh();
    }

    // Pause hero video when out of viewport to free GPU decoding
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!video) return;
        if (entry.isIntersecting) {
          if (video.paused) video.play().catch(() => {});
        } else {
          if (!video.paused) video.pause();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !videoCardRef.current || !videoRef.current) {
      return;
    }

    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Reduced motion: show final framed card state immediately with simple fade, no pinning
      if (prefersReducedMotion) {
        isUiInteractableRef.current = true;
        if (uiLayerRef.current) {
          uiLayerRef.current.style.pointerEvents = "auto";
        }
        gsap.set(videoCardRef.current, {
          clipPath: isMobile
            ? "inset(12px 12px 12px 12px round 20px)"
            : "inset(20px 20px 20px 20px round 24px)",
        });
        gsap.set(scrollCueRef.current, { opacity: 0, display: "none" });
        gsap.set(textGradientRef.current, { opacity: 1 });
        if (uiLayerRef.current) {
          gsap.set(uiLayerRef.current, { opacity: 1 });
        }
        return;
      }

      // Set initial Phase 1 states
      // Video wrapper is full-bleed edge-to-edge
      gsap.set(videoCardRef.current, {
        clipPath: "inset(0px 0px 0px 0px round 0px)",
      });
      // Video starts at scale 1.0
      gsap.set(videoRef.current, { scale: 1.0 });
      // Neutral dark text gradient is invisible at start
      gsap.set(textGradientRef.current, { opacity: 0 });
      // Scroll cue is visible at bottom center
      gsap.set(scrollCueRef.current, { opacity: 1, y: 0 });

      // Hide hero central content and bottom bar initially (opacity 0)
      gsap.set(
        [
          tagRef.current,
          subtextCtaRef.current,
          bottomBarRef.current,
        ],
        { opacity: 0 }
      );
      // Line reveals start masked below
      gsap.set(headlineLine1Ref.current, { y: "115%", opacity: 0 });
      gsap.set(headlineLine2Ref.current, { y: "115%", opacity: 0 });
      gsap.set([accent1Ref.current, accent2Ref.current], { opacity: 0, scale: 0.8 });

      // Target clip-path for framed card
      const targetClipPath = isMobile
        ? "inset(12px 12px 12px 12px round 20px)"
        : "inset(20px 20px 20px 20px round 24px)";

      // Master Timeline tied to ScrollTrigger (0 -> 1)
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: isMobile ? "+=80%" : "+=100%",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            const canInteract = p >= 0.35;
            if (canInteract !== isUiInteractableRef.current) {
              isUiInteractableRef.current = canInteract;
              if (uiLayerRef.current) {
                uiLayerRef.current.style.pointerEvents = canInteract ? "auto" : "none";
              }
            }
          },
        },
      });

      // 1. Clip-path: Full-bleed -> Inset rounded card (0.0 -> 1.0)
      masterTl.to(
        videoCardRef.current,
        {
          clipPath: targetClipPath,
          ease: "power2.inOut",
          duration: 1.0,
        },
        0
      );

      // 2. Video subtle counter-scale (1.0 -> 1.04) so picture stays full and unletterboxed
      masterTl.to(
        videoRef.current,
        {
          scale: 1.04,
          ease: "none",
          duration: 1.0,
        },
        0
      );

      // 3. Tiny scroll cue: fades out immediately once scrolling starts (0.0 -> 0.12)
      masterTl.to(
        scrollCueRef.current,
        {
          opacity: 0,
          y: 16,
          ease: "power2.out",
          duration: 0.12,
        },
        0
      );

      // 4. Soft neutral dark gradient behind text ONLY once card has formed (0 -> 35% black, NO indigo)
      masterTl.to(
        textGradientRef.current,
        {
          opacity: 1,
          ease: "power1.inOut",
          duration: 0.45,
        },
        0.35
      );

      // 5. Staggered UI reveal between progress 0.35 and 0.8:
      // 5.1 "Welcome to Kognitics" tag
      if (tagRef.current) {
        masterTl.fromTo(
          tagRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.16 },
          0.38
        );
      }

      // 5.2 Headline Line 1: "Education is not about what to think." (Mask reveal)
      if (headlineLine1Ref.current) {
        masterTl.fromTo(
          headlineLine1Ref.current,
          { opacity: 0, y: "115%" },
          { opacity: 1, y: "0%", ease: "power3.out", duration: 0.2 },
          0.44
        );
      }

      // 5.3 Headline Line 2: "It's about how to think." (Mask reveal)
      if (headlineLine2Ref.current) {
        masterTl.fromTo(
          headlineLine2Ref.current,
          { opacity: 0, y: "115%" },
          { opacity: 1, y: "0%", ease: "power3.out", duration: 0.2 },
          0.50
        );
      }

      // 5.4 Italic serif letters landing last
      if (accent1Ref.current && accent2Ref.current) {
        masterTl.fromTo(
          [accent1Ref.current, accent2Ref.current],
          { opacity: 0, scale: 0.75 },
          { opacity: 1, scale: 1, ease: "back.out(1.8)", duration: 0.15 },
          0.64
        );
      }

      // 5.5 Subtext and the "Explore Kognitics" CTA
      if (subtextCtaRef.current) {
        masterTl.fromTo(
          subtextCtaRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 },
          0.56
        );
      }

      // 5.6 "Scroll to explore" and tagline along the bottom
      if (bottomBarRef.current) {
        masterTl.fromTo(
          bottomBarRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, ease: "power2.out", duration: 0.18 },
          0.62
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="hero"
      ref={containerRef as any}
      className="relative w-full h-[100svh] bg-yellow-cream overflow-hidden flex items-center justify-center"
    >
      {/* Video Card Wrapper that shrinks inward via clip-path */}
      <div
        ref={videoCardRef}
        style={{ willChange: "clip-path, transform" }}
        className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-auto"
      >
          {/* Natural Video (NO blue/indigo overlay) */}
          <video
            ref={videoRef}
            src={heroContent.videoSrc}
            poster={heroContent.posterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{ willChange: "transform" }}
            className="w-full h-full object-cover"
          />

          {/* 1. Subtle neutral black gradient at top/bottom edges ONLY (max 25% opacity) for logo/cue legibility */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-transparent to-black/25" />

          {/* 2. Soft neutral dark gradient behind text (0 -> 35% black, NO indigo) that fades in once card forms */}
          <div
            ref={textGradientRef}
            className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-black/20 to-transparent"
          />

          {/* Phase 1: Tiny Scroll Cue (Bottom Center) - Fades out on first scroll */}
          <div
            ref={scrollCueRef}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none select-none text-white/85 text-xs font-sans tracking-widest uppercase"
          >
            <span>Scroll</span>
            <span className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center">
              <ChevronDown className="w-3 h-3 text-yellow-golden animate-bounce" />
            </span>
          </div>

          {/* UI Layer (Central Content & Bottom Bar) */}
          <div
            ref={uiLayerRef}
            className={`absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-9 md:p-12 transition-all duration-150 ${
              prefersReducedMotion ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            {/* Top spacer to balance fixed navbar height */}
            <div className="w-full h-10 sm:h-12 pointer-events-none" aria-hidden="true" />

            {/* Central Content Area (Tag, Headline with mask reveals, Subtext & CTA) */}
            <div className="max-w-4xl mx-auto my-auto text-center flex flex-col items-center py-4">
              {/* "Welcome to Kognitics" Tag */}
              <div ref={tagRef} className="mb-4 sm:mb-6">
                <TagChip
                  variant="glass"
                  icon={<Sparkles className="w-3 h-3 text-yellow-golden" />}
                >
                  {heroContent.welcomeTag}
                </TagChip>
              </div>

              {/* Line-by-Line Masked Headline */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[74px] font-sans font-light tracking-tightest leading-[1.05] text-white">
                {/* Line 1 */}
                <span className="block overflow-hidden py-1">
                  <span ref={headlineLine1Ref} className="block will-change-transform">
                    {heroContent.headlinePrefix}{" "}
                    <span
                      ref={accent1Ref}
                      className="headline-accent text-yellow-golden font-serif italic inline-block"
                    >
                      {heroContent.headlineAccentLetter}
                    </span>
                    {heroContent.headlineSuffix}
                  </span>
                </span>

                {/* Line 2 (Yellow) */}
                <span className="block overflow-hidden py-1 text-yellow-golden mt-0.5 sm:mt-1">
                  <span ref={headlineLine2Ref} className="block will-change-transform">
                    {heroContent.yellowPrefix}{" "}
                    <span
                      ref={accent2Ref}
                      className="headline-accent text-white font-serif italic inline-block"
                    >
                      {heroContent.yellowAccentLetter}
                    </span>
                    {heroContent.yellowSuffix}
                  </span>
                </span>
              </h1>

              {/* Subtext and "Explore Kognitics" CTA */}
              <div ref={subtextCtaRef} className="mt-5 sm:mt-6 flex flex-col items-center">
                <p className="text-sm sm:text-base md:text-lg text-white/90 font-sans font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
                  {heroContent.subtext}
                </p>

                <div className="mt-6 sm:mt-8 flex justify-center">
                  <MagneticButton
                    href={heroContent.ctaHref}
                    variant="primary"
                    isMagnetic
                    className="text-base px-7 py-3.5 shadow-2xl"
                  >
                    {heroContent.ctaText}
                  </MagneticButton>
                </div>
              </div>
            </div>

            {/* Bottom Bar: "Scroll to explore" & Tagline */}
            <div
              ref={bottomBarRef}
              className="w-full pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-white/80"
            >
              <a
                href="#universe"
                className="group inline-flex items-center gap-2 hover:text-yellow-golden transition-colors"
              >
                <span className="w-5 h-5 rounded-full border border-white/25 flex items-center justify-center group-hover:border-yellow-golden transition-colors">
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                </span>
                <span>{heroContent.scrollCueText}</span>
              </a>

              <div className="tracking-wide uppercase text-[11px] sm:text-xs font-sans text-white/70 text-center sm:text-right">
                {heroContent.tagline}
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
