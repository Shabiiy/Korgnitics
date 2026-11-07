"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { universeContent } from "@/content/universe";
import { TagChip } from "@/components/ui/TagChip";
import { MagneticButton } from "@/components/ui/MagneticButton";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

// Card styling config matching prompt requirements & high contrast
const CARD_THEMES = [
  {
    id: "thinking-first",
    bgClass: "bg-[#FFEBB0] text-[#25245A] border-[#EDD38A]",
    tagVariant: "cream" as const,
    titleColor: "text-[#25245A]",
    bodyColor: "text-[#4A4A72]",
    buttonVariant: "secondary" as const,
  },
  {
    id: "skills-values",
    bgClass: "bg-[#25245A] text-white border-[#3B3A82]/50",
    tagVariant: "indigo" as const,
    titleColor: "text-white",
    bodyColor: "text-[#E4E3F5]/85",
    buttonVariant: "primary" as const,
  },
  {
    id: "every-child-seen",
    bgClass: "bg-[#FDB92E] text-[#25245A] border-[#EDD38A]",
    tagVariant: "cream" as const,
    titleColor: "text-[#25245A]",
    bodyColor: "text-[#25245A]/90",
    buttonVariant: "secondary" as const,
  },
];

export function Universe() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const startSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targetSlotRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const photoWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const miniTitleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const expandedTextRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { lenis, prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    const section = sectionRef.current;
    const gridContainer = gridContainerRef.current;
    const targetSlot = targetSlotRef.current;
    if (!section || !gridContainer || !targetSlot) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ========================================================
      // DESKTOP: >= 1024px (Morphing Cards Scrub & Stacked Deck)
      // ========================================================
      mm.add("(min-width: 1024px)", () => {
        if (prefersReducedMotion) {
          // Reduced motion: show cards in clean stacked deck without scroll scrub
          const containerRect = gridContainer.getBoundingClientRect();
          const targetRect = targetSlot.getBoundingClientRect();
          const endX = targetRect.left - containerRect.left;
          const endY = targetRect.top - containerRect.top;
          const endW = targetRect.width;
          const endH = targetRect.height;
          const photoSize = Math.min(210, Math.max(170, endH - 50));
          const photoEndX = Math.round(endW - photoSize - 36);
          const photoEndY = Math.round((endH - photoSize) / 2);

          cardRefs.current.forEach((cardEl, idx) => {
            if (!cardEl) return;
            const stackOffset = (2 - idx) * -10;
            const stackScale = 1 - (2 - idx) * 0.04;

            gsap.set(cardEl, {
              x: endX,
              y: endY + stackOffset,
              width: endW,
              height: endH,
              scale: stackScale,
              transformOrigin: "top center",
              borderRadius: 24,
              opacity: idx === 2 ? 1 : 0.75,
            });

            const miniTitle = miniTitleRefs.current[idx];
            if (miniTitle) gsap.set(miniTitle, { opacity: 0, display: "none" });

            const expandedText = expandedTextRefs.current[idx];
            if (expandedText) {
              gsap.set(expandedText.querySelectorAll(".fade-slide-el"), {
                opacity: 1,
                x: 0,
                y: 0,
                pointerEvents: "auto",
              });
            }

            const photoWrapper = photoWrapperRefs.current[idx];
            if (photoWrapper) {
              gsap.set(photoWrapper, {
                top: photoEndY,
                left: photoEndX,
                width: photoSize,
                height: photoSize,
              });
            }
          });
          return;
        }

        // Measure start slots (mini) and single target slot (stacked deck) relative to gridContainer
        const getMeasurements = () => {
          if (!gridContainerRef.current || !targetSlotRef.current) return null;
          const containerRect = gridContainerRef.current.getBoundingClientRect();
          const targetRect = targetSlotRef.current.getBoundingClientRect();

          const endX = targetRect.left - containerRect.left;
          const endY = targetRect.top - containerRect.top;
          const endW = targetRect.width;
          const endH = targetRect.height;

          // Dedicated square icon container perfectly centered in the middle of the right column
          const photoSize = Math.min(210, Math.max(170, endH - 50));
          const photoW = photoSize;
          const photoH = photoSize;
          const photoEndX = Math.round(endW - photoW - 36);
          const photoEndY = Math.round((endH - photoH) / 2);

          const cardsData = [0, 1, 2].map((idx) => {
            const startEl = startSlotRefs.current[idx];
            if (!startEl) return null;
            const startRect = startEl.getBoundingClientRect();
            const startIconSize = Math.min(startRect.width - 32, 92);

            return {
              startX: startRect.left - containerRect.left,
              startY: startRect.top - containerRect.top,
              startW: startRect.width,
              startH: startRect.height,
              photoStartW: startIconSize,
              photoStartH: startIconSize,
              photoStartX: Math.round((startRect.width - startIconSize) / 2),
              photoStartY: 16,
            };
          });

          if (cardsData.some((d) => !d)) return null;

          return {
            cards: cardsData as NonNullable<(typeof cardsData)[0]>[],
            endX,
            endY,
            endW,
            endH,
            photoW,
            photoH,
            photoEndX,
            photoEndY,
          };
        };

        const m = getMeasurements();
        if (!m) return;

        // Set initial states for all 3 cards in their Collapsed Mini Slots
        cardRefs.current.forEach((cardEl, idx) => {
          const cardData = m.cards[idx];
          if (!cardEl || !cardData) return;

          // Card starts at mini slot position and size
          gsap.set(cardEl, {
            x: cardData.startX,
            y: cardData.startY,
            width: cardData.startW,
            height: cardData.startH,
            scale: 1,
            opacity: 1,
            transformOrigin: "top center",
            borderRadius: 20,
            willChange: "transform, width, height",
          });

          // Mini Title is visible
          const miniTitle = miniTitleRefs.current[idx];
          if (miniTitle) {
            gsap.set(miniTitle, { opacity: 1, x: 0, y: 0 });
          }

          // Photo wrapper starts at top of mini card centered
          const photoWrapper = photoWrapperRefs.current[idx];
          if (photoWrapper) {
            gsap.set(photoWrapper, {
              top: cardData.photoStartY,
              left: cardData.photoStartX,
              width: cardData.photoStartW,
              height: cardData.photoStartH,
            });
          }

          // Expanded text (tag, title, body, button) starts hidden and offset to the left (-35px)
          const expandedText = expandedTextRefs.current[idx];
          if (expandedText) {
            gsap.set(expandedText.querySelectorAll(".fade-slide-el"), {
              opacity: 0,
              x: -35,
              y: 0,
              pointerEvents: "none",
            });
          }
        });

        const pinDuration = window.innerHeight * 2.5;

        // Speed Ramp Ahead of Pin: Smoothly decelerate scroll velocity as section approaches
        // (Ramps wheelMultiplier 1.0 -> 0.65 across the viewport as the section enters)
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            if (!lenis) return;
            const eased = 1.0 - 0.35 * Math.pow(self.progress, 1.2);
            lenis.options.wheelMultiplier = eased;
          },
          onLeave: () => {
            if (lenis) lenis.options.wheelMultiplier = 0.65;
          },
          onLeaveBack: () => {
            if (lenis) lenis.options.wheelMultiplier = 1.0;
          },
        });

        // Master Timeline pinned for ~250vh with 3 sequential segments (1.0 duration each)
        const masterTl = gsap.timeline({
          scrollTrigger: {
            id: "universe-pin",
            refreshPriority: 9,
            trigger: section,
            start: "top top",
            end: () => "+=" + pinDuration,
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              if (self.isActive && lenis) {
                lenis.options.wheelMultiplier = 0.65;
              }
              // 60fps performance optimization: only apply will-change while section is active
              cardRefs.current.forEach((cardEl) => {
                if (cardEl) {
                  cardEl.style.willChange = self.isActive
                    ? "transform, width, height"
                    : "auto";
                }
              });
            },
          },
        });

        // Speed Ramp After Pin: Smoothly accelerate back from 0.65 to 1.0 upon exit
        ScrollTrigger.create({
          start: () => (masterTl.scrollTrigger ? masterTl.scrollTrigger.end : 0),
          end: () => (masterTl.scrollTrigger ? masterTl.scrollTrigger.end : 0) + window.innerHeight * 0.4,
          scrub: true,
          onUpdate: (self) => {
            if (!lenis) return;
            const eased = 0.65 + 0.35 * Math.pow(self.progress, 1.2);
            lenis.options.wheelMultiplier = eased;
          },
          onLeave: () => {
            if (lenis) lenis.options.wheelMultiplier = 1.0;
          },
          onLeaveBack: () => {
            if (lenis) lenis.options.wheelMultiplier = 0.65;
          },
        });

        // =========================================================================
        // SEGMENT 1 (t = 0.0 to 1.0): Card 0 morphs from Mini Slot 0 to Target Slot
        // =========================================================================
        {
          const card0 = cardRefs.current[0];
          const photo0 = photoWrapperRefs.current[0];
          const miniTitle0 = miniTitleRefs.current[0];
          const expandedText0 = expandedTextRefs.current[0];
          const textEls0 = expandedText0?.querySelectorAll(".fade-slide-el") || [];

          if (card0 && photo0 && miniTitle0) {
            // Container morphs to Target Slot
            masterTl.to(
              card0,
              {
                x: m.endX,
                y: m.endY,
                width: m.endW,
                height: m.endH,
                borderRadius: 24,
                ease: "power3.inOut",
                duration: 1.0,
              },
              0
            );

            // Mini title fades and moves right
            masterTl.to(
              miniTitle0,
              {
                opacity: 0,
                x: 20,
                ease: "power2.out",
                duration: 0.35,
              },
              0
            );

            // Photo wrapper expands to right-hand middle position
            masterTl.to(
              photo0,
              {
                top: m.photoEndY,
                left: m.photoEndX,
                width: m.photoW,
                height: m.photoH,
                ease: "power3.inOut",
                duration: 1.0,
              },
              0
            );

            // Text elements reveal and MOVE RIGHT (x: -35 -> 0) as user scrolls down!
            masterTl.fromTo(
              textEls0,
              { opacity: 0, x: -35 },
              {
                opacity: 1,
                x: 0,
                stagger: 0.08,
                ease: "power2.out",
                duration: 0.55,
                onStart: () => {
                  textEls0.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "auto";
                  });
                },
                onReverseComplete: () => {
                  textEls0.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "none";
                  });
                },
              },
              0.35
            );
          }
        }

        // =========================================================================
        // SEGMENT 2 (t = 1.0 to 2.0): Card 1 morphs and stacks directly over Card 0
        // =========================================================================
        {
          const card1 = cardRefs.current[1];
          const photo1 = photoWrapperRefs.current[1];
          const miniTitle1 = miniTitleRefs.current[1];
          const expandedText1 = expandedTextRefs.current[1];
          const textEls1 = expandedText1?.querySelectorAll(".fade-slide-el") || [];
          const card0 = cardRefs.current[0];

          if (card1 && photo1 && miniTitle1) {
            // Container morphs to Target Slot
            masterTl.to(
              card1,
              {
                x: m.endX,
                y: m.endY,
                width: m.endW,
                height: m.endH,
                borderRadius: 24,
                ease: "power3.inOut",
                duration: 1.0,
              },
              1.0
            );

            // Mini title fades and moves right
            masterTl.to(
              miniTitle1,
              {
                opacity: 0,
                x: 20,
                ease: "power2.out",
                duration: 0.35,
              },
              1.0
            );

            // Photo wrapper expands to right-hand middle position
            masterTl.to(
              photo1,
              {
                top: m.photoEndY,
                left: m.photoEndX,
                width: m.photoW,
                height: m.photoH,
                ease: "power3.inOut",
                duration: 1.0,
              },
              1.0
            );

            // Text elements reveal and MOVE RIGHT (x: -35 -> 0)
            masterTl.fromTo(
              textEls1,
              { opacity: 0, x: -35 },
              {
                opacity: 1,
                x: 0,
                stagger: 0.08,
                ease: "power2.out",
                duration: 0.55,
                onStart: () => {
                  textEls1.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "auto";
                  });
                },
                onReverseComplete: () => {
                  textEls1.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "none";
                  });
                },
              },
              1.35
            );

            // Card 0 (underneath) transforms into stacked card deck position (scale 0.96, y -12px, opacity 0.70)
            if (card0) {
              masterTl.to(
                card0,
                {
                  scale: 0.96,
                  y: m.endY - 12,
                  opacity: 0.7,
                  ease: "power2.inOut",
                  duration: 0.8,
                },
                1.1
              );
            }
          }
        }

        // =========================================================================
        // SEGMENT 3 (t = 2.0 to 3.0): Card 2 morphs and stacks directly over Card 1
        // =========================================================================
        {
          const card2 = cardRefs.current[2];
          const photo2 = photoWrapperRefs.current[2];
          const miniTitle2 = miniTitleRefs.current[2];
          const expandedText2 = expandedTextRefs.current[2];
          const textEls2 = expandedText2?.querySelectorAll(".fade-slide-el") || [];
          const card1 = cardRefs.current[1];
          const card0 = cardRefs.current[0];

          if (card2 && photo2 && miniTitle2) {
            // Container morphs to Target Slot
            masterTl.to(
              card2,
              {
                x: m.endX,
                y: m.endY,
                width: m.endW,
                height: m.endH,
                borderRadius: 24,
                ease: "power3.inOut",
                duration: 1.0,
              },
              2.0
            );

            // Mini title fades and moves right
            masterTl.to(
              miniTitle2,
              {
                opacity: 0,
                x: 20,
                ease: "power2.out",
                duration: 0.35,
              },
              2.0
            );

            // Photo wrapper expands to right-hand middle position
            masterTl.to(
              photo2,
              {
                top: m.photoEndY,
                left: m.photoEndX,
                width: m.photoW,
                height: m.photoH,
                ease: "power3.inOut",
                duration: 1.0,
              },
              2.0
            );

            // Text elements reveal and MOVE RIGHT (x: -35 -> 0)
            masterTl.fromTo(
              textEls2,
              { opacity: 0, x: -35 },
              {
                opacity: 1,
                x: 0,
                stagger: 0.08,
                ease: "power2.out",
                duration: 0.55,
                onStart: () => {
                  textEls2.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "auto";
                  });
                },
                onReverseComplete: () => {
                  textEls2.forEach((el) => {
                    (el as HTMLElement).style.pointerEvents = "none";
                  });
                },
              },
              2.35
            );

            // Card 1 transforms into middle deck position (scale 0.96, y -12px, opacity 0.70)
            if (card1) {
              masterTl.to(
                card1,
                {
                  scale: 0.96,
                  y: m.endY - 12,
                  opacity: 0.7,
                  ease: "power2.inOut",
                  duration: 0.8,
                },
                2.1
              );
            }

            // Card 0 transforms into bottom deck position (scale 0.92, y -24px, opacity 0.40)
            if (card0) {
              masterTl.to(
                card0,
                {
                  scale: 0.92,
                  y: m.endY - 24,
                  opacity: 0.4,
                  ease: "power2.inOut",
                  duration: 0.8,
                },
                2.1
              );
            }
          }
        }
      });

      // ==========================================
      // MOBILE: < 1024px (Natural Stacked Flow)
      // ==========================================
      mm.add("(max-width: 1023px)", () => {
        cardRefs.current.forEach((cardEl, idx) => {
          if (!cardEl) return;
          gsap.fromTo(
            cardEl,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: idx * 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: cardEl,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      if (lenis) {
        lenis.options.wheelMultiplier = 1.0;
      }
    };
  }, [lenis, prefersReducedMotion]);

  return (
    <section
      id="universe"
      ref={sectionRef}
      className="relative w-full pt-20 sm:pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-center min-h-[100svh]"
    >
      <div className="w-full">
        {/* Section Tag */}
        <div className="mb-3">
          <TagChip variant="cream">{universeContent.sectionTag}</TagChip>
        </div>

        {/* Heading with inline photo and Instrument Serif accent */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-light tracking-tightest leading-tight text-indigo-deep mb-6 sm:mb-8">
          <span>{universeContent.headingPart1} </span>
          <span className="inline-block relative w-11 sm:w-14 lg:w-16 h-6 sm:h-8 lg:h-9 mx-1 align-middle rounded-full overflow-hidden border-2 border-yellow-border shadow-sm">
            <Image
              src={universeContent.inlineImageSrc}
              alt={universeContent.inlineImageAlt}
              fill
              className="object-cover"
            />
          </span>
          <span className="headline-accent text-yellow-golden font-serif italic">
            {universeContent.headingAccentLetter}
          </span>
          <span>{universeContent.headingPart2}</span>
        </h2>

        {/* 2-Column Grid Container */}
        <div
          ref={gridContainerRef}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left Column (5 cols): Intro paragraph + Collapsed Mini Slot Placeholders */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <p className="text-sm sm:text-base text-muted-text font-sans leading-relaxed">
              {universeContent.introParagraph}
            </p>

            {/* 3 Mini Slot Placeholders (Desktop only - hold geometric start positions) */}
            <div className="hidden lg:grid grid-cols-3 gap-3 items-stretch pt-2">
              {[0, 1, 2].map((idx) => {
                const card = universeContent.cards[idx];
                return (
                  <div
                    key={`start-slot-${idx}`}
                    ref={(el) => {
                      startSlotRefs.current[idx] = el;
                    }}
                    className="h-[165px] rounded-[20px] border border-dashed border-[#EDD38A]/50 bg-[#EDD38A]/10 transition-opacity duration-300 relative overflow-hidden flex flex-col items-center justify-center p-3"
                    aria-hidden="true"
                  >
                    {/* Ghost Icon Preview */}
                    <div className="w-10 h-10 relative opacity-25 mb-2">
                      <Image
                        src={card.iconSrc}
                        alt=""
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-muted-text/60 font-sans font-medium uppercase tracking-wider text-center truncate">
                      {idx === 0 ? "01 Think" : idx === 1 ? "02 Skill" : "03 Seen"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (7 cols): Single Target Slot for the Stacked Card Deck */}
          <div className="hidden lg:block lg:col-span-7 relative">
            {/* Target Slot Placeholder Container */}
            <div
              ref={targetSlotRef}
              className="w-full h-[275px] xl:h-[285px] rounded-[24px] border border-dashed border-[#EDD38A]/35 bg-[#FFEBB0]/5 pointer-events-none relative shadow-xs"
              aria-hidden="true"
            >
              {/* Stack depth visual hint */}
              <div className="absolute -top-2.5 left-3 right-3 h-2.5 rounded-t-[20px] border-t border-x border-[#EDD38A]/20 bg-[#FFEBB0]/5" />
              <div className="absolute -top-5 left-6 right-6 h-2.5 rounded-t-[18px] border-t border-x border-[#EDD38A]/15 bg-[#FFEBB0]/5" />
            </div>
          </div>

          {/* 
            The 3 Morphing Cards:
            - On Desktop (>= 1024px): absolutely positioned inside gridContainer, morphing from start slots to stacked target slot
            - On Mobile (< 1024px): rendered in natural document flow
          */}
          <div className="lg:contents">
            {universeContent.cards.map((card, idx) => {
              const theme = CARD_THEMES[idx] || CARD_THEMES[0];
              return (
                <div
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  className={`relative lg:absolute lg:top-0 lg:left-0 rounded-[20px] lg:rounded-[24px] border shadow-lg overflow-hidden transition-shadow duration-300 ${
                    theme.bgClass
                  } ${idx > 0 ? "mt-6 lg:mt-0" : ""}`}
                  style={{ zIndex: 10 + idx * 10 }}
                >
                  {/* 1. Mini Title (Visible in Collapsed Mini State, moves right & fades in first 35%) */}
                  <div
                    ref={(el) => {
                      miniTitleRefs.current[idx] = el;
                    }}
                    className="hidden lg:block absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none text-center"
                  >
                    <h4
                      className={`text-xs font-sans font-medium tracking-tight leading-tight truncate ${theme.titleColor}`}
                    >
                      {card.title}
                    </h4>
                  </div>

                  {/* 2. Transparent Icon Graphic (NO box outlay, NO blue overlay, perfectly centered) */}
                  <div
                    ref={(el) => {
                      photoWrapperRefs.current[idx] = el;
                    }}
                    className="relative lg:absolute w-full h-44 sm:h-52 lg:h-auto overflow-visible flex items-center justify-center flex-shrink-0 pointer-events-none select-none"
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Image
                        src={theme.id === "skills-values" ? card.iconLightSrc : card.iconSrc}
                        alt={card.imageAlt}
                        fill
                        priority={idx === 0}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* 3. Expanded State Content (Tag, Title, Body, Button - text moves right during scroll) */}
                  <div
                    ref={(el) => {
                      expandedTextRefs.current[idx] = el;
                    }}
                    className="relative z-10 w-full lg:max-w-[calc(100%-250px)] p-5 sm:p-6 flex flex-col justify-between h-full"
                  >
                    <div>
                      {/* Tag Chip */}
                      <div className="fade-slide-el mb-2 inline-block">
                        <TagChip variant={theme.tagVariant} className="text-xs py-0.5 px-2.5">
                          {card.tag}
                        </TagChip>
                      </div>

                      {/* Headline (Inter 300) */}
                      <h3
                        className={`fade-slide-el text-xl sm:text-2xl lg:text-[25px] font-sans font-light tracking-tightest leading-snug ${theme.titleColor}`}
                      >
                        {card.title}
                      </h3>

                      {/* Body text */}
                      <p
                        className={`fade-slide-el mt-2 text-xs sm:text-[13px] leading-relaxed line-clamp-3 ${theme.bodyColor}`}
                      >
                        {card.description}
                      </p>
                    </div>

                    {/* Learn More Button */}
                    <div className="fade-slide-el mt-4">
                      <MagneticButton
                        href="#learner-path"
                        variant={theme.buttonVariant}
                        isMagnetic
                        className="text-xs px-4 py-2"
                      >
                        Learn More
                      </MagneticButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
