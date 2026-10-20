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
        ink: "#05070a",
        coal: "#080b10",
        panel: "#0b1016",
        mist: "#8a97a6",
        chalk: "#e9eef4",
        lime: "#c8ff4a",
        mint: "#7dffc4",
        sky: "#66d9ff",
        ember: "#ff7a59",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(200,255,74,0.35)",
        panel: "0 30px 80px -40px rgba(0,0,0,0.9)",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(0.75)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-7px)" },
        },
        scan: {
          "0%": { transform: "translateY(-120%)" },
          "100%": { transform: "translateY(520%)" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
      },
      animation: {
        "pulse-dot": "pulseDot 2.4s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        scan: "scan 5s linear infinite",
        sweep: "sweep 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
