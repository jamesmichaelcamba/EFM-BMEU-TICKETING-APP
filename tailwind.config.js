/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'efm-bg': {
          100: '#F8FAF0',
          200: '#F2F5EB',
          300: '#ECEFE5',
          400: '#DFE4D7',
          500: '#C3C8BC',
          600: '#73796E',
        },
        'efm-text': {
          900: '#191D17',
          800: '#32382F',
          600: '#43483F',
          500: '#73796E',
          400: '#A0A0A0',
        },
        'efm-primary': {
          600: '#2B4F1E',
          500: '#426834',
          400: '#507741',
          300: '#A7D293',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(66, 104, 52, 0.15)',
        'glow-sm': '0 0 15px rgba(66, 104, 52, 0.1)',
      },
    },
  },
  plugins: [],
}
