/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sandTan: {
          DEFAULT: "#e1b382",
          shadow: "#c89666",
        },
        nightBlue: {
          DEFAULT: "#2d545e",
          shadow: "#12343b",
        },
      },
    },
  },
  plugins: [],
};
