/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#bfd2ff",
          300: "#94b3ff",
          400: "#6088ff",
          500: "#3a63ff",
          600: "#2447f0",
          700: "#1d37c8",
          800: "#1c30a0",
          900: "#1c2e7e",
        },
      },
    },
  },
  plugins: [],
};
