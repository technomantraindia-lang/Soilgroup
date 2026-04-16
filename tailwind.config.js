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
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        soil: {
          green: '#1B5E20',
          'green-dark': '#0D3B0F',
          'green-light': '#2E7D32',
          yellow: '#F9A825',
          brown: '#5D4037',
          cream: '#FFF8E1',
        }
      },
      fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  display: ['Nunito', 'sans-serif'],
},
    },
  },
  plugins: [],
}
