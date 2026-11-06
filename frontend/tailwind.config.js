/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050507",
          900: "#08080B",
          850: "#0B0B10",
          800: "#101016",
          700: "#16161D",
          600: "#1E1E27",
        },
        line: "rgba(255,255,255,0.08)",
        near: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          900: "#0c4a6e",
        },
        midnight: {
          50: "#fafafa",
          100: "#f4f4f5",
          400: "#a1a1aa",
          500: "#71717a",
          900: "#27272a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 60px -20px rgba(139,92,246,0.55)",
        amber: "0 0 50px -18px rgba(245,158,11,0.55)",
        card: "0 24px 80px -32px rgba(0,0,0,0.9)",
      },
      animation: {
        aurora: "aurora 22s ease-in-out infinite alternate",
        "aurora-slow": "aurora 32s ease-in-out infinite alternate-reverse",
        float: "float 7s ease-in-out infinite",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.4s ease-out both",
        shimmer: "shimmer 2.6s linear infinite",
        "pulse-soft": "pulseSoft 3.2s ease-in-out infinite",
        "dash-flow": "dashFlow 1.2s linear infinite",
      },
      keyframes: {
        aurora: {
          "0%": { transform: "translate3d(-6%, -4%, 0) scale(1)" },
          "50%": { transform: "translate3d(4%, 6%, 0) scale(1.12)" },
          "100%": { transform: "translate3d(8%, -6%, 0) scale(0.96)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        dashFlow: {
          to: { strokeDashoffset: "-16" },
        },
      },
    },
  },
  plugins: [],
};
