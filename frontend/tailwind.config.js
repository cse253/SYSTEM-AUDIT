/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        brand: {
          amber: '#F59E0B',
          amberDark: '#D97706',
          amberLight: '#FEF3C7',
        }
      }
    },
  },
  plugins: [],
}
