"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollContextType {
  lenis: Lenis | null;
  prefersReducedMotion: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  prefersReducedMotion: false,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    if (mediaQuery.matches) {
      return () => {
        mediaQuery.removeEventListener("change", handleMediaChange);
      };
    }

    // Initialize Lenis with one constant scroll feel (FIX 1)
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.095, // Constant linear momentum (0.09 to 0.1)
      wheelMultiplier: 1.0,
      smoothWheel: true,
      orientation: "vertical",
      gestureOrientation: "vertical",
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance, prefersReducedMotion }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

