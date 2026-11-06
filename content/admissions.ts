export interface AdmissionStep {
  number: string;
  title: string;
  summary: string;
  description: string;
  theme: "cream" | "indigo";
}

export const admissionsContent = {
  sectionTag: "Admissions 2026–2027",
  headingPart1: "Simple, clear,",
  headingPart2: "child-",
  headingAccentLetter: "f",
  headingPart3: "irst",
  subtext: "We believe an admission process should be an enlightening conversation, not a high-stress evaluation.",
  steps: [
    {
      number: "01",
      title: "Enquiry & Interaction",
      summary: "First step to know each other",
      description: "Submit a simple inquiry, tour our Mysuru campus, and converse with academic leaders about our thinking-first methodology.",
      theme: "cream",
    },
    {
      number: "02",
      title: "Child Understanding",
      summary: "Friendly exploratory session",
      description: "A comfortable, pressure-free informal interaction to understand your child's curiosities, passions, and unique learning style.",
      theme: "cream",
    },
    {
      number: "03",
      title: "Admission Confirmation",
      summary: "Welcome to the family",
      description: "Transparent documentation, orientation roadmap, and personalized student onboarding into the Kognitics learner sphere.",
      theme: "indigo",
    },
  ] as AdmissionStep[],
  chips: [
    "No pressure-based admissions",
    "No rote-based entry testing",
    "Clear communication",
    "Child-first decisions",
  ],
  formSection: {
    title: "Begin your child's journey",
    subtitle: "Fill out the form below. Our admissions council will connect within 24 hours.",
    contactInfo: {
      phone: "[PHONE]",
      email: "[EMAIL]",
      officeHours: "[OFFICE HOURS]",
      address: "Kognitics – The International School, Mysuru, Karnataka, India",
    },
  },
};

