export interface UniverseCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  theme: "cream" | "indigo";
  iconSrc: string;
  iconLightSrc: string;
}

export const universeContent = {
  sectionTag: "Kognitics Universe",
  headingPart1: "Built for",
  inlineImageSrc: "/assets/heading-thumb.png",
  inlineImageAlt: "Kognitics Campus Student",
  headingAccentLetter: "T",
  headingPart2: "hinking minds",
  introParagraph:
    "We believe education isn't about memorizing answers. It is the art of questioning deeply, synthesizing across disciplines, and empowering young individuals with lifelong mental frameworks.",
  thumbnails: [
    {
      src: "/assets/universe-thumb-1.png",
      alt: "Outdoor collaborative learning at Kognitics",
      caption: "Interactive Learning",
    },
    {
      src: "/assets/universe-thumb-2.png",
      alt: "Classroom inquiry at Kognitics",
      caption: "Inquiry Studios",
    },
  ],
  curiosityTile: {
    title: "Curiosity first.",
    subtitle: "Always.",
    description: "Every lesson starts with an unanswered question, nurturing the intrinsic drive to discover.",
  },
  cards: [
    {
      id: "thinking-first",
      tag: "Cognitive Framework",
      title: "Thinking First",
      description:
        "Cultivating analytical reasoning, metacognition, and independent judgment before rushing to textbook conclusions.",
      imageSrc: "/assets/icon-think.png",
      imageAlt: "Thinking First - Creative and analytical cognition icon",
      theme: "cream",
      iconSrc: "/assets/icon-think.png",
      iconLightSrc: "/assets/icon-think-light.png",
    },
    {
      id: "skills-values",
      tag: "Character & Growth",
      title: "Skills & Values",
      description:
        "Building emotional grounding, empathy, resilience, and ethical leadership that endure far beyond academic milestones.",
      imageSrc: "/assets/icon-skill-light.png",
      imageAlt: "Skills & Values - Character, learning and ethics icon",
      theme: "indigo",
      iconSrc: "/assets/icon-skill.png",
      iconLightSrc: "/assets/icon-skill-light.png",
    },
    {
      id: "every-child-seen",
      tag: "Personalized Pathway",
      title: "Every Child Seen",
      description:
        "Small cohorts, individualized mentorship, and tailored pacing ensure no learner goes unnoticed or uncelebrated.",
      imageSrc: "/assets/icon-child.png",
      imageAlt: "Every Child Seen - Inclusive and personalized student growth icon",
      theme: "cream",
      iconSrc: "/assets/icon-child.png",
      iconLightSrc: "/assets/icon-child-light.png",
    },
  ] as UniverseCard[],
};

