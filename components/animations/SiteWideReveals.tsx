"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  (window as any).gsap = gsap;
  (window as any).ScrollTrigger = ScrollTrigger;
}

export function SiteWideReveals() {
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion) {
      gsap.set(".batch-slide-left, .batch-slide-right, .batch-reveal-text, .batch-card-left, .batch-card-right", {
        x: 0,
        y: 0,
        opacity: 1,
        clearProps: "all",
      });
      return;
    }

    // Set initial hidden states strictly via transform and opacity
    gsap.set(".batch-slide-left", { x: -80, opacity: 0 });
    gsap.set(".batch-slide-right", { x: 80, opacity: 0 });
    gsap.set(".batch-card-left", { x: -80, opacity: 0 });
    gsap.set(".batch-card-right", { x: 80, opacity: 0 });
    gsap.set(".batch-reveal-text", { y: 40, opacity: 0 });

    // 1. Left-column & Odd items: slide in from left (x: -80 to 0)
    const batchLeft = ScrollTrigger.batch(".batch-slide-left, .batch-card-left", {
      start: "top 85%",
      onEnter: (batch) => {
        gsap.to(batch, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
      onLeaveBack: (batch) => {
        gsap.to(batch, {
          x: -80,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.04,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
    });

    // 2. Right-column & Even items: slide in from right (x: 80 to 0)
    const batchRight = ScrollTrigger.batch(".batch-slide-right, .batch-card-right", {
      start: "top 85%",
      onEnter: (batch) => {
        gsap.to(batch, {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
      onLeaveBack: (batch) => {
        gsap.to(batch, {
          x: 80,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.04,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
    });

    // 3. Headlines and paragraphs: appear with y: 40 to 0, opacity: 0 to 1
    const batchText = ScrollTrigger.batch(".batch-reveal-text", {
      start: "top 85%",
      onEnter: (batch) => {
        gsap.to(batch, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.08,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
      onLeaveBack: (batch) => {
        gsap.to(batch, {
          y: 40,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.04,
          overwrite: "auto",
          onStart: () => gsap.set(batch, { willChange: "transform, opacity" }),
          onComplete: () => gsap.set(batch, { willChange: "auto" }),
        });
      },
    });

    ScrollTrigger.refresh();

    return () => {
      batchLeft.forEach((b) => b.kill());
      batchRight.forEach((b) => b.kill());
      batchText.forEach((b) => b.kill());
    };
  }, [prefersReducedMotion]);

  return null;
}
