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
          muted: '#82828b', // 5.1:1 on surface, passes WCAG AA
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
        engine: '#22c55e', // emerald, the single accent color
      },
      fontFamily: {
        display: ['"Geist Sans"', 'system-ui', 'sans-serif'],
        body: ['"Geist Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        industrial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
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
        blink: 'blink 1s step-end infinite',
        marquee: 'marquee linear infinite',
      },
    },
  },
  plugins: [],
};