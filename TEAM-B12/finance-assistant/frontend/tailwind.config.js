/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F2EA",
        paperDark: "#EFE8DA",
        ink: "#1F2421",
        inkSoft: "#4A4F4A",
        forest: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
          soft: "#74C69D",
        },
        gold: {
          DEFAULT: "#C99A2E",
          light: "#E2BD63",
          dark: "#9C6B1F",
        },
        rust: "#B23A48",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 35px, rgba(31,36,33,0.06) 35px, rgba(31,36,33,0.06) 36px)",
      },
      boxShadow: {
        receipt: "0 1px 0 rgba(31,36,33,0.06), 0 8px 24px -12px rgba(27,67,50,0.25)",
      },
    },
  },
  plugins: [],
};
