/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      maxWidth: {
        'site': '1600px',
      },
      colors: {
        background: '#0A0A0B',
        surface:    '#111114',
        card:       '#16161A',
        border:     'rgba(255,255,255,0.06)',
        accent: {
          blue:   '#3B82F6',
          green:  '#10B981',
          indigo: '#6366F1',
        },
        semantic: {
          profit: '#10B981',
          loss:   '#F43F5E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-blue':  '0 0 20px rgba(59,130,246,0.25)',
        'glow-green': '0 0 20px rgba(16,185,129,0.25)',
        'glow-rose':  '0 0 20px rgba(244,63,94,0.25)',
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
        'gradient-profit': 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
      },
    },
  },
  plugins: [],
}
