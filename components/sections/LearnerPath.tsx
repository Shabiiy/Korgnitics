"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { learnerPathContent } from "@/content/learnerPath";
import { TagChip } from "@/components/ui/TagChip";
import { ChevronDown, Play, Pause, RotateCcw } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

gsap.registerPlugin(ScrollTrigger);

export function LearnerPath() {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const headerUiRef = useRef<HTMLDivElement | null>(null);
  const stageCardRef = useRef<HTMLDivElement | null>(null);
  const timelineBarRef = useRef<HTMLDivElement | null>(null);
  const replayBtnRef = useRef<HTMLDivElement | null>(null);

  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [normalizedProgress, setNormalizedProgress] = useState(0); // 0.0 to 1.0 within Phase C
  const [scrollPhase, setScrollPhase] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [isReplaying, setIsReplaying] = useState(false);
  const [isPlayingManual, setIsPlayingManual] = useState(false); // For reduced motion

  const { lenis, prefersReducedMotion } = useSmoothScroll();

  // Scrub targets for rAF lerp loop (decoupled from scroll event)
  const targetVideoProgressRef = useRef(0);
  const isReplayingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  // -------------------------------------------------------------
  // Clean rAF loop: Lerps currentTime towards targetVideoProgress
  // Factor ~0.10, seeking threshold > 0.03s to eliminate thrashing
  // -------------------------------------------------------------
  useEffect(() => {
    if (prefersReducedMotion) return;

    let currentVideoTime = 0;
    let targetVideoTime = 0;

    const tick = () => {
      const video = videoRef.current;
      if (video && video.duration && !isReplayingRef.current) {
        const dur = video.duration;
        targetVideoTime = targetVideoProgressRef.current * dur;

        // Lerp factor ~0.10
        currentVideoTime += (targetVideoTime - currentVideoTime) * 0.1;

        // Only seek when delta > 0.03s
        if (Math.abs(video.currentTime - currentVideoTime) > 0.03) {
          video.currentTime = Math.max(0, Math.min(dur - 0.02, currentVideoTime));
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
  }, [prefersReducedMotion]);

  // -------------------------------------------------------------
  // GSAP ScrollTrigger Sequence: Phase A -> B -> C -> D -> E
  // -------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!container || !wrapper || !video) return;

    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 1024;
    const initialInset = isMobile
      ? "inset(16px 16px 16px 16px round 20px)"
      : "inset(28px 44px 28px 44px round 24px)";

    const siteHeader = document.querySelector("header");

    const ctx = gsap.context(() => {
      // Set initial Phase A card geometry
      gsap.set(wrapper, {
        clipPath: initialInset,
        willChange: "clip-path",
      });

      if (headerUiRef.current) {
        gsap.set(headerUiRef.current, { opacity: 1, y: 0 });
      }

      if (replayBtnRef.current) {
        gsap.set(replayBtnRef.current, { opacity: 0, y: 16, pointerEvents: "none" });
      }

      // Master Timeline pinned for ~500vh (3.5x on mobile)
      const tl = gsap.timeline({
        scrollTrigger: {
          id: "journey-video",
          trigger: container,
          start: "top top",
          end: () => "+=" + (isMobile ? window.innerHeight * 3.5 : window.innerHeight * 5),
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (isReplayingRef.current) return;
            const p = self.progress;

            // Phase detection & mapping
            if (p < 0.2) {
              setScrollPhase("A");
              targetVideoProgressRef.current = 0;
              setNormalizedProgress(0);
              setActiveStageIndex(0);
            } else if (p <= 0.8) {
              setScrollPhase("C");
              // Map middle 60% of scroll (0.2 -> 0.8) to video duration (0.0 -> 1.0)
              const vProg = Math.max(0, Math.min(1, (p - 0.2) / 0.6));
              targetVideoProgressRef.current = vProg;
              setNormalizedProgress(vProg);

              // 4 stages evenly spaced across video progress
              const stageIdx = Math.min(3, Math.floor(vProg * 4));
              setActiveStageIndex(stageIdx);
            } else {
              setScrollPhase("D");
              targetVideoProgressRef.current = 1.0;
              setNormalizedProgress(1.0);
              setActiveStageIndex(3);
            }
          },
        },
      });

      // 1. Phase B (First ~20% of scroll, 0.0 -> 0.20): Expand from framed card to edge-to-edge
      tl.to(
        wrapper,
        {
          clipPath: "inset(0px 0px 0px 0px round 0px)",
          ease: "power2.inOut",
          duration: 0.2,
        },
        0
      );

      // Fade out header UI (tag, heading, scroll cue)
      if (headerUiRef.current) {
        tl.to(
          headerUiRef.current,
          {
            opacity: 0,
            y: -24,
            ease: "power1.out",
            duration: 0.15,
          },
          0
        );
      }

      // Fade out fixed site navbar for immersive video
      if (siteHeader) {
        tl.to(
          siteHeader,
          {
            opacity: 0,
            pointerEvents: "none",
            ease: "power1.out",
            duration: 0.12,
          },
          0.04
        );
      }

      // 2. Phase C (Middle ~60%, 0.20 -> 0.80): Hold full-bleed, video scrubs via rAF
      // Keep empty duration slot on timeline for scrub span
      tl.to(
        {},
        {
          duration: 0.6,
        },
        0.2
      );

      // 3. Phase D (Last ~20%, 0.80 -> 1.00): Shrink back into framed card with cream border
      tl.to(
        wrapper,
        {
          clipPath: initialInset,
          ease: "power2.inOut",
          duration: 0.2,
        },
        0.8
      );

      // Fade in header UI and fixed site navbar
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

      if (siteHeader) {
        tl.to(
          siteHeader,
          {
            opacity: 1,
            pointerEvents: "auto",
            ease: "power1.in",
            duration: 0.14,
          },
          0.86
        );
      }

      // 4. Phase E (End): Replay button fades in at end of shrink
      if (replayBtnRef.current) {
        tl.to(
          replayBtnRef.current,
          {
            opacity: 1,
            y: 0,
            pointerEvents: "auto",
            ease: "power2.out",
            duration: 0.12,
          },
          0.88
        );
      }
    }, container);

    return () => {
      ctx.revert();
      const st = ScrollTrigger.getById("journey-video");
      if (st) st.kill(true);
      // Ensure navbar is visible if unmounting mid-scroll
      if (siteHeader) gsap.set(siteHeader, { opacity: 1, pointerEvents: "auto" });
    };
  }, [prefersReducedMotion]);

  // -------------------------------------------------------------
  // Phase E: Replay Video with scroll lock, expand, autoplay, shrink
  // -------------------------------------------------------------
  const handleReplayClick = useCallback(async () => {
    const container = containerRef.current;
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!container || !wrapper || !video || isReplayingRef.current) return;

    setIsReplaying(true);
    isReplayingRef.current = true;

    // 1. Lock user scroll with Lenis
    if (lenis) {
      lenis.stop();
    }

    // 2. Smooth-scroll back to the start of the section
    const st = ScrollTrigger.getById("journey-video");
    const targetScroll = st ? st.start : container.offsetTop;

    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.2, immediate: false });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }

    await new Promise((r) => setTimeout(r, 1200));

    // 3. Expand edges to full screen again
    gsap.to(wrapper, {
      clipPath: "inset(0px 0px 0px 0px round 0px)",
      duration: 0.7,
      ease: "power2.inOut",
    });
    gsap.to("header", { opacity: 0, pointerEvents: "none", duration: 0.3 });
    if (headerUiRef.current) {
      gsap.to(headerUiRef.current, { opacity: 0, duration: 0.3 });
    }
    if (replayBtnRef.current) {
      gsap.to(replayBtnRef.current, { opacity: 0, pointerEvents: "none", duration: 0.3 });
    }

    await new Promise((r) => setTimeout(r, 700));

    // 4. Play video from 0 automatically in real time (muted, normal speed)
    video.currentTime = 0;
    video.playbackRate = 1.0;

    const dur = video.duration || 7.96;
    const startTime = performance.now();

    const trackAutoplay = () => {
      if (!isReplayingRef.current) return;
      const elapsed = (performance.now() - startTime) / 1000;
      const prog = Math.min(1, elapsed / dur);
      setNormalizedProgress(prog);
      const stageIdx = Math.min(3, Math.floor(prog * 4));
      setActiveStageIndex(stageIdx);

      if (elapsed < dur - 0.05 && !video.ended) {
        requestAnimationFrame(trackAutoplay);
      }
    };

    try {
      await video.play();
      requestAnimationFrame(trackAutoplay);
    } catch {
      // Fallback if autoplay restricted
    }

    // Wait for video completion
    await new Promise((r) => setTimeout(r, dur * 1000 + 100));

    // 5. Shrink edges back into framed card
    const isMobile = window.innerWidth < 1024;
    const initialInset = isMobile
      ? "inset(16px 16px 16px 16px round 20px)"
      : "inset(28px 44px 28px 44px round 24px)";

    gsap.to(wrapper, {
      clipPath: initialInset,
      duration: 0.7,
      ease: "power2.inOut",
    });
    gsap.to("header", { opacity: 1, pointerEvents: "auto", duration: 0.5 });
    if (headerUiRef.current) {
      gsap.to(headerUiRef.current, { opacity: 1, duration: 0.5 });
    }
    if (replayBtnRef.current) {
      gsap.to(replayBtnRef.current, { opacity: 1, pointerEvents: "auto", duration: 0.5, delay: 0.2 });
    }

    await new Promise((r) => setTimeout(r, 750));

    // 6. Unlock scroll
    if (lenis) {
      lenis.start();
    }
    setIsReplaying(false);
    isReplayingRef.current = false;
  }, [lenis]);

  // Reduced motion: manual play/pause handler
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlayingManual(true);
    } else {
      video.pause();
      setIsPlayingManual(false);
    }
  };

  const currentStage = learnerPathContent.stages[activeStageIndex];

  return (
    <section
      id="learner-path"
      ref={containerRef}
      className="relative w-full h-[100svh] bg-yellow-cream overflow-hidden flex items-center justify-center"
    >
      {/* 
        Video Wrapper:
        - Mirrors hero expand/shrink in reverse:
          Starts as rounded card on cream background, expands edge-to-edge (0.0 -> 0.2),
          holds full-bleed during middle 60% scrub, shrinks back to card on cream (0.8 -> 1.0)
      */}
      <div
        ref={wrapperRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none"
        style={{ willChange: "clip-path" }}
      >
        {/* Video Element (Natural colors, NO blue/indigo overlays) */}
        <video
          ref={videoRef}
          src="/assets/Student_Journey_scrub.mp4"
          poster={learnerPathContent.posterSrc}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        />

        {/* Faint neutral bottom gradient (max 25% black) ONLY behind the timeline bar */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/25 via-black/10 to-transparent pointer-events-none z-10" />

        {/* UI Overlay Container (Edge-to-edge flex layout inside the video) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 md:p-12 pointer-events-none">
          {/* Top Header Row (Tag, Heading, Scroll Cue) - Fades out during expand, spaced cleanly below nav */}
          <div ref={headerUiRef} className="w-full pt-14 sm:pt-16 pointer-events-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <TagChip variant="yellow">{learnerPathContent.sectionBadge}</TagChip>

              {/* Scroll Cue Badge */}
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs tracking-wide border border-white/15">
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

          {/* Middle Stage Content Card: Neutral dark frosted glass (rgba(20,20,40,0.45) + blur) */}
          <div
            ref={stageCardRef}
            className="my-auto pointer-events-auto max-w-lg rounded-[20px] p-5 sm:p-7 border border-white/15 shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: "rgba(20, 20, 40, 0.45)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Top Stage Header */}
            <div className="flex items-center justify-between text-yellow-golden text-sm font-sans font-medium mb-2">
              <span className="tracking-wide uppercase text-xs sm:text-sm font-mono">
                Stage {currentStage.number}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-golden/20 text-yellow-golden text-xs font-mono">
                {currentStage.grades}
              </span>
            </div>

            {/* Stage Title */}
            <h3 className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-white mb-2 transition-all duration-200">
              {currentStage.title}
            </h3>

            {/* Stage Description */}
            <p className="text-xs sm:text-sm text-[#E4E3F5]/90 leading-relaxed font-sans mb-4">
              {currentStage.description}
            </p>

            {/* Milestone Chips */}
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
              {currentStage.milestones.map((milestone) => (
                <span
                  key={milestone}
                  className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-white/10 text-white/90 border border-white/10 font-sans"
                >
                  {milestone}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Area: Replay Button + 4-Step Timeline Bar */}
          <div className="w-full flex flex-col gap-4 pointer-events-auto z-20">
            {/* Replay Video Button (Phase E - fades in at end of shrink) */}
            <div ref={replayBtnRef} className="flex justify-start">
              <button
                type="button"
                onClick={handleReplayClick}
                disabled={isReplaying}
                aria-label="Replay student journey video"
                className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-yellow-golden text-indigo-deep rounded-[8px] font-sans font-medium text-xs sm:text-sm tracking-tight shadow-xl hover:brightness-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-golden disabled:opacity-50"
              >
                <span>{isReplaying ? "Playing Journey..." : "Replay Video"}</span>
                <span className="w-5 h-5 rounded-[4px] bg-indigo-deep text-yellow-golden flex items-center justify-center transition-transform group-hover:-rotate-90 duration-300">
                  <RotateCcw className="w-3 h-3" />
                </span>
              </button>
            </div>

            {/* 4-Step Timeline Progress Bar */}
            <div ref={timelineBarRef} className="w-full">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {learnerPathContent.stages.map((stage, idx) => {
                  const isActive = idx === activeStageIndex;
                  const isPast = idx < activeStageIndex;
                  const startProg = idx * 0.25;
                  const segProgress = Math.max(
                    0,
                    Math.min(1, (normalizedProgress - startProg) / 0.25)
                  );

                  return (
                    <div
                      key={stage.number}
                      className="flex flex-col gap-1.5 select-none"
                    >
                      {/* Bar Fill */}
                      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-golden transition-all duration-100 ease-out"
                          style={{
                            width: isPast ? "100%" : isActive ? `${segProgress * 100}%` : "0%",
                          }}
                        />
                      </div>

                      {/* Stage Label */}
                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span
                          className={`font-mono font-medium ${
                            isActive ? "text-yellow-golden" : "text-white/60"
                          }`}
                        >
                          {stage.number}
                        </span>
                        <span
                          className={`hidden sm:inline font-sans ${
                            isActive ? "text-white font-medium" : "text-white/50"
                          }`}
                        >
                          {stage.grades}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reduced Motion Controls: Standard Play/Pause Button */}
        {prefersReducedMotion && (
          <div className="absolute bottom-6 right-6 z-30 pointer-events-auto">
            <button
              type="button"
              onClick={handleTogglePlay}
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
