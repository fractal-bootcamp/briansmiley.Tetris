/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '20%, 80%': { opacity: '.8' },
          '50%': { opacity: '.2' },
        },
      },
      animation: {
        flash: 'flash 1s linear infinite',
      },
    },
  },
  plugins: [],
};
