export type FruitSpecies =
  | "avocado"
  | "banana"
  | "apple"
  | "strawberry"
  | "mango"
  | "orange"
  | "pineapple";

export interface MascotPalette {
  skinFrom: string;
  skinTo: string;
  fleshFrom: string;
  fleshTo: string;
  accent: string;
  cheeks: string;
}

export interface MascotPersonality {
  /** Seconds per wave cycle — smaller = snappier wave */
  waveSpeed: number;
  /** How many px the character jumps out from behind the button */
  jumpHeight: number;
  /** How wide the idle bounce is */
  bounceAmount: number;
  /** Extra flavor on the wave: single flick, double flick, or a big two-handed wave */
  waveStyle: "shy" | "double" | "big";
  greeting: string;
  goodbye: string;
}

export interface Mascot {
  id: FruitSpecies;
  label: string;
  palette: MascotPalette;
  personality: MascotPersonality;
}

export const MASCOTS: Record<FruitSpecies, Mascot> = {
  avocado: {
    id: "avocado",
    label: "Avocado",
    palette: {
      skinFrom: "#4E7A2E",
      skinTo: "#33501C",
      fleshFrom: "#C8E08C",
      fleshTo: "#9FC35F",
      accent: "#8A5A2B",
      cheeks: "#E8A57A",
    },
    personality: {
      waveSpeed: 0.55,
      jumpHeight: 86,
      bounceAmount: 8,
      waveStyle: "shy",
      greeting: "Thank you for visiting me!",
      goodbye: "See you again!",
    },
  },
  banana: {
    id: "banana",
    label: "Banana",
    palette: {
      skinFrom: "#FDE24A",
      skinTo: "#F6C51B",
      fleshFrom: "#FFF6D6",
      fleshTo: "#FCEBA0",
      accent: "#6B5A1A",
      cheeks: "#FFB08A",
    },
    personality: {
      waveSpeed: 0.4,
      jumpHeight: 100,
      bounceAmount: 10,
      waveStyle: "big",
      greeting: "Thanks a bunch for stopping by!",
      goodbye: "Peel you later!",
    },
  },
  apple: {
    id: "apple",
    label: "Apple",
    palette: {
      skinFrom: "#FF6B6B",
      skinTo: "#E23B3B",
      fleshFrom: "#FFF4E3",
      fleshTo: "#FCE6BF",
      accent: "#5B3A1E",
      cheeks: "#FF9D9D",
    },
    personality: {
      waveSpeed: 0.5,
      jumpHeight: 80,
      bounceAmount: 7,
      waveStyle: "double",
      greeting: "Thanks for visiting, sweetie!",
      goodbye: "Come back soon!",
    },
  },
  strawberry: {
    id: "strawberry",
    label: "Strawberry",
    palette: {
      skinFrom: "#FF6FA0",
      skinTo: "#E8386E",
      fleshFrom: "#FFD3E0",
      fleshTo: "#FFB6CD",
      accent: "#3F5C26",
      cheeks: "#FF9DBD",
    },
    personality: {
      waveSpeed: 0.35,
      jumpHeight: 92,
      bounceAmount: 11,
      waveStyle: "big",
      greeting: "Berry happy you're here!",
      goodbye: "Berry soon, promise!",
    },
  },
  mango: {
    id: "mango",
    label: "Mango",
    palette: {
      skinFrom: "#FFB347",
      skinTo: "#F07B1D",
      fleshFrom: "#FFE29A",
      fleshTo: "#FFC85C",
      accent: "#7A3E12",
      cheeks: "#FF9770",
    },
    personality: {
      waveSpeed: 0.6,
      jumpHeight: 78,
      bounceAmount: 6,
      waveStyle: "shy",
      greeting: "So mango happy you came by!",
      goodbye: "Catch you next time!",
    },
  },
  orange: {
    id: "orange",
    label: "Orange",
    palette: {
      skinFrom: "#FFA53E",
      skinTo: "#F27B14",
      fleshFrom: "#FFE4B0",
      fleshTo: "#FFCB78",
      accent: "#7A431A",
      cheeks: "#FF8F5E",
    },
    personality: {
      waveSpeed: 0.45,
      jumpHeight: 88,
      bounceAmount: 9,
      waveStyle: "double",
      greeting: "Orange you glad you visited?",
      goodbye: "Zest wishes, bye for now!",
    },
  },
  pineapple: {
    id: "pineapple",
    label: "Pineapple",
    palette: {
      skinFrom: "#FFD23F",
      skinTo: "#E8A521",
      fleshFrom: "#FFF3C4",
      fleshTo: "#FCE485",
      accent: "#3F5C26",
      cheeks: "#FFAE7A",
    },
    personality: {
      waveSpeed: 0.42,
      jumpHeight: 96,
      bounceAmount: 9,
      waveStyle: "big",
      greeting: "Thanks for a-peeling to me!",
      goodbye: "Stay sweet, see ya!",
    },
  },
};

export const MASCOT_LIST: Mascot[] = Object.values(MASCOTS);

export function pickRandomMascot(): Mascot {
  const list = MASCOT_LIST;
  return list[Math.floor(Math.random() * list.length)];
}