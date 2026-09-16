/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          bg: '#faf8f5',
          surface: '#ffffff',
          border: '#e6e2dc',
          text: '#1c1917',
          muted: '#78716c',
          terracotta: '#da7756',
          terracottaDark: '#c86343',
          terracottaBg: '#f6eee9',
          terracottaBorder: '#e6d4c9'
        },
        brand: {
          surface: '#ffffff',
          subtle: '#faf8f5',
          border: '#e6e2dc',
          dark: '#1c1917',
          emerald: '#059669',
          emeraldBg: '#ecfdf5',
          emeraldBorder: '#a7f3d0',
          amber: '#d97706',
          amberBg: '#fef3c7',
          rose: '#e11d48',
          roseBg: '#ffe4e6'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Space Grotesk', 'JetBrains Mono', 'monospace']
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}


