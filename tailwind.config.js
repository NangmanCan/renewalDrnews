/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        'medical-blue': '#0284c7',
        'medical-blue-light': '#38bdf8',
      },
    },
  },
  plugins: [],
};
