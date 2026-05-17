/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        dark: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
        },
        accent: {
          cyan: '#0ea5e9',
          neon: '#10ff00',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b',
          yellow: '#fbbf24',
        },
      },
      backgroundColor: {
        dark: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#334155',
        },
      },
      borderColor: {
        dark: {
          bg: '#0f172a',
          panel: '#1e293b',
          border: '#646b75',
        },
      },
      textColor: {
        accent: {
          cyan: '#0ea5e9',
          neon: '#10ff00',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f59e0b',
          yellow: '#fbbf24',
        },
      },
      animation: {
        'flow': 'flow 2s linear infinite',
        'energy-flow': 'energy-flow 1.5s linear infinite',
      },
      keyframes: {
        'flow': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-12' },
        },
        'energy-flow': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-12' },
        },
      },
    },
  },
  plugins: [],
}
