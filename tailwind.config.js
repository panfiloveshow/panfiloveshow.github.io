/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/main.tsx',
    './src/App.tsx',
    './src/components/layout/**/*.{ts,tsx}',
    './src/components/legal/**/*.{ts,tsx}',
    './src/components/primitives/OperationalWorkspaceDemo.tsx',
    './src/components/primitives/ScrollProgress.tsx',
    './src/components/sections/XwayInspiredLanding.tsx',
    './src/components/shared/**/*.{ts,tsx}',
    './src/components/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F8F3',
          100: '#C0EFE1',
          200: '#91E3CD',
          300: '#64D5B8',
          400: '#47D1A5',
          500: '#2DBB90',
          600: '#209672',
          700: '#177357',
          800: '#11543F',
          900: '#0C3829',
        },
        accent: {
          DEFAULT: '#47D1A5',
          glow: '#64D5B8',
        },
        cream: {
          50: '#FBFCFB',
          100: '#F7F8FB',
          200: '#F1F5F2',
        },
        ink: {
          950: '#090E17',
          900: '#111A2A',
          800: '#1D2A4D',
          700: '#2B3E6A',
          600: '#3D5482',
          500: '#5A73A3',
          400: '#849BC5',
          300: '#B2C4E0',
          200: '#D5DFEF',
          100: '#E9EEF6',
          50: '#F4F7FB',
        },
        surface: {
          light: '#F8F9FC',
          muted: '#EEF2F7',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        hand: ['"Segoe Print"', '"Bradley Hand"', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-soft': '0 0 60px -10px rgba(91, 228, 155, 0.22)',
        'card-hover': '0 1px 2px rgba(15,23,42,.04), 0 18px 40px -20px rgba(15,23,42,.10)',
        'card': '0 1px 2px rgba(15,23,42,.04), 0 12px 32px -16px rgba(15,23,42,.08)',
      },
      keyframes: {
        'orbit-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'rise-fade': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'orbit-slow': 'orbit-slow 32s linear infinite',
        'rise-fade': 'rise-fade 0.6s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
