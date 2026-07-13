/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 12px 36px rgba(18, 18, 18, 0.07)',
        nav: '0 -8px 30px rgba(18, 18, 18, 0.06)',
      },
    },
  },
  plugins: [],
}
