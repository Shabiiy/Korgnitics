export interface CommunityRow {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
}

export const communityContent = {
  sectionTag: "Community Sphere",
  headingPart1: "Walking the",
  headingPart2: "path",
  headingAccentLetter: "t",
  headingPart3: "ogether",
  intro:
    "Education is an ecosystem. When parents, dedicated educators, and community mentors walk shoulder to shoulder, children flourish unconditionally.",
  rows: [
    {
      number: "01",
      title: "Parent Partnership",
      subtitle: "Continuous collaborative dialogue",
      description:
        "Transparent observation portals, bi-weekly insight digests, and co-created development plans ensure parents remain active partners in their child's cognitive voyage.",
      points: ["Open-Door Dialogue", "Growth Portfolios", "Parent Learning Salons"],
    },
    {
      number: "02",
      title: "Teacher Culture",
      subtitle: "Facilitators of inquiry and inspiration",
      description:
        "Our educators receive 120+ hours of annual global pedagogic research training, transitioning from rote lecturers to master mentors of inquiry.",
      points: ["Continuous Fellowship", "Pedagogy Research", "Empathetic Mentoring"],
    },
    {
      number: "03",
      title: "Community Connect",
      subtitle: "Rooted in Mysuru, linked to the world",
      description:
        "Engaging with local artisan clusters, civic environmental drives, regional heritage conservation, and virtual exchanges with sister schools worldwide.",
      points: ["Civic Engagements", "Heritage Expeditions", "Global Sister Exchanges"],
    },
    {
      number: "04",
      title: "Guidance Circle",
      subtitle: "360-degree emotional & developmental care",
      description:
        "Multidisciplinary child psychologists, wellness coaches, and dedicated peer-buddies safeguarding mental well-being and confidence at every turn.",
      points: ["Proactive Well-being", "Confidential Counseling", "Peer-Support Networks"],
    },
  ] as CommunityRow[],
};

