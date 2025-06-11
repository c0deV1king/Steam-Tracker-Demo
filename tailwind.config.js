/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#59595F", // davy's gray -- no black
          secondary: "#96031A", // carmine -- no black
          accent: "#DFCC74", // citron -- no white
          "base-100": "#394648", // outer space -- no black
          neutral: "#000000", // x
          info: "#000000", // x
          success: "#000000", // x
          warning: "#000000", // x
          error: "#000000", // x
        },
      },
    ],
  },
};
