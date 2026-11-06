"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { navigationLinks, navigationCTA } from "@/content/navigation";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Menu, X } from "lucide-react";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";

// Section configurations for active link detection and light/dark theme sensing
const SECTION_CONFIG = [
  { id: "hero", label: "Home", isDark: true },
  { id: "universe", label: "Kognitics Universe", isDark: false },
  { id: "learner-path", label: "Learning Journey", isDark: true },
  { id: "activities", label: "Learning Journey", isDark: false },
  { id: "why-kognitics", label: "Learning Journey", isDark: false },
  { id: "thinking-model", label: "Thinking Model", isDark: true },
  { id: "life-skills", label: "Thinking Model", isDark: false },
  { id: "community-sphere", label: "Community Sphere", isDark: false },
  { id: "campus-life", label: "Campus Lifespaces", isDark: false },
  { id: "admissions", label: "Admissions", isDark: false },
  { id: "connect", label: "Connect Hub", isDark: true },
];

export function Navbar() {
  const [activeItem, setActiveItem] = useState("Home");
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Controls logo swap (white vs indigo)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeItemRef = useRef("Home");
  const isDarkThemeRef = useRef(true);
  const scrollRafRef = useRef<number | null>(null);

  const { lenis, prefersReducedMotion } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRafRef.current) return;

      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = null;
        const scrollY = window.scrollY;
        const viewportH = window.innerHeight;

        // Track active section and dark/light background
        const checkPoint = 160;
        let currentSection = SECTION_CONFIG[0];

        for (let i = SECTION_CONFIG.length - 1; i >= 0; i--) {
          const item = SECTION_CONFIG[i];
          const el = document.getElementById(item.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= checkPoint && rect.bottom > 0) {
              currentSection = item;
              break;
            }
          }
        }

        if (currentSection.label !== activeItemRef.current) {
          activeItemRef.current = currentSection.label;
          setActiveItem(currentSection.label);
        }

        const dark = scrollY <= viewportH * 0.9 ? true : currentSection.isDark;
        if (dark !== isDarkThemeRef.current) {
          isDarkThemeRef.current = dark;
          setIsDarkTheme(dark);
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (lenis) {
      lenis.on("scroll", handleScroll);
    }

    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      if (lenis) {
        lenis.off("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lenis, prefersReducedMotion]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent | undefined, href: string, label: string) => {
    if (e && e.preventDefault) e.preventDefault();
    setActiveItem(label);
    setMobileMenuOpen(false);

    const targetEl = document.querySelector(href);
    if (!targetEl) return;

    if (lenis) {
      lenis.scrollTo(targetEl as HTMLElement, { offset: -60, duration: 1.2 });
    } else {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fullscreen-video-mode fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 md:px-12 py-4 bg-transparent border-b border-transparent pointer-events-none">
        <div className="w-full flex items-center justify-between">
          {/* 1. Logo (Left) - Always visible from scroll 0 */}
          <div className="flex items-center flex-shrink-0 pointer-events-auto">
            <Link
              href="#hero"
              onClick={(e) => handleNavClick(e, "#hero", "Home")}
              className="relative block h-8 sm:h-9 w-32 sm:w-44 focus:outline-none focus:ring-2 focus:ring-yellow-golden rounded-ktag"
              aria-label="Kognitics The International School Home"
            >
              {/* White Logo (for dark sections & hero video) */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isDarkTheme ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src="/assets/logo-white.png"
                  alt="Kognitics – The International School"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>

              {/* Transparent Indigo Logo (for light cream sections) */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isDarkTheme ? "opacity-0" : "opacity-100"
                }`}
              >
                <Image
                  src="/assets/logo-transparent.png"
                  alt="Kognitics – The International School"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </div>
            </Link>
          </div>

          {/* 2. Desktop Pill Navigation (Center) - Collapses in full-screen video modes */}
          <div className="nav-fullscreen-hide hidden lg:flex items-center mx-auto will-change-transform">
            <nav
              className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: isDarkTheme
                  ? "1px solid rgba(255, 255, 255, 0.25)"
                  : "1px solid rgba(37, 36, 90, 0.14)",
                boxShadow: isDarkTheme
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)"
                  : "0 8px 32px 0 rgba(37, 36, 90, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
              }}
            >
              {navigationLinks.map((link) => {
                const isActive = activeItem === link.label;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.label)}
                    className={`relative px-3.5 py-1.5 text-[13px] font-sans tracking-tight transition-colors duration-200 z-10 ${
                      isActive
                        ? "text-indigo-deep font-medium"
                        : isDarkTheme
                        ? "text-white/90 hover:text-white"
                        : "text-indigo-deep/80 hover:text-indigo-deep"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-yellow-golden rounded-full -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* 3. Right CTA Button & Mobile Menu Toggle - Collapses in full-screen video modes */}
          <div className="nav-fullscreen-hide flex items-center gap-3 ml-auto will-change-transform">
            {/* Desktop Apply Now Button */}
            <div className="hidden sm:block">
              <MagneticButton
                href={navigationCTA.href}
                variant="primary"
                isMagnetic
                className="shadow-lg"
                onClick={(e) => handleNavClick(e, navigationCTA.href, "Admissions")}
              >
                {navigationCTA.label}
              </MagneticButton>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isDarkTheme
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: isDarkTheme
                  ? "1px solid rgba(255, 255, 255, 0.25)"
                  : "1px solid rgba(37, 36, 90, 0.15)",
                boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
                color: isDarkTheme ? "#FFFFFF" : "#25245A",
              }}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu with Staggered Links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-indigo-deep/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 pt-24 lg:hidden"
          >
            <div className="flex flex-col gap-3 overflow-y-auto py-4">
              {navigationLinks.map((link, idx) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * idx, duration: 0.25 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.label)}
                    className="block text-2xl font-light text-light-text hover:text-yellow-golden tracking-tight py-2 border-b border-white/10"
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </div>

            <div className="pt-6">
              <MagneticButton
                href={navigationCTA.href}
                variant="primary"
                className="w-full text-center"
                onClick={(e) => handleNavClick(e, navigationCTA.href, "Admissions")}
              >
                {navigationCTA.label}
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
