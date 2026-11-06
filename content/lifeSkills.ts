export interface LifeSkillCard {
  id: string;
  number: string;
  title: string;
  theme: "cream" | "indigo";
  tagline: string;
  description: string;
  practices: string[];
}

export const lifeSkillsContent = {
  sectionTag: "Holistic Core",
  headingPart1: "Experienced",
  headingPart2: "every",
  headingAccentLetter: "d",
  headingPart3: "ay",
  subtext: "Crucial human capabilities woven directly into morning circles, lab workshops, sports sessions, and student-led councils.",
  cards: [
    {
      id: "communicate",
      number: "01",
      title: "Communicate",
      theme: "cream",
      tagline: "Clarity & Resonance",
      description: "Articulating complex arguments with precision, active listening, and persuasive storytelling across verbal and digital media.",
      practices: ["Public Speaking", "Active Listening", "Digital Expression"],
    },
    {
      id: "collaborate",
      number: "02",
      title: "Collaborate",
      theme: "indigo",
      tagline: "Collective Synergy",
      description: "Navigating team dynamics, negotiating diverse viewpoints, and orchestrating collective intelligence toward common goals.",
      practices: ["Team Leadership", "Conflict Resolution", "Shared Stewardship"],
    },
    {
      id: "think",
      number: "03",
      title: "Think",
      theme: "cream",
      tagline: "Critical & Creative Depth",
      description: "Deconstructing cognitive biases, applying first-principles thinking, and imagining unprecedented creative possibilities.",
      practices: ["Lateral Thinking", "System Analysis", "First-Principles Logic"],
    },
    {
      id: "lead",
      number: "04",
      title: "Lead",
      theme: "indigo",
      tagline: "Integrity & Initiative",
      description: "Taking courageous responsibility for positive impact, driving initiatives, and inspiring peers through empathy and moral conviction.",
      practices: ["Ethical Decisions", "Community Action", "Resilient Vision"],
    },
    {
      id: "connect",
      number: "05",
      title: "Connect",
      theme: "cream",
      tagline: "Empathy & Interdependence",
      description: "Building authentic, trusting bonds with mentors, peers, environment, and the broader civic ecosystem.",
      practices: ["Cultural Fluency", "Environmental Care", "Mentorship Links"],
    },
    {
      id: "reflect-adapt",
      number: "06",
      title: "Reflect & Adapt",
      theme: "indigo",
      tagline: "Growth Mindset",
      description: "Embracing setbacks as crucial iterative feedback, building cognitive agility, and calibrating personal strategies continuously.",
      practices: ["Metacognition", "Stress Management", "Continuous Iteration"],
    },
  ] as LifeSkillCard[],
};

