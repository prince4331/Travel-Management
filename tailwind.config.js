/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f8ff',
          100: '#e0efff',
          200: '#b8dbff',
          300: '#84c1ff',
          400: '#519fff',
          500: '#1e7dff',
          600: '#0b5fe6',
          700: '#0849b4',
          800: '#063785',
          900: '#04275c',
        },
      },
    },
  },
  plugins: [],
};
