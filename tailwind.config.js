/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direction B — Modern devotional minimal
        saff: {
          50: '#fdf1e7',
          100: '#fbe9d7',
          200: '#f3d4b4',
          500: '#d2691e', // single saffron accent (use for FILLS only)
          600: '#b9591a',
          700: '#8f430f', // AA-safe saffron for TEXT on white (>=4.5:1)
        },
        ink: {
          900: '#1c1b19', // near-black primary
          800: '#2a2824',
          700: '#3a3833',
          500: '#6b6762', // muted text
          400: '#9a958e',
        },
        paper: {
          bg: '#faf8f4',   // page background
          card: '#ffffff', // card surface
          line: '#eceae5', // hairline border
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        14: 'repeat(14, minmax(0, 1fr))',
      },
    },
  },
  plugins: [],
}
