/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Primary: deep teal (replaces forest green) ── */
        primary: {
          50:  '#F0FDFB',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488',   /* main CTA — teal */
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#0D3330',
          DEFAULT: '#0D9488',
        },
        /* ── Accent colours ── */
        sage:  '#5EEAD4',   /* light teal — dark-mode text highlights */
        teak:  '#D97706',   /* amber warm accent — unchanged */
        mist:  '#F8F7F5',   /* warm white background — light mode */
        /* ── Dark mode surfaces ── */
        void: {
          DEFAULT: '#0A0A0B',   /* page background */
          surface: '#111113',   /* card / elevated surface */
          card:    '#1A1A1E',   /* raised card */
          border:  '#2A2A2E',   /* subtle border */
          muted:   '#6B6B6B',   /* muted text */
        },
        cyan: {
          DEFAULT: '#00D9C8',   /* dark-mode accent — bright cyan */
          dim:     'rgba(0,217,200,0.12)',
        },
        forest: {
          dark:   '#0A0A0B',
          deeper: '#060607',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      borderWidth: { 3: '3px' },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':  'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' }, '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
