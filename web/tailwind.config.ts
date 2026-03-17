import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        meal: {
          beforeBreakfast: "var(--meal-before-breakfast)",
          afterBreakfast: "var(--meal-after-breakfast)",
          afterDinner: "var(--meal-after-dinner)",
          bedtime: "var(--meal-bedtime)",
        },
        status: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          critical: "var(--color-critical)",
          done: "var(--color-done)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border-color)",
          active: "var(--border-active)",
          warning: "var(--border-warning)",
        },
      },
      fontFamily: {
        thai: ["var(--font-noto-thai)", "Noto Sans Thai", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        focus: "0 0 0 3px rgba(16,185,129,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
