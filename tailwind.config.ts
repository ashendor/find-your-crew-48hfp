import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EFE6D2",
        ink: "#1A1817",
        rust: "#B4442E",
        mustard: "#D9A53F",
        "dubai-blue": "#2E86C1",
      },
      fontFamily: {
        headline: ["'Archivo Black'", "sans-serif"],
        label: ["'Archivo'", "sans-serif"],
        body: ["'Courier Prime'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
