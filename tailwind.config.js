/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: '#0a0f14',
          panel: '#0e171f',
          surface: '#14202b',
          border: '#1a3328',
          green: '#00ff66',
          'green-dim': '#00bb4a',
          'green-glow': 'rgba(0, 255, 102, 0.25)',
          cyan: '#00e5ff',
          'cyan-dim': '#0099aa',
          'cyan-glow': 'rgba(0, 229, 255, 0.25)',
          amber: '#ffaa00',
          alert: '#ff3344',
          muted: '#4a6764',
          grid: '#112926',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'radar-green': '0 0 10px rgba(0, 255, 102, 0.4)',
        'radar-cyan': '0 0 10px rgba(0, 229, 255, 0.4)',
        'radar-inset': 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
