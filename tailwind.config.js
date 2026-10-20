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
          bg: 'rgb(var(--radar-bg-rgb, 10 15 20) / <alpha-value>)',
          panel: 'rgb(var(--radar-panel-rgb, 14 23 31) / <alpha-value>)',
          surface: 'rgb(var(--radar-surface-rgb, 20 32 43) / <alpha-value>)',
          border: 'rgb(var(--radar-border-rgb, 26 51 40) / <alpha-value>)',
          green: 'rgb(var(--radar-green-rgb, 0 255 102) / <alpha-value>)',
          'green-dim': 'rgb(var(--radar-green-dim-rgb, 0 187 74) / <alpha-value>)',
          'green-glow': 'rgba(var(--radar-green-rgb, 0 255 102), 0.25)',
          cyan: 'rgb(var(--radar-cyan-rgb, 0 229 255) / <alpha-value>)',
          'cyan-dim': 'rgb(var(--radar-cyan-dim-rgb, 0 153 170) / <alpha-value>)',
          'cyan-glow': 'rgba(var(--radar-cyan-rgb, 0 229 255), 0.25)',
          amber: 'rgb(var(--radar-amber-rgb, 255 170 0) / <alpha-value>)',
          alert: 'rgb(var(--radar-alert-rgb, 255 51 68) / <alpha-value>)',
          muted: 'rgb(var(--radar-muted-rgb, 148 168 164) / <alpha-value>)',
          grid: 'rgb(var(--radar-grid-rgb, 17 41 38) / <alpha-value>)',
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
