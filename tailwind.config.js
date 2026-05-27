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
        brand: {
          // 딥 틸 그린 — 의료 + 신문의 신뢰감 (Tailwind teal 계열 기반, 600을 가장 많이 쓰는 메인 액센트로 사용)
          DEFAULT: '#0f766e',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0f766e', // 메인 액센트 (기존 orange-600 자리)
          700: '#115e59',
          800: '#134e4a',
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
        // 명조/세리프 폰트는 사용하지 않음 — Pretendard로 통일
        serif: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        headline: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
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
