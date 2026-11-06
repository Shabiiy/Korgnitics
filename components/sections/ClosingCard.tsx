"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { footerContent } from "@/content/footer";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { TagChip } from "@/components/ui/TagChip";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function ClosingCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const footerLinksRef = useRef<HTMLDivElement | null>(null);
  const { prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;

    // Card expands from inset card (scale 0.92, radius 48px) to nearly full width (scale 1.0, radius 24px)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 85%",
        end: "top 30%",
        scrub: true,
      },
    });

    tl.fromTo(
      cardRef.current,
      { scale: 0.92, borderRadius: "48px" },
      { scale: 1.0, borderRadius: "24px", ease: "power2.out" }
    );

    if (footerLinksRef.current) {
      gsap.fromTo(
        footerLinksRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          scrollTrigger: {
            trigger: footerLinksRef.current,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, [prefersReducedMotion]);

  return (
    <footer id="connect" className="relative w-full pt-10 pb-12 px-3 sm:px-6 md:px-8">
      {/* Expanding Closing Card with Reception Photo Background */}
      <div
        ref={cardRef}
        className="relative min-h-[580px] sm:min-h-[640px] rounded-kcard overflow-hidden bg-indigo-deep text-white border border-indigo/40 shadow-2xl flex flex-col justify-between p-6 sm:p-12 md:p-16 mx-auto max-w-7xl"
      >
        {/* Campus Reception Photo Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={footerContent.closingCard.backgroundImage}
            alt="Kognitics Campus Reception"
            fill
            className="object-cover scale-105"
          />
          {/* Indigo Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-deep via-indigo-deep/85 to-indigo-deep/75" />
          <div className="absolute inset-0 bg-indigo-deep/30" />
        </div>

        {/* Top Tag */}
        <div className="pt-4">
          <TagChip variant="yellow">Admissions 2026–2027</TagChip>
        </div>

        {/* Center Content */}
        <div ref={contentRef} className="my-auto py-8 max-w-3xl">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-sans font-light tracking-tightest leading-tight text-white mb-6">
            {footerContent.closingCard.headlinePrefix}{" "}
            <span className="headline-accent text-yellow-golden font-serif italic">
              {footerContent.closingCard.headlineAccentLetter}
            </span>
            {footerContent.closingCard.headlineSuffix}
          </h2>

          <p className="text-base sm:text-xl text-light-text/90 font-sans font-normal leading-relaxed mb-8 max-w-2xl">
            {footerContent.closingCard.subtext}
          </p>

          <div>
            <MagneticButton
              href={footerContent.closingCard.ctaHref}
              variant="primary"
              isMagnetic
              className="text-base sm:text-lg px-8 py-3.5"
            >
              {footerContent.closingCard.ctaLabel}
            </MagneticButton>
          </div>
        </div>

        {/* Bottom Section: Footer Grid & Logo */}
        <div ref={footerLinksRef} className="pt-12 border-t border-white/15">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-sm font-sans">
            {/* Col 1 */}
            <div>
              <div className="text-xs uppercase tracking-wider text-yellow-golden font-semibold mb-4">
                {footerContent.linksCol1.title}
              </div>
              <ul className="flex flex-col gap-2.5 text-light-text/80">
                {footerContent.linksCol1.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2 */}
            <div>
              <div className="text-xs uppercase tracking-wider text-yellow-golden font-semibold mb-4">
                {footerContent.linksCol2.title}
              </div>
              <ul className="flex flex-col gap-2.5 text-light-text/80">
                {footerContent.linksCol2.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <div className="text-xs uppercase tracking-wider text-yellow-golden font-semibold mb-4">
                {footerContent.linksCol3.title}
              </div>
              <ul className="flex flex-col gap-2.5 text-light-text/80">
                {footerContent.linksCol3.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact Placeholders */}
            <div>
              <div className="text-xs uppercase tracking-wider text-yellow-golden font-semibold mb-4">
                Campus Location
              </div>
              <div className="flex flex-col gap-2 text-xs text-light-text/80 leading-relaxed">
                <p className="text-white font-medium">{footerContent.contact.location}</p>
                <p>Phone: {footerContent.contact.phone}</p>
                <p>Email: {footerContent.contact.email}</p>
                <p>Hours: {footerContent.contact.officeHours}</p>
              </div>
            </div>
          </div>

          {/* White Logo & Copyright Row */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* White transparent logo */}
            <div className="relative w-44 sm:w-56 h-11">
              <Image
                src="/assets/logo-white.png"
                alt="Kognitics The International School"
                fill
                className="object-contain object-left"
              />
            </div>

            <p className="text-xs text-light-text/60 font-sans text-center sm:text-right">
              {footerContent.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

