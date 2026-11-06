export interface StageInfo {
  number: string;
  grades: string;
  title: string;
  description: string;
  rangeProgress: [number, number]; // 0.0 to 1.0 progress interval
  milestones: string[];
}

export const learnerPathContent = {
  sectionBadge: "Scroll-animated journey",
  headingPart1: "One student.",
  headingPart2: "Four stages of",
  headingAccentLetter: "g",
  headingPart3: "rowth.",
  scrollCue: "Scroll to play the journey",
  videoSrc: "/assets/Student_Journey.mp4",
  posterSrc: "/assets/student-journey-poster.jpg",
  stages: [
    {
      number: "01",
      grades: "LKG & UKG",
      title: "Foundational Wonder",
      description:
        "Sensory discovery, early language mastery, play-based numeracy, and joyful curiosity that builds a lifelong love for exploration.",
      rangeProgress: [0.0, 0.25],
      milestones: ["Sensory Labs", "Guided Play", "Foundational Literacy", "Motor Coordination"],
    },
    {
      number: "02",
      grades: "Std 1–4",
      title: "Core Inquisitiveness",
      description:
        "Transitioning from play into systematic observation, structured inquiry, collaborative team projects, and conceptual math thinking.",
      rangeProgress: [0.25, 0.5],
      milestones: ["Scientific Inquiry", "Narrative Expression", "Computational Play", "Collaborative Discovery"],
    },
    {
      number: "03",
      grades: "Std 5–8",
      title: "Analytical Independence",
      description:
        "Developing critical reasoning, ethical deliberation, interdisciplinary science experiments, and autonomous research skills.",
      rangeProgress: [0.5, 0.75],
      milestones: ["Design Thinking", "Hypothesis Testing", "Debate & Rhetoric", "AI Literacy"],
    },
    {
      number: "04",
      grades: "Std 9–12",
      title: "Future-Ready Leadership",
      description:
        "Global perspectives, advanced academic honors, career mentorship, capstone research projects, and self-directed purpose.",
      rangeProgress: [0.75, 1.0],
      milestones: ["Global Capstone", "Career Internships", "Ethical Leadership", "University Placement"],
    },
  ] as StageInfo[],
};

