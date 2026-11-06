"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

interface HeadlineProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  delay?: number;
  triggerOnScroll?: boolean;
}

export function Headline({
  children,
  className = "",
  as: Component = "h2",
  delay = 0,
  triggerOnScroll = true,
}: HeadlineProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const words = containerRef.current.querySelectorAll(".anim-word");
    const accents = containerRef.current.querySelectorAll(".headline-accent");

    if (words.length === 0) return;

    gsap.set(words, { y: "115%", opacity: 0 });
    if (accents.length > 0) {
      gsap.set(accents, { opacity: 0, scale: 0.85 });
    }

    const tl = gsap.timeline({
      delay: delay,
      scrollTrigger: triggerOnScroll
        ? {
            trigger: containerRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          }
        : undefined,
    });

    tl.to(words, {
      y: "0%",
      opacity: 1,
      duration: 0.85,
      stagger: 0.06,
      ease: "power3.out",
    });

    if (accents.length > 0) {
      tl.to(
        accents,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    return () => {
      tl.kill();
    };
  }, [delay, triggerOnScroll, prefersReducedMotion]);

  return (
    <Component
      ref={containerRef as any}
      className={`font-sans font-light tracking-tightest leading-tight ${className}`}
    >
      {children}
    </Component>
  );
}

/**
 * Helper to split text into animated words while isolating a specific single letter for the Instrument Serif accent.
 */
export function SplitHeadline({
  text,
  accentLetter,
  accentOccurrence = 1,
  className = "",
}: {
  text: string;
  accentLetter?: string;
  accentOccurrence?: number;
  className?: string;
}) {
  const words = text.split(" ");
  let occurrenceCount = 0;

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => {
        // Check if accentLetter is in this word
        let renderedWord: React.ReactNode = word;

        if (accentLetter && word.toLowerCase().includes(accentLetter.toLowerCase())) {
          const matchIdx = word.toLowerCase().indexOf(accentLetter.toLowerCase());
          occurrenceCount++;

          if (occurrenceCount === accentOccurrence) {
            const before = word.slice(0, matchIdx);
            const letter = word.slice(matchIdx, matchIdx + 1);
            const after = word.slice(matchIdx + 1);

            renderedWord = (
              <>
                {before}
                <span className="headline-accent text-yellow-golden font-serif italic text-[1.18em] font-normal inline-block">
                  {letter}
                </span>
                {after}
              </>
            );
          }
        }

        return (
          <span key={wordIndex} className="inline-block overflow-hidden mr-[0.25em] align-top">
            <span className="anim-word inline-block">{renderedWord}</span>
          </span>
        );
      })}
    </span>
  );
}

