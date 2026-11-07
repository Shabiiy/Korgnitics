"use client";

import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Preloader } from "@/components/ui/Preloader";

gsap.registerPlugin(ScrollTrigger);
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Universe } from "@/components/sections/Universe";
import { LearnerPath } from "@/components/sections/LearnerPath";
import { Activities } from "@/components/sections/Activities";
import { WhyKognitics } from "@/components/sections/WhyKognitics";
import { ThinkingModel } from "@/components/sections/ThinkingModel";
import { LifeSkills } from "@/components/sections/LifeSkills";
import { CommunitySphere } from "@/components/sections/CommunitySphere";
import { CampusLife } from "@/components/sections/CampusLife";
import { Admissions } from "@/components/sections/Admissions";
import { ClosingCard } from "@/components/sections/ClosingCard";
import { SiteWideReveals } from "@/components/animations/SiteWideReveals";

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  useEffect(() => {
    // Ensure all pinned spacers and triggers are sorted by document order and refreshed
    const timer = setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 250);
    return () => clearTimeout(timer);
  }, [preloaderDone]);

  return (
    <main className="relative min-h-screen bg-yellow-cream text-indigo-deep">
      {/* Preloader (< 1.2s) */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* Centralized cheap ScrollTrigger.batch directional reveals */}
      <SiteWideReveals />

      {/* Persistent Navigation Bar (Stays throughout all sections) */}
      <Navbar />

      {/* 1. Hero Section */}
      <Hero isReady={preloaderDone} />

      {/* 2. Kognitics Universe */}
      <Universe />

      {/* 3. The Learner's Path (Scroll-Scrubbed Video) */}
      <LearnerPath />

      {/* 4. Life Doesn't Happen in Classrooms Alone */}
      <Activities />

      {/* 5. Why Kognitics */}
      <WhyKognitics />

      {/* 6. The Thinking Model */}
      <ThinkingModel />

      {/* 7. Life Skills Framework */}
      <LifeSkills />

      {/* 8. Community Sphere */}
      <CommunitySphere />

      {/* 9. Campus Life */}
      <CampusLife />

      {/* 10. Admissions */}
      <Admissions />

      {/* 11. Closing Card & Footer */}
      <ClosingCard />
    </main>
  );
}

