/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f2ff',
          100: '#e6ddff',
          200: '#d2c2f6',
          300: '#b89bef',
          400: '#9f75e8',
          500: '#8A56E2', // roxo encantado
          600: '#7a46d1',
          700: '#6D3FC4',
          800: '#5b32a7',
          900: '#472a88',
          950: '#321e64',
        },
        secondary: {
          50: '#fff9e6',
          100: '#fff1c2',
          200: '#ffe58a',
          300: '#ffd952',
          400: '#ffcd1a',
          500: '#F4D35E', // dourado mágico
          600: '#EFBF2B',
          700: '#d4a211',
          800: '#b2870d',
          900: '#8f6b08',
          950: '#5c4502',
        },
        success: {
          500: '#22c55e',
        },
        warning: {
          500: '#f59e0b',
        },
        error: {
          500: '#ef4444',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
