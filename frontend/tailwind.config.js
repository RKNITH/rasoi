/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff8f5',
          100: '#ffede5',
          200: '#ffcfb3',
          300: '#ffab7a',
          400: '#ff8040',
          500: '#FF6B35',
          600: '#e5521c',
          700: '#c23d10',
          800: '#9e2e0b',
          900: '#7a2109',
        },
        secondary: {
          50: '#fef9ee',
          100: '#fdf0d5',
          200: '#fad9a2',
          300: '#f7bc62',
          400: '#F7931E',
          500: '#f47b0d',
          600: '#d96008',
          700: '#b4440b',
          800: '#90350f',
          900: '#762d0f',
        },
        dark: {
          50: '#f0f0f8',
          100: '#d8d8ef',
          200: '#b0b0df',
          300: '#8080c7',
          400: '#5050a7',
          500: '#1a1a2e',
          600: '#151525',
          700: '#10101c',
          800: '#0a0a12',
          900: '#050509',
        }
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        bounceSoft: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } }
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card': '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(0,0,0,0.12)',
        'primary': '0 8px 25px rgba(255, 107, 53, 0.35)',
        'primary-lg': '0 16px 48px rgba(255, 107, 53, 0.4)',
      }
    },
  },
  plugins: [],
};
