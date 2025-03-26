/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          sans: ["Inter", "sans-serif"],
          heading: ["Poppins", "sans-serif"],
        },
        colors: {
          primary: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0369a1",
            800: "#075985",
            900: "#0c4a6e",
          },
          secondary: {
            50: "#fef8e7",
            100: "#fef2c0",
            200: "#fce588",
            300: "#fbd256",
            400: "#fab228",
            500: "#f99b09",
            600: "#f47307",
            700: "#ca520c",
            800: "#a13e11",
            900: "#82320f",
          },
        },
      },
    },
    plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
  };