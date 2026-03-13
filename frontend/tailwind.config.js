/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef3f9',
          100: '#d4e0f0',
          200: '#a9c1e1',
          300: '#7da2d2',
          400: '#5283c3',
          500: '#2764b4',
          600: '#1e3a5f',
          700: '#1a3254',
          800: '#152a48',
          900: '#0f1f36',
        },
        accent: {
          50: '#fdf6e8',
          100: '#faebc4',
          200: '#f5d78a',
          300: '#f0c350',
          400: '#e8a838',
          500: '#d4922a',
          600: '#b07520',
          700: '#8c5a18',
          800: '#684010',
          900: '#442808',
        },
      },
    },
  },
  plugins: [],
}
