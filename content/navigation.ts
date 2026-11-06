export interface NavLink {
  label: string;
  href: string;
}

export const navigationLinks: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "Kognitics Universe", href: "#universe" },
  { label: "Learning Journey", href: "#learner-path" },
  { label: "Thinking Model", href: "#thinking-model" },
  { label: "Community Sphere", href: "#community-sphere" },
  { label: "Campus Lifespaces", href: "#campus-life" },
  { label: "Admissions", href: "#admissions" },
  { label: "Connect Hub", href: "#connect" },
];

export const navigationCTA = {
  label: "Apply Now",
  href: "#admissions",
};

