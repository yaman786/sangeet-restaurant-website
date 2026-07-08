import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/_pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Jewel & Obsidian palette — benchmarked against Stripe/Vercel
        sangeet: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f5dfaa',
          300: '#edc974',
          400: '#D4AF37',   // Metallic Gold — the hero accent
          500: '#c19b2e',
          600: '#a67c24',
          700: '#87611e',
          800: '#6e4e1e',
          900: '#5c411d',
          950: '#352210',
        },
        'sangeet-red': {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#facccc',
          300: '#f5a3a3',
          400: '#e06b6b',
          500: '#c9433c',   // Deep Ruby — warm, not aggressive
          600: '#a83230',
          700: '#8B0000',   // Dark Ruby — elegant deep red
          800: '#732020',
          900: '#611f1f',
          950: '#340c0c',
        },
        'sangeet-neutral': {
          50: '#f7f7f5',
          100: '#edece8',
          200: '#dbd8d0',
          300: '#c4bfb3',
          400: '#a09888',
          500: '#8a8070',
          600: '#6e6559',
          700: '#4a4540',
          800: '#1c1a17',   // Obsidian Dark
          900: '#131210',   // Deep Obsidian
          950: '#0a0908',   // Near Black
        }
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'sans': ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Strict typographic scale — no ad-hoc sizes
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-md': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 24px 48px rgba(0, 0, 0, 0.16)',
        'gold-glow': '0 0 24px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 48px rgba(212, 175, 55, 0.2)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1), 0 16px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
};
export default config;
