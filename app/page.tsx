"use client";

import React, { useState } from "react";
import { Preloader } from "@/components/ui/Preloader";
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

export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <main className="relative min-h-screen bg-yellow-cream text-indigo-deep">
      {/* Preloader (< 1.2s) */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* Persistent Navigation Bar (Stays throughout all sections) */}
      <Navbar />

      {/* 1. Hero Section */}
      <Hero />

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

