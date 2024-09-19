/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#f7f4e4',
          100: '#f2ebd9',
          200: '#ebdfc0',
          300: '#d9c698',
          400: '#BC8A5F',
          500: '#A47148',
          600: '#8B5E34',
          700: '#6F4518',
          800: '#603808',
          900: '583101',
        },   
        gray: {
          50: '#f9f9f9',
          100: '#ececec',
          200: '#e3e3e3',
          300: '#cdcdcd',
          400: '#b4b4b4',
          500: '#9b9b9b',
          600: '#676767',
          700: '#424242',
          750: '#2f2f2f',
          800: '#212121',
          900: '#171717',
        },
      },
    },
  },
}
