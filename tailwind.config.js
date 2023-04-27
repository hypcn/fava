const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "index.html",
    "./src/**/*.{html,js,ts,css}",
  ],
  theme: {
    extend: {
      colors: {
        // primary: {
        //   light: colors.emerald[400],
        //   DEFAULT: colors.emerald[400],
        //   dark: colors.emerald[700],
        //   contrast: colors.zinc[50],
        // },
        light: {
          light: colors.zinc[100],
          DEFAULT: colors.zinc[100],
          dark: colors.zinc[300],
          contrast: colors.zinc[800],
        },
        dark: {
          light: colors.zinc[700],
          DEFAULT: colors.zinc[800],
          dark: colors.zinc[900],
          contrast: colors.white, //colors.zinc[100],
        },
        hint: {
          DEFAULT: colors.zinc[500],
          // contrast: colors.zinc[50],
        },
        border: {
          DEFAULT: colors.zinc[300],
        },
        link: {
          light: colors.sky[500],
          DEFAULT: colors.sky[700],
          dark: colors.sky[800],
        },
      },
    },
  },
  plugins: [],
}

