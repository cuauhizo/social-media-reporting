/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'pluxee-blue': '#002d72',
        'pluxee-yellow': '#ffeb00',
      },
    },
  },
  plugins: [],
}
