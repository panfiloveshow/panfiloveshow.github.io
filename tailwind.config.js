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
    './src/components/sections/LandingFinalSections.tsx',
    './src/components/sections/XwayInspiredLanding.tsx',
    './src/components/shared/**/*.{ts,tsx}',
    './src/components/ui/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
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
        sky: {
          50: '#F0F7FF',
          100: '#DCEBFF',
          200: '#B8D7FF',
          300: '#8FBEFA',
          400: '#6FA8FF',
          500: '#3D82F0',
          600: '#2A6BD4',
          700: '#1E52A8',
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
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'display-sm': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['4rem', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'display-lg': ['5.5rem', { lineHeight: '0.94', letterSpacing: '-0.035em' }],
        'display-xl': ['7rem', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display-2xl': ['8.5rem', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-brand': '0 0 60px -24px rgba(44, 186, 102, 0.35)',
        'glow-soft': '0 0 60px -10px rgba(91, 228, 155, 0.22)',
        'glass-dark': '0 1px 0 rgba(255,255,255,.06) inset, 0 8px 40px rgba(0,0,0,.45)',
        'glass-light': '0 1px 0 rgba(255,255,255,.7) inset, 0 8px 32px rgba(15,23,42,.06)',
        'card-hover': '0 1px 2px rgba(15,23,42,.04), 0 18px 40px -20px rgba(15,23,42,.10)',
        'card': '0 1px 2px rgba(15,23,42,.04), 0 12px 32px -16px rgba(15,23,42,.08)',
        'card-soft': '0 1px 2px rgba(15,23,42,.03), 0 8px 24px -12px rgba(15,23,42,.06)',
        'btn-brand': '0 1px 2px rgba(15,23,42,.06), 0 10px 24px -10px rgba(44,186,102,.45), inset 0 1px 0 rgba(255,255,255,.22)',
        'float-card': '0 1px 2px rgba(15,23,42,.04), 0 18px 50px -24px rgba(15,23,42,.18)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 88% 8%, rgba(91,228,155,0.10) 0px, transparent 55%), radial-gradient(at 12% 78%, rgba(111,168,255,0.08) 0px, transparent 55%), linear-gradient(180deg,#FFFFFF 0%,#F7F8FB 100%)',
        'mesh-soft':
          'radial-gradient(at 92% 12%, rgba(91,228,155,0.08) 0px, transparent 50%), radial-gradient(at 8% 88%, rgba(111,168,255,0.06) 0px, transparent 50%)',
        'mesh-dark':
          'radial-gradient(at 12% 8%, rgba(44,186,102,0.22) 0px, transparent 55%), radial-gradient(at 88% 24%, rgba(91,228,155,0.14) 0px, transparent 50%), radial-gradient(at 72% 92%, rgba(44,186,102,0.18) 0px, transparent 55%)',
        'grid-light':
          'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.05)' },
        },
        'orbit-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'mesh-drift': {
          '0%, 100%': { backgroundPosition: '0% 0%, 100% 0%, 50% 100%' },
          '50%': { backgroundPosition: '20% 30%, 80% 20%, 60% 80%' },
        },
        'border-spin': {
          '0%': { '--angle': '0deg' },
          '100%': { '--angle': '360deg' },
        },
        'rise-fade': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'tick-up': {
          '0%': { transform: 'translateY(110%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'beam-sweep': {
          '0%': { transform: 'translateX(-30%) skewX(-12deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(130%) skewX(-12deg)', opacity: '0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 6s ease-in-out infinite',
        'orbit-slow': 'orbit-slow 32s linear infinite',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        'mesh-drift': 'mesh-drift 18s ease-in-out infinite',
        'border-spin': 'border-spin 8s linear infinite',
        'rise-fade': 'rise-fade 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'beam-sweep': 'beam-sweep 4.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
