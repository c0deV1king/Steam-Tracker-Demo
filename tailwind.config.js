/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    container: {
      center: true,
    },
    mytheme: {
      "primary": "#67e8f9",
      "secondary": "#6366f1",
      "accent": "#fde047",
      "neutral": "#0284c7",
      "base-100": "#164e63",
      "info": "#67e8f9",
      "success": "#4ade80",
      "warning": "#f59e0b",
      "error": "#ff0000",
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#67e8f9",
          "secondary": "#6366f1",
          "accent": "#fde047",
          "neutral": "#0284c7",
          "base-100": "#164e63",
          "info": "#67e8f9",
          "success": "#4ade80",
          "warning": "#f59e0b",
          "error": "#ff0000",
        },
      },
    ],
  }
}

