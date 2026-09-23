import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#001011",
          950: "#001011",
          900: "#041819",
          800: "#092426",
          700: "#0e3336",
        },
        teal: {
          dark: "#093A3E",
          tropical: "#3AAFB9",
          ink: "#001011",
          50: "#f0f8f9",
          100: "#d9eef0",
          200: "#b5dfe3",
          300: "#86cbd1",
          400: "#5cb4be",
          500: "#3AAFB9",
          600: "#278e98",
          700: "#1f6e77",
          800: "#093A3E",
          900: "#062a2d",
          950: "#001011",
        },
        brand: {
          DEFAULT: "#093A3E",
          dark: "#001011",
          accent: "#3AAFB9",
          light: "#d9eef0",
          border: "#cbe3e6",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
