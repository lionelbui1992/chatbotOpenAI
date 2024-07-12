/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        't-sm':'400px',
        'xs':'500px',
        'sm':'640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
        '5xl': '3840px',
        'max-400': { 'max': '400px' },
      },
      colors: {
        gray: {
          500: 'rgba(142, 142, 160, var(--tw-text-opacity))',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
