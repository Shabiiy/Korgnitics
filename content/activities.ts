export interface ActivitySubCard {
  id: string;
  iconName: string;
  title: string;
  tagline: string;
  description: string;
}

export const activitiesContent = {
  sectionTag: "Holistic Development",
  headlinePrefix: "Life doesn't happen in classrooms",
  headlineAccentLetter: "a",
  headlineSuffix: "lone",
  videoSrc: "/assets/Activities.mp4",
  posterSrc: "/assets/activities-poster.jpg",
  playPrompt: "Watch the rhythm of campus life",
  pills: [
    "Music & Acoustics",
    "Karate & Martial Arts",
    "Robotics & Coding",
    "Fine Art & Pottery",
    "Competitive Sports",
    "Applied Sciences",
    "Performing Theatre",
    "Debate & MUN",
  ],
  subCards: [
    {
      id: "learning",
      iconName: "book-open",
      title: "Learning",
      tagline: "Intellectual Depth",
      description: "Rigorous academic inquiry blended with hands-on labs and real-world experiments that make concepts come alive.",
    },
    {
      id: "friendship",
      iconName: "users",
      title: "Friendship",
      tagline: "Lifelong Bonds",
      description: "A supportive, inclusive peer culture where diverse voices are celebrated and deep mutual respect is fostered daily.",
    },
    {
      id: "playing",
      iconName: "trophy",
      title: "Playing",
      tagline: "Physical Vitality",
      description: "Sprawling athletic arenas and professional sports coaching building stamina, tactical grit, and team spirit.",
    },
    {
      id: "expression",
      iconName: "palette",
      title: "Expression",
      tagline: "Creative Voice",
      description: "Music studios, drama theaters, and art workshops where children discover their distinct voice and articulate ideas.",
    },
  ] as ActivitySubCard[],
};

