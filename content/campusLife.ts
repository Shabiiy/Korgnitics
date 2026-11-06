export interface CampusSpaceCard {
  id: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  facilities: string[];
  theme: "cream" | "indigo";
}

export const campusLifeContent = {
  sectionTag: "Campus Lifespaces",
  headingPart1: "Spaces that",
  headingAccentLetter: "i",
  headingPart2: "nspire",
  intro:
    "An architecturally deliberate 10-acre green campus in Mysuru designed to blur the boundary between natural tranquility and cutting-edge exploratory infrastructure.",
  buttons: [
    { label: "Clubs & Societies", active: true },
    { label: "Care & Comfort", active: false },
  ],
  spaces: [
    {
      id: "learning-spaces",
      title: "Learning Spaces",
      subtitle: "Acoustically designed, sunlit collaborative classrooms",
      imageSrc: "/assets/campus-learning.png",
      imageAlt: "Sunlit classrooms with ergonomic seating and flexible inquiry clusters",
      facilities: ["Flexible Pods", "Natural Daylighting", "Interactive Displays", "Quiet Reading Corners"],
      theme: "cream",
    },
    {
      id: "energy-arena",
      title: "Energy Arena",
      subtitle: "Multi-sport athletic complex for vigor and team sport",
      imageSrc: "/assets/football_ground.webp",
      imageAlt: "Sprawling athletic turf and outdoor sports complex",
      facilities: ["Basketball Court", "Volleyball", "Throwball", "Pickleball", "Skating Rink", "Athletic Track"],
      theme: "indigo",
    },
    {
      id: "creative-studios",
      title: "Creative Studios",
      subtitle: "Dedicated ateliers for artistic immersion and physical harmony",
      imageSrc: "/assets/campus-creative.png",
      imageAlt: "Fine art studio, music practice rooms and dance studio",
      facilities: ["Dance Studio", "Music Suite", "Fine Art Atelier", "Yoga Sanctuary", "Karate Dojo"],
      theme: "cream",
    },
    {
      id: "future-labs",
      title: "Future Labs",
      subtitle: "State-of-the-art investigative science and computing hubs",
      imageSrc: "/assets/campus-front.png",
      imageAlt: "Robotics and AI fabrication laboratory",
      facilities: ["AI & Robotics Lab", "Mathematics Hub", "Physics Lab", "Chemistry Lab", "Biology Lab"],
      theme: "indigo",
    },
  ] as CampusSpaceCard[],
};

