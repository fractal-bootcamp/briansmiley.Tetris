/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },

          '50%': { opacity: '0' },
        },
        fadedFlash: {
          '0%, 100%': { opacity: '1' },

          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        flash: 'flash 2s step-end infinite',
        fadedFlash: 'fadedFlash 2s step-end infinite',
        fastFlash: 'flash 1s step-end infinite',
        fastFadedFlash: 'fadedFlash 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
