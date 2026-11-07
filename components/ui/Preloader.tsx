"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { preloadAllJourneyFrames, TOTAL_JOURNEY_FRAMES } from "@/lib/journeyFrames";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

export function Preloader({ onComplete }: { onComplete?: () => void }) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loadedFramesCount, setLoadedFramesCount] = useState(0);
  const targetProgressRef = useRef(0);
  const isCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const { lenis } = useSmoothScroll();
  const lenisRef = useRef(lenis);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    lenisRef.current = lenis;
    if (lenis && isVisible) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    }
  }, [lenis, isVisible]);

  useEffect(() => {
    // 1. Lock scroll during preloader
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo(0, 0);

    if (lenisRef.current) {
      lenisRef.current.stop();
      lenisRef.current.scrollTo(0, { immediate: true });
    }

    const minStartTime = Date.now();
    const minDisplayMs = 600; // Aesthetic minimum to avoid flashing on instant cache
    let rafId: number;

    // 2. Smooth progress ticker that interpolates toward actual target progress
    const tick = () => {
      setDisplayProgress((prev) => {
        const target = targetProgressRef.current;
        if (prev >= 100 && target >= 100) return 100;

        if (prev < target) {
          // Smoothly advance toward target
          const step = Math.max(1, Math.ceil((target - prev) * 0.25));
          return Math.min(target, prev + step);
        }
        return prev;
      });

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // 3. Begin loading all 191 scroll animation frames
    preloadAllJourneyFrames((loaded, total, percent) => {
      setLoadedFramesCount(loaded);
      targetProgressRef.current = percent;
    }).then(() => {
      targetProgressRef.current = 100;
      finishWhenReady();
    }).catch(() => {
      // Even on unexpected error, guarantee user access
      targetProgressRef.current = 100;
      finishWhenReady();
    });

    // 4. Maximum safety timeout (12 seconds) in case of extreme network throttle
    const safetyTimeout = setTimeout(() => {
      targetProgressRef.current = 100;
      finishWhenReady();
    }, 12000);

    function finishWhenReady() {
      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - minStartTime;
        if (targetProgressRef.current >= 100 && elapsed >= minDisplayMs && !isCompletedRef.current) {
          isCompletedRef.current = true;
          clearInterval(checkInterval);
          clearTimeout(safetyTimeout);
          setDisplayProgress(100);

          setTimeout(() => {
            // Restore scroll
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            if (lenisRef.current) {
              lenisRef.current.start();
            }

            setIsVisible(false);
            onCompleteRef.current?.();
          }, 250);
        }
      }, 30);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(safetyTimeout);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    };
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        if (lenisRef.current) {
          lenisRef.current.start();
        }
      }}
    >
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-indigo-deep select-none"
        >
          <div className="flex flex-col items-center max-w-xs w-full px-6">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative w-64 h-16 mb-6"
            >
              <Image
                src="/assets/logo-white.png"
                alt="Kognitics The International School"
                fill
                priority
                className="object-contain"
              />
            </motion.div>

            {/* Progress line */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-golden transition-all duration-75 ease-out rounded-full"
                style={{ width: `${displayProgress}%` }}
              />
            </div>

            <div className="mt-3.5 flex items-center justify-between w-full text-[11px] tracking-wider uppercase text-light-text/70 font-sans">
              <span>Loading Scroll Journey</span>
              <span className="font-mono font-medium text-yellow-golden">{displayProgress}%</span>
            </div>

            <div className="mt-1 text-[10px] text-light-text/40 font-sans tracking-wide">
              {loadedFramesCount > 0 ? `${loadedFramesCount} / ${TOTAL_JOURNEY_FRAMES} frames ready` : "Initializing cognitive space..."}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
