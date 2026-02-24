/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f172a',
          700: '#1e293b',
          800: '#0f172a',
          900: '#0a1628',
        },
        'medical-green': {
          500: '#10b981',
          600: '#059669',
        },
        'medical-blue': {
          DEFAULT: '#0284c7',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        urgent: '#dc2626',
        badge: {
          policy: '#1e40af',
          academic: '#059669',
          hospital: '#7c3aed',
          industry: '#ea580c',
          ai: '#0891b2',
          pharma: '#be185d',
          world: '#4f46e5',
          opinion: '#ca8a04',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', 'Georgia', 'serif'],
        headline: ['"Noto Serif KR"', 'Georgia', 'serif'],
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      spacing: {
        touch: '2.75rem',
        'touch-lg': '3rem',
      },
    },
  },
  plugins: [],
};
