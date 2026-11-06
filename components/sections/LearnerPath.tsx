"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { learnerPathContent } from "@/content/learnerPath";
import { TagChip } from "@/components/ui/TagChip";
import { ChevronDown, Play, Pause } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 191;

export function LearnerPath() {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const headerUiRef = useRef<HTMLDivElement | null>(null);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const stageNumberRef = useRef<HTMLSpanElement | null>(null);
  const stageGradesRef = useRef<HTMLSpanElement | null>(null);
  const stageTitleRef = useRef<HTMLHeadingElement | null>(null);
  const stageDescRef = useRef<HTMLParagraphElement | null>(null);
  const stageMilestonesRef = useRef<HTMLDivElement | null>(null);
  const stageLabelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const segmentFillsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [isPlayingManual, setIsPlayingManual] = useState(false);

  const { lenis, prefersReducedMotion } = useSmoothScroll();

  // Frame cache and progressive loading refs
  const framesRef = useRef<(ImageBitmap | HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  const isMobileRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const isInViewRef = useRef(false);
  const preWarmStartedRef = useRef(false);
  const lastDrawnFrameRef = useRef(-1);

  // Scrub targets for rAF lerp loop (completely decoupled from React state)
  const targetProgressRef = useRef(0); // 0.0 to 1.0 (Phase C)
  const prevTargetProgressRef = useRef(0);
  const lerpedProgressRef = useRef(0);
  const currentStageIdxRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // Draw frame on canvas with object-fit: cover logic
  // -------------------------------------------------------------
  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let img = framesRef.current[frameIdx];

    // If target frame not loaded yet, fallback to nearest loaded frame
    if (!img) {
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        if (frameIdx - offset >= 0 && framesRef.current[frameIdx - offset]) {
          img = framesRef.current[frameIdx - offset];
          break;
        }
        if (frameIdx + offset < TOTAL_FRAMES && framesRef.current[frameIdx + offset]) {
          img = framesRef.current[frameIdx + offset];
          break;
        }
      }
    }

    if (!img) return;

    const cW = canvas.width;
    const cH = canvas.height;
    const iW = img.width;
    const iH = img.height;

    // Cover calculations
    const scale = Math.max(cW / iW, cH / iH);
    const drawW = iW * scale;
    const drawH = iH * scale;
    const dx = (cW - drawW) * 0.5;
    const dy = (cH - drawH) * 0.5;

    ctx.drawImage(img, dx, dy, drawW, drawH);
    lastDrawnFrameRef.current = frameIdx;
  }, []);

  // -------------------------------------------------------------
  // Update stage card content with quick cross-fade
  // -------------------------------------------------------------
  const updateStageCard = useCallback((stageIdx: number) => {
    const stage = learnerPathContent.stages[stageIdx];
    if (!stage) return;

    // Update timeline step labels
    stageLabelsRef.current.forEach((label, idx) => {
      if (!label) return;
      if (idx === stageIdx) {
        label.classList.remove("text-white/60");
        label.classList.add("text-yellow-golden");
      } else {
        label.classList.remove("text-yellow-golden");
        label.classList.add("text-white/60");
      }
    });

    const card = stageCardRef.current;
    if (!card) return;

    // Quick cross-fade
    gsap.to(card, {
      opacity: 0.25,
      y: 4,
      duration: 0.1,
      ease: "power1.out",
      onComplete: () => {
        if (stageNumberRef.current) stageNumberRef.current.textContent = `Stage ${stage.number}`;
        if (stageGradesRef.current) stageGradesRef.current.textContent = stage.grades;
        if (stageTitleRef.current) stageTitleRef.current.textContent = stage.title;
        if (stageDescRef.current) stageDescRef.current.textContent = stage.description;

        if (stageMilestonesRef.current) {
          stageMilestonesRef.current.innerHTML = stage.milestones
            .map(
              (m) =>
                `<span class="text-[10px] px-2 py-0.5 rounded-[4px] bg-white/10 text-white/90 border border-white/15 font-sans backdrop-blur-sm">${m}</span>`
            )
            .join("");
        }

        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.15,
          ease: "power1.out",
        });
      },
    });
  }, []);

  // -------------------------------------------------------------
  // Preload frames (FIX 4 - Pre-warm 2 viewports ahead)
  // -------------------------------------------------------------
  const startPrewarming = useCallback(() => {
    if (preWarmStartedRef.current || isUnmountedRef.current) return;
    preWarmStartedRef.current = true;

    const mobile = window.innerWidth < 768;
    const framesDir = mobile ? "/journey-frames-sm" : "/journey-frames";
    const getPath = (idx: number) =>
      `${framesDir}/frame_${String(idx + 1).padStart(4, "0")}.webp`;

    const loadRemainingFrames = async () => {
      const batchSize = 6;
      for (let i = 1; i < TOTAL_FRAMES; i += batchSize) {
        if (isUnmountedRef.current) break;
        const batch: Promise<void>[] = [];

        for (let j = i; j < Math.min(TOTAL_FRAMES, i + batchSize); j++) {
          batch.push(
            (async (index) => {
              try {
                const res = await fetch(getPath(index));
                const blob = await res.blob();
                const bmp = await createImageBitmap(blob);
                if (!isUnmountedRef.current) {
                  framesRef.current[index] = bmp;
                }
              } catch {
                const img = new Image();
                img.src = getPath(index);
                img.onload = () => {
                  if (!isUnmountedRef.current) {
                    framesRef.current[index] = img;
                  }
                };
              }
            })(j)
          );
        }

        await Promise.all(batch);
      }
    };

    loadRemainingFrames();
  }, []);

  useEffect(() => {
    isUnmountedRef.current = false;
    const mobile = window.innerWidth < 768;
    isMobileRef.current = mobile;
    const framesDir = mobile ? "/journey-frames-sm" : "/journey-frames";

    const getPath = (idx: number) =>
      `${framesDir}/frame_${String(idx + 1).padStart(4, "0")}.webp`;

    // 1. Immediately load frame 0 and pre-render before section arrives (FIX 4)
    const firstImg = new Image();
    firstImg.src = getPath(0);
    firstImg.onload = async () => {
      if (isUnmountedRef.current) return;
      try {
        const bmp = await createImageBitmap(firstImg);
        framesRef.current[0] = bmp;
      } catch {
        framesRef.current[0] = firstImg;
      }
      drawFrame(0);
    };

    // Idle pre-warm fallback if user remains at top of page
    const idleTimer = setTimeout(() => {
      startPrewarming();
    }, 1200);

    return () => {
      isUnmountedRef.current = true;
      clearTimeout(idleTimer);
    };
  }, [drawFrame, startPrewarming]);

  // -------------------------------------------------------------
  // Canvas resize handler (DPR capped at 2)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const newW = Math.round(rect.width * dpr);
      const newH = Math.round(rect.height * dpr);
      if (canvas.width !== newW || canvas.height !== newH) {
        canvas.width = newW;
        canvas.height = newH;
      }
      if (lastDrawnFrameRef.current >= 0) {
        drawFrame(lastDrawnFrameRef.current);
      } else {
        drawFrame(0);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // -------------------------------------------------------------
  // Component-owned rAF lerp loop (FIX 2: lerp factor ~0.12)
  // - Starts ahead of boundary so ticker is warm before entry
  // - Directly drives timeline transform: scaleX() continuously
  // - Pauses only when fully out of view
  // -------------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion) return;

    const tick = () => {
      if (isInViewRef.current && !prefersReducedMotion) {
        const target = targetProgressRef.current;
        const current = lerpedProgressRef.current;
        // Cinematic progress lerp smoothing (factor 0.14)
        const nextProg = current + (target - current) * 0.14;
        lerpedProgressRef.current = nextProg;

        // 1. Draw frame if index changed
        const targetFrame = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(nextProg * (TOTAL_FRAMES - 1)))
        );
        if (targetFrame !== lastDrawnFrameRef.current) {
          drawFrame(targetFrame);
        }

        // 2. Smoothly fill timeline bar segments with transform: scaleX()
        for (let i = 0; i < 4; i++) {
          const fillEl = segmentFillsRef.current[i];
          if (fillEl) {
            const fill = Math.max(0, Math.min(1, nextProg * 4 - i));
            fillEl.style.transform = `scaleX(${fill})`;
          }
        }

        // 3. Stage index change detection
        const stageIdx = Math.min(3, Math.floor(nextProg * 4));
        if (stageIdx !== currentStageIdxRef.current) {
          currentStageIdxRef.current = stageIdx;
          updateStageCard(stageIdx);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [prefersReducedMotion, drawFrame, updateStageCard]);

  // -------------------------------------------------------------
  // Uniform Expand & Shrink function (PART 1 - Exact Hero Match)
  // -------------------------------------------------------------
  const applyUniformClip = useCallback((p: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const isMobile = window.innerWidth < 768;
    const cardInset = isMobile ? 12 : 20; // Exact match to Hero
    const cardRadius = isMobile ? 20 : 24; // Exact match to Hero

    let inset = 0;
    let radius = 0;

    if (p < 0.2) {
      // Phase B: Expand (0.0 -> 0.20)
      const pExp = Math.max(0, Math.min(1, p / 0.2));
      inset = Math.round((1 - pExp) * cardInset);
      radius = Math.round((1 - pExp) * cardRadius);
    } else if (p <= 0.8) {
      // Phase C: Full-bleed
      inset = 0;
      radius = 0;
    } else {
      // Phase D: Shrink (0.80 -> 1.00)
      const pShr = Math.max(0, Math.min(1, (p - 0.8) / 0.2));
      inset = Math.round(pShr * cardInset);
      radius = Math.round(pShr * cardRadius);
    }

    wrapper.style.clipPath = `inset(${inset}px round ${radius}px)`;
  }, []);

  // -------------------------------------------------------------
  // GSAP ScrollTrigger Sequence with Boundary Jank Elimination
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 1024;
    const initialInset = window.innerWidth < 768
      ? "inset(12px round 20px)"
      : "inset(20px round 24px)";

    const ctx = gsap.context(() => {
      gsap.set(wrapper, {
        clipPath: initialInset,
      });

      if (headerUiRef.current) {
        gsap.set(headerUiRef.current, { opacity: 1, y: 0 });
      }

      // FIX 4: Pre-warm frames 2 viewports ahead of entry
      ScrollTrigger.create({
        trigger: container,
        start: "top bottom+=200%",
        once: true,
        onEnter: () => {
          startPrewarming();
        },
      });

      // FIX 4: Approach Trigger: warm rAF loop and promote layer BEFORE crossing pin boundary
      ScrollTrigger.create({
        trigger: container,
        start: "top bottom+=150px",
        end: () => "+=" + (window.innerHeight * 5.5 + 300),
        onEnter: () => {
          isInViewRef.current = true;
          if (wrapperRef.current) wrapperRef.current.style.willChange = "clip-path";
        },
        onLeave: () => {
          isInViewRef.current = false;
          if (wrapperRef.current) wrapperRef.current.style.willChange = "auto";
        },
        onEnterBack: () => {
          isInViewRef.current = true;
          if (wrapperRef.current) wrapperRef.current.style.willChange = "clip-path";
        },
        onLeaveBack: () => {
          isInViewRef.current = false;
          if (wrapperRef.current) wrapperRef.current.style.willChange = "auto";
        },
      });

      // Master Timeline pinned for ~550vh (FIX 2: cinematic pin length)
      const pinDuration = isMobile ? window.innerHeight * 4 : window.innerHeight * 5.5;

      // Speed Ramp Ahead of Pin: Smoothly decelerate scroll velocity as section approaches
      // (Ramps wheelMultiplier 1.0 -> 0.65 across the viewport as the section enters)
      ScrollTrigger.create({
        trigger: container,
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

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "journey-video",
          trigger: container,
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
          },
          onUpdate: (self) => {
            const p = self.progress;

            // Apply uniform inset clip-path
            applyUniformClip(p);

            // Progress mapping to middle 60% of scroll (0.2 -> 0.8)
            let rawTarget = 0;
            if (p < 0.2) {
              rawTarget = 0;
            } else if (p <= 0.8) {
              rawTarget = (p - 0.2) / 0.6;
            } else {
              rawTarget = 1.0;
            }

            // Continuous target progress without artificial locking/truncating
            targetProgressRef.current = rawTarget;

            // Full-screen video mode: when p is between 0.16 and 0.84, video fills viewport (only logo visible)
            // When p < 0.16 or p > 0.84, video is in framed card state (navbar elements appear)
            const header = document.querySelector("header");
            if (header) {
              if (p >= 0.16 && p <= 0.84) {
                header.classList.add("fullscreen-video-mode");
              } else {
                header.classList.remove("fullscreen-video-mode");
              }
            }
          },
          onLeave: () => {
            const header = document.querySelector("header");
            if (header) header.classList.remove("fullscreen-video-mode");
          },
          onLeaveBack: () => {
            const header = document.querySelector("header");
            if (header) header.classList.remove("fullscreen-video-mode");
          },
        },
      });

      // 1. Phase B (0.0 -> 0.20): Fade out top header UI
      if (headerUiRef.current) {
        tl.to(
          headerUiRef.current,
          {
            opacity: 0,
            y: -24,
            ease: "power1.out",
            duration: 0.16,
          },
          0
        );
      }

      // 2. Phase C (0.20 -> 0.80): Middle scrub duration span
      tl.to({}, { duration: 0.6 }, 0.2);

      // 3. Phase D (0.80 -> 1.00): Fade in header UI
      if (headerUiRef.current) {
        tl.to(
          headerUiRef.current,
          {
            opacity: 1,
            y: 0,
            ease: "power1.in",
            duration: 0.16,
          },
          0.84
        );
      }

      // Speed Ramp After Pin: Smoothly accelerate back from 0.65 to 1.0 upon exit
      ScrollTrigger.create({
        start: () => (tl.scrollTrigger ? tl.scrollTrigger.end : 0),
        end: () => (tl.scrollTrigger ? tl.scrollTrigger.end : 0) + window.innerHeight * 0.4,
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
    }, container);

    return () => {
      ctx.revert();
      const st = ScrollTrigger.getById("journey-video");
      if (st) st.kill(true);
      const header = document.querySelector("header");
      if (header) header.classList.remove("fullscreen-video-mode");
      if (lenis) {
        lenis.options.wheelMultiplier = 1.0;
      }
    };
  }, [prefersReducedMotion, applyUniformClip, lenis, startPrewarming]);

  // Reduced motion manual play/pause
  const handleToggleManualPlay = () => {
    setIsPlayingManual((prev) => !prev);
  };

  const initialStage = learnerPathContent.stages[0];

  return (
    <section
      id="learner-path"
      ref={containerRef}
      className="relative w-full h-[100svh] min-h-[100svh] bg-yellow-cream overflow-hidden flex items-center justify-center [contain:paint]"
    >
      {/* 
        Canvas Wrapper (Part 1 & 2):
        - Stays strictly pinned at 100vw x 100vh and is NEVER scaled, resized or moved.
        - Only clipPath changes: inset = lerp(cardInsetPx, 0, progress) with border radius = lerp(24, 0, progress).
      */}
      <div
        ref={wrapperRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none pointer-events-none"
      >
        {/* High performance Canvas rendering with object-fit: cover */}
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Faint neutral bottom gradient (max 25% black) ONLY behind timeline bar */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/25 via-black/10 to-transparent pointer-events-none z-10" />

        {/* UI Overlay Container */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 md:p-12 pointer-events-none">
          {/* Top Header Row (Tag, Heading, Scroll Cue) - Spaced cleanly below navbar */}
          <div ref={headerUiRef} className="w-full pt-14 sm:pt-16 pointer-events-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TagChip variant="yellow">{learnerPathContent.sectionBadge}</TagChip>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] tracking-wide border border-white/20">
                <ChevronDown className="w-3.5 h-3.5 text-yellow-golden animate-bounce" />
                <span>{learnerPathContent.scrollCue}</span>
              </div>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tightest leading-tight text-white max-w-2xl mt-3 sm:mt-4 drop-shadow-md">
              {learnerPathContent.headingPart1} {learnerPathContent.headingPart2}{" "}
              <span className="headline-accent text-yellow-golden font-serif italic">
                {learnerPathContent.headingAccentLetter}
              </span>
              {learnerPathContent.headingPart3}
            </h2>
          </div>

          {/* 
            PART 3: Smaller & Neutral Semi-Transparent Frosted Glass Stage Info Card:
            - max-width: 330px, padding: 14px-16px, radius: 14px.
            - Pure neutral black frosted glass (rgba(0,0,0,0.50), NO blue overlay).
            - Enhanced backdrop blur (20px) for elegant transparency and soft optical diffusion.
            - Positioned bottom-left, comfortably clear of the child's face.
          */}
          <div
            ref={stageCardRef}
            className="pointer-events-auto max-w-[310px] sm:max-w-[335px] p-3.5 sm:p-4 rounded-[14px] border border-white/15 shadow-2xl transition-all duration-200"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.50)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Top Stage Header */}
            <div className="flex items-center justify-between text-yellow-golden text-xs font-sans font-medium mb-1">
              <span
                ref={stageNumberRef}
                className="tracking-wider uppercase text-[11px] sm:text-xs font-mono"
              >
                Stage {initialStage.number}
              </span>
              <span
                ref={stageGradesRef}
                className="px-2 py-0.5 rounded-full bg-yellow-golden/20 text-yellow-golden text-[10px] font-mono border border-yellow-golden/30"
              >
                {initialStage.grades}
              </span>
            </div>

            {/* Stage Title */}
            <h3
              ref={stageTitleRef}
              className="text-[19px] sm:text-[21px] font-sans font-light tracking-tight text-white mb-1 leading-snug"
            >
              {initialStage.title}
            </h3>

            {/* Stage Description (Neutral text, no lavender/blue hue) */}
            <p
              ref={stageDescRef}
              className="text-[12px] leading-[1.4] text-white/85 font-sans mb-2.5"
            >
              {initialStage.description}
            </p>

            {/* Milestone Chips (Neutral translucent glass pills) */}
            <div
              ref={stageMilestonesRef}
              className="flex flex-wrap gap-1 pt-2 border-t border-white/15"
            >
              {initialStage.milestones.map((milestone) => (
                <span
                  key={milestone}
                  className="text-[10px] px-2 py-0.5 rounded-[4px] bg-white/10 text-white/90 border border-white/15 font-sans backdrop-blur-sm"
                >
                  {milestone}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Area: 4-Step Continuous Timeline Bar */}
          <div className="w-full flex flex-col gap-4 pointer-events-auto z-20">
            {/* 
              4-Step Timeline Bar:
              - Fill driven by transform: scaleX() from rAF lerped progress
              - ZERO CSS width transitions, continuous and silky smooth
            */}
            <div className="w-full">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {learnerPathContent.stages.map((stage, idx) => (
                  <div key={stage.number} className="flex flex-col gap-1.5 select-none">
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        ref={(el) => {
                          segmentFillsRef.current[idx] = el;
                        }}
                        className="h-full bg-yellow-golden origin-left"
                        style={{
                          transform: "scaleX(0)",
                          transformOrigin: "left",
                          willChange: "transform",
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span
                        ref={(el) => {
                          stageLabelsRef.current[idx] = el;
                        }}
                        className={`font-mono font-medium ${
                          idx === 0 ? "text-yellow-golden" : "text-white/60"
                        }`}
                      >
                        {stage.number}
                      </span>
                      <span className="hidden sm:inline font-sans text-white/50">
                        {stage.grades}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reduced Motion Controls */}
        {prefersReducedMotion && (
          <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={handleToggleManualPlay}
              className="p-3 rounded-full bg-yellow-golden text-indigo-deep shadow-lg hover:brightness-105"
              aria-label={isPlayingManual ? "Pause video" : "Play video"}
            >
              {isPlayingManual ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
