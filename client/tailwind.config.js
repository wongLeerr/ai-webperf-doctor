/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff6b00',
          50: '#fff4e6',
          100: '#ffe6cc',
          200: '#ffcc99',
          300: '#ffb366',
          400: '#ff9933',
          500: '#ff6b00',
          600: '#cc5600',
          700: '#994000',
          800: '#662b00',
          900: '#331500',
        },
      },
    },
  },
  plugins: [],
}
