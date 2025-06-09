/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    container: {
      center: true,
    },
    mytheme: {
      primary: "#67e8f9",
      secondary: "#6366f1",
      accent: "#6B0F1A",
      base: "808F85",
      neutral: "#595959",
      info: "#67e8f9",
      success: "#4ade80",
      warning: "#f59e0b",
      error: "#ff0000",
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#67e8f9",
          secondary: "#6366f1",
          accent: "#6B0F1A",
          base: "808F85",
          neutral: "#595959",
          info: "#67e8f9",
          success: "#4ade80",
          warning: "#f59e0b",
          error: "#ff0000",
        },
      },
    ],
  },
};
