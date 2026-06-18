import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
        },
        accent: {
          DEFAULT: "#84CC16",
          400: "#A3E635",
          500: "#84CC16",
          600: "#65A30D",
        },
        eco: {
          bg: "#F8FAFC",
          dark: "#0F172A",
          card: "#1E293B",
          muted: "#64748B",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "gradient": "gradient-shift 5s ease infinite",
        "fade-in": "fade-in 0.6s ease forwards",
        "slide-up": "slide-up 0.5s ease forwards",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "blob": "blob 7s infinite",
        "text-shimmer": "text-shimmer 2.5s ease-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-20px) rotate(2deg)" },
          "66%": { transform: "translateY(-10px) rotate(-2deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(34, 197, 94, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(34, 197, 94, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        }
      },
      backgroundImage: {
        "eco-gradient": "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
        "eco-gradient-soft": "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(132, 204, 22, 0.1) 100%)",
        "hero-pattern": "radial-gradient(ellipse at 50% 0%, rgba(34, 197, 94, 0.15) 0%, transparent 60%)",
        "dot-pattern": "radial-gradient(circle, rgba(34, 197, 94, 0.15) 1px, transparent 1px)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
        "mesh-light": "radial-gradient(at 40% 20%, hsla(141,72%,60%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(84,81%,60%,0.15) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(141,72%,60%,0.1) 0px, transparent 50%)",
        "mesh-dark": "radial-gradient(at 40% 20%, hsla(141,72%,40%,0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(84,81%,40%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(141,72%,40%,0.15) 0px, transparent 50%)",
      },
      backgroundSize: {
        "dot": "32px 32px",
      },
      boxShadow: {
        "eco": "0 4px 24px rgba(34, 197, 94, 0.15)",
        "eco-lg": "0 8px 40px rgba(34, 197, 94, 0.25)",
        "eco-xl": "0 20px 60px rgba(34, 197, 94, 0.3)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255,255,255,0.2)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255,255,255,0.05)",
        "inner-glow": "inset 0 0 20px rgba(34, 197, 94, 0.1)",
        "glow": "0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
        md: "12px",
        lg: "24px",
        xl: "40px",
      },
    },
  },
  plugins: [],
} satisfies Config;
