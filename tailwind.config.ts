import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vouch is a paper-and-ink product, not a dark dashboard.
        // The old names are kept so the existing components can share
        // one palette while the interface is migrated.
        paper: "#f4f1e9",
        "paper-2": "#ebe6da",
        "paper-3": "#e1dbcc",
        ink: "#161512",
        coal: "#211f1a",
        panel: "#faf8f2",
        mist: "#746e62",
        chalk: "#161512",
        line: "#d7d0c0",
        "line-strong": "#bdb4a1",
        lime: "#d83a1d",
        mint: "#3d6b50",
        sky: "#2f55c7",
        ember: "#b23a1a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        paper: "0 1px 0 rgba(22, 21, 18, 0.04), 0 18px 50px -34px rgba(22, 21, 18, 0.3)",
        lift: "0 24px 70px -38px rgba(22, 21, 18, 0.42)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.8)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        drift: "drift 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
