/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pluxeeBlue: '#002d72',
        pluxeeYellow: '#ffeb00',
      },
    },
  },
  plugins: [],
}
