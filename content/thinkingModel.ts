export interface ModelStep {
  number: string;
  stepName: string;
  question: string;
  description: string;
}

export const thinkingModelContent = {
  sectionTag: "Pedagogical Philosophy",
  headingPart1: "Thinking first.",
  headingPart2: "Then",
  headingAccentLetter: "l",
  headingPart3: "earning.",
  quote: "Don't teach me what to think. Teach me how to think.",
  subtext: "Our proprietary 5-stage cognitive cycle transforms passive learners into active creators of knowledge.",
  steps: [
    {
      number: "01",
      stepName: "Question",
      question: "Why does this happen?",
      description: "Sparking curiosity through provocation, mystery, and intentional problem prompts that invite exploration.",
    },
    {
      number: "02",
      stepName: "Explore",
      question: "What evidence exists?",
      description: "Investigating multidisciplinary resources, conducting hands-on trials, and gathering diverse observations.",
    },
    {
      number: "03",
      stepName: "Understand",
      question: "How do pieces connect?",
      description: "Formulating mental models, synthesizing patterns, and grasping root principles behind the facts.",
    },
    {
      number: "04",
      stepName: "Apply",
      question: "Where can this build value?",
      description: "Deploying knowledge into practical challenges, prototype designs, and collaborative capstone projects.",
    },
    {
      number: "05",
      stepName: "Reflect & Grow",
      question: "What did we uncover?",
      description: "Metacognitive evaluation of our thinking process, recognizing blind spots, and setting future trajectories.",
    },
  ] as ModelStep[],
};

