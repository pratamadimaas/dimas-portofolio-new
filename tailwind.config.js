/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark — "Deep Obsidian Tech Noir"
        obsidian: {
          bg: '#050507',
          surface: '#0c0c0e',
          border: 'rgba(255,255,255,0.07)',
          text: '#f4f4f5',
          muted: '#71717a',
        },
        // Light — "Architectural Blueprint / Clean Titanium"
        titanium: {
          bg: '#f8fafc',
          bg2: '#f1f5f9',
          surface: '#ffffff',
          border: 'rgba(15,23,42,0.10)',
          text: '#0f172a',
          muted: '#64748b',
        },
        // Shared accents
        engine: '#22c55e', // emerald status engine
        pulse: '#3b82f6',  // cobalt data pulse
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'blueprint-grid':
          'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
        'noir-grid':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      transitionTimingFunction: {
        industrial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'ping-soft': {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'ping-soft': 'ping-soft 2.2s cubic-bezier(0,0,0.2,1) infinite',
        blink: 'blink 1s step-end infinite',
        marquee: 'marquee linear infinite',
      },
    },
  },
  plugins: [],
};