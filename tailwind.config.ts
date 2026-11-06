import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          DEFAULT: "#3B3A82",
          deep: "#25245A",
          light: "#5553AA",
          soft: "rgba(59, 58, 130, 0.08)",
        },
        yellow: {
          golden: "#FDB92E",
          cream: "#FFF7DD",
          surface: "#FFEBB0",
          border: "#EDD38A",
        },
        muted: {
          text: "#4A4A72",
        },
        light: {
          text: "#E4E3F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Instrument Serif", "Georgia", "serif"],
      },
      borderRadius: {
        kcard: "24px",
        ktag: "6px",
        kbtn: "8px",
      },
      fontSize: {
        body: ["15px", { lineHeight: "1.6" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};
export default config;

