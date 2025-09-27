/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FFE0EC',
        'pastel-blue': '#E0F2FF',
        'pastel-mint': '#E0FFF0',
        'pastel-lavender': '#F0E0FF',
        'pastel-yellow': '#FFF9E0',
        'pastel-peach': '#FFE8E0',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}