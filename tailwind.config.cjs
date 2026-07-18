/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        ink: '#111827',
        mist: '#f8fafc',
      },
      boxShadow: {
        glow: '0 18px 45px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.14), transparent 35%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.18), transparent 30%)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        khmer: ['Battambang', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
