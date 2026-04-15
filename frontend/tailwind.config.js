/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pluxeeBlue: '#221c46',
        pluxeeBlueLight: '#17ccf9',
        pluxeeGreen: '#00eb5d',
        pluxeeYellow: '#ffdc37',
        pluxeePink: '#ff7375',
        tolkoRed: '#cc0032',
      },
    },
  },
  plugins: [],
}
