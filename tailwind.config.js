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
      },
      fontFamily: {
        headline: ['"Noto Serif KR"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Noto Sans KR"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
