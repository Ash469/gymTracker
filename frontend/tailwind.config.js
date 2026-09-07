/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080a10',
          panel: 'rgba(15, 20, 32, 0.85)',
          panelHover: 'rgba(25, 32, 50, 0.95)',
          border: 'rgba(255, 255, 255, 0.08)',
          emerald: '#00ff9d',
          emeraldDark: '#00c875',
          cyan: '#00d8ff',
          warning: '#ff3b5c',
          amber: '#ffd000'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace']
      }
    },
  },
  plugins: [],
}
