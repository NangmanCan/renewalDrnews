# Dr.News UI/UX 개선 계획서

## 📋 개요

시사저널(sisajournal.com) 스타일을 참조하여 Dr.News의 **의료 전문 저널** 느낌을 살리면서 **모바일 가독성**을 대폭 개선하는 UI/UX 리뉴얼 계획입니다.

---

## 🎨 1. 타이포그래피 시스템

### 1.1 폰트 구성

| 용도 | 현재 | 변경 | 이유 |
|------|------|------|------|
| 헤드라인 | Pretendard ExtraBold | **Noto Serif KR** | 권위있는 저널 느낌 |
| 본문 | Pretendard | Pretendard (유지) | 가독성 우수 |
| UI 요소 | Pretendard | Pretendard (유지) | 일관성 |

### 1.2 타이포 스케일 (Mobile-First)

```
모바일 (base)
├── headline-xl: 24px / line-height 1.35 / Noto Serif KR Bold
├── headline-lg: 20px / line-height 1.4 / Noto Serif KR Bold  
├── headline-md: 18px / line-height 1.4 / Noto Serif KR SemiBold
├── headline-sm: 16px / line-height 1.5 / Noto Serif KR SemiBold
├── body-lg: 16px / line-height 1.75 / Pretendard
├── body-md: 15px / line-height 1.7 / Pretendard
├── body-sm: 14px / line-height 1.6 / Pretendard
└── caption: 12px / line-height 1.5 / Pretendard

데스크탑 (md+)
├── headline-xl: 32px / line-height 1.3
├── headline-lg: 24px / line-height 1.35
├── headline-md: 20px / line-height 1.4
└── (나머지 동일)
```

---

## 🎨 2. 색상 팔레트

### 2.1 Primary Colors (의료 저널 톤)

```css
/* 메인 컬러 */
--navy-900: #0a1628;     /* 로고, 강조 */
--navy-800: #0f172a;     /* GNB, 헤더 */
--navy-700: #1e293b;     /* 보조 배경 */

/* 의료 그린 */
--medical-green-600: #059669;  /* 악센트 */
--medical-green-500: #10b981;  /* 호버 */

/* 의료 블루 */
--medical-blue-600: #0284c7;   /* 링크, CTA */
--medical-blue-500: #0ea5e9;   /* 호버 */
```

### 2.2 Semantic Colors

```css
/* 긴급/속보 */
--urgent-red: #dc2626;
--urgent-red-light: #fef2f2;

/* 카테고리 뱃지 (통일) */
--badge-policy: #1e40af;       /* 정책 - 딥블루 */
--badge-academic: #059669;     /* 학술 - 그린 */
--badge-hospital: #7c3aed;     /* 병원 - 퍼플 */
--badge-industry: #ea580c;     /* 산업 - 오렌지 */
--badge-ai: #0891b2;           /* AI - 시안 */
--badge-pharma: #be185d;       /* 제약바이오 - 마젠타 */
--badge-world: #4f46e5;        /* 해외뉴스 - 인디고 */
--badge-opinion: #ca8a04;      /* 오피니언 - 앰버 */
```

### 2.3 Neutral Colors

```css
--gray-50: #f9fafb;   /* 배경 */
--gray-100: #f3f4f6;  /* 카드 배경 */
--gray-200: #e5e7eb;  /* 구분선 */
--gray-400: #9ca3af;  /* 메타 텍스트 */
--gray-600: #4b5563;  /* 본문 */
--gray-800: #1f2937;  /* 제목 */
--gray-900: #111827;  /* 강조 제목 */
```

---

## 📱 3. 모바일 가독성 가이드라인

### 3.1 핵심 원칙

| 항목 | 최소값 | 권장값 |
|------|--------|--------|
| 본문 폰트 | 16px | 16px |
| 제목 폰트 | 18px | 20px |
| Line-height (본문) | 1.6 | 1.7~1.75 |
| Letter-spacing (제목) | -0.02em | -0.025em |
| 좌우 패딩 | 16px | 20px |
| 터치 영역 | 44px | 48px |
| 항목 간격 | 12px | 16px |

### 3.2 시사저널 스타일 적용

- **심플한 구조**: 불필요한 장식 최소화
- **명확한 계층**: 제목 > 요약 > 메타 정보
- **충분한 여백**: 콘텐츠 사이 breathing room
- **단색 배경**: 흰색 기반, 그레이 구분선

---

## 📁 4. 파일별 수정 사항

### 4.1 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        navy: {
          700: '#1e293b',
          800: '#0f172a',
          900: '#0a1628',
        },
        // Medical Colors
        'medical-green': {
          500: '#10b981',
          600: '#059669',
        },
        'medical-blue': {
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Semantic
        urgent: '#dc2626',
        // Category Badges
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
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // 모바일 우선 타이포 스케일
        'headline-xl': ['1.5rem', { lineHeight: '1.35', letterSpacing: '-0.025em' }],
        'headline-lg': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        'headline-md': ['1.125rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        'headline-sm': ['1rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'body-lg': ['1rem', { lineHeight: '1.75' }],
        'body-md': ['0.9375rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
      },
      spacing: {
        // 터치 타겟
        'touch': '2.75rem', // 44px
        'touch-lg': '3rem', // 48px
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
  },
  plugins: [],
};
```

### 4.2 globals.css

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Base Styles ===== */
@layer base {
  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #111827;
    background-color: #fff;
    line-height: 1.6;
  }
}

/* ===== Typography Components ===== */
@layer components {
  /* 헤드라인 - Serif */
  .headline {
    font-family: 'Noto Serif KR', Georgia, serif;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.35;
    color: #111827;
  }
  
  .headline-xl {
    @apply headline;
    font-size: 1.5rem;
  }
  
  .headline-lg {
    @apply headline;
    font-size: 1.25rem;
    line-height: 1.4;
  }
  
  .headline-md {
    @apply headline;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
  }
  
  .headline-sm {
    @apply headline;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
  }

  /* 데스크탑 사이즈 업 */
  @screen md {
    .headline-xl { font-size: 2rem; }
    .headline-lg { font-size: 1.5rem; }
    .headline-md { font-size: 1.25rem; }
  }
  
  /* 본문 텍스트 */
  .body-text {
    font-size: 1rem;
    line-height: 1.75;
    color: #4b5563;
  }
  
  .body-text-sm {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: #4b5563;
  }
  
  /* 메타 정보 */
  .meta-text {
    font-size: 0.75rem;
    line-height: 1.5;
    color: #9ca3af;
  }
  
  /* 카테고리 뱃지 */
  .category-badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    color: white;
  }
  
  .badge-정책 { background-color: #1e40af; }
  .badge-학술 { background-color: #059669; }
  .badge-병원 { background-color: #7c3aed; }
  .badge-산업 { background-color: #ea580c; }
  .badge-AI { background-color: #0891b2; }
  .badge-제약바이오, .badge-제약·바이오 { background-color: #be185d; }
  .badge-해외뉴스 { background-color: #4f46e5; }
  .badge-오피니언, .badge-칼럼, .badge-기고 { background-color: #ca8a04; }
}

/* ===== Utility Classes ===== */
@layer utilities {
  /* 구분선 */
  .divider {
    border-top: 1px solid #e5e7eb;
  }
  
  .divider-thick {
    border-top: 2px solid #0f172a;
  }
  
  /* 스크롤바 숨김 */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* 터치 타겟 */
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 모바일 패딩 */
  .mobile-padding {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  @screen sm {
    .mobile-padding {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
  }
}
```

---

## 🧩 5. 컴포넌트별 스타일 가이드

### 5.1 NewsListItem.jsx

**변경 포인트:**
- 제목: `font-headline` → `headline-sm` (Noto Serif)
- 본문 line-height: 1.6 → 1.7
- 패딩: `py-4` → `py-5`
- 터치 영역: 최소 44px 보장

```jsx
// 기존
<h4 className="font-headline text-base font-bold text-gray-900">

// 변경
<h4 className="headline-sm text-gray-900 group-hover:text-medical-blue-600">
```

**compact 모드 개선:**
```jsx
// 기존: py-2.5, text-[14px]
// 변경: py-3.5 (터치영역), text-[15px] (가독성)
<Link className="block py-3.5 border-b border-gray-100 touch-target">
  <h4 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
```

### 5.2 HeadlineSlider.jsx

**변경 포인트:**
- 헤드라인: Noto Serif KR Bold
- 모바일 높이: 300px → 280px (비율 최적화)
- 텍스트 영역 패딩 증가
- 가독성 위한 text-shadow 추가

```jsx
// 기존
<h2 className="font-headline text-xl md:text-3xl font-bold text-white">

// 변경
<h2 className="headline-xl md:text-3xl text-white drop-shadow-lg">
```

**오버레이 개선:**
```jsx
// 기존: from-black/80 via-black/30
// 변경: 더 부드러운 그라데이션
className="bg-gradient-to-t from-black/85 via-black/40 to-transparent"
```

### 5.3 Header.jsx

**변경 포인트:**
- 로고: Noto Serif KR로 변경 (저널 느낌)
- 카테고리 터치 영역 확대
- 모바일 여백 증가

```jsx
// 로고 변경
<span className="font-serif text-3xl md:text-4xl font-bold text-navy-900 tracking-tight">
  Dr.News
</span>

// 모바일 카테고리
<Link className="flex-shrink-0 px-4 py-3 text-[15px] touch-target">
```

### 5.4 PopularNews.jsx

**변경 포인트:**
- 제목 폰트 크기: 14px → 15px
- 터치 영역: py-2.5 → py-3.5
- 순위 숫자 스타일 개선

```jsx
// 기존
<span className="text-sm font-bold">

// 변경
<span className="font-serif text-lg font-bold tabular-nums">
```

### 5.5 SubHeadline.jsx

**변경 포인트:**
- 제목: headline-lg 클래스 적용
- 본문: body-text 클래스 적용
- 모바일 여백 개선

```jsx
// 제목
<h3 className="headline-lg line-clamp-2 mb-3 hover:text-medical-blue-600">

// 본문
<p className="body-text-sm line-clamp-4">
```

### 5.6 NewsCard.jsx

**변경 포인트:**
- 카드 스타일 간소화 (그림자 → 보더)
- 제목: headline-sm 적용
- 패딩 증가

```jsx
// 기존: rounded-xl shadow-md hover:shadow-xl
// 변경: border border-gray-200 hover:border-gray-300
className="block group bg-white border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden"
```

---

## 📐 6. Breakpoint별 스타일 가이드

### 6.1 모바일 (< 640px)

```css
/* 레이아웃 */
- 패딩: 16px (1rem)
- 최대 너비: 100%
- 1열 레이아웃

/* 타이포그래피 */
- headline-xl: 24px
- headline-lg: 20px
- body: 16px, line-height 1.75

/* 간격 */
- 섹션 간격: 24px
- 카드 간격: 16px
- 리스트 아이템: py-14px (터치 44px)

/* 터치 */
- 버튼/링크 최소: 44x44px
- 터치 간격: 8px
```

### 6.2 태블릿 (640px ~ 1024px)

```css
/* 레이아웃 */
- 패딩: 20px (1.25rem)
- 최대 너비: 100%
- 2열 그리드 가능

/* 타이포그래피 */
- headline-xl: 28px
- headline-lg: 22px

/* 간격 */
- 섹션 간격: 32px
- 카드 간격: 20px
```

### 6.3 데스크탑 (1024px+)

```css
/* 레이아웃 */
- 최대 너비: 1280px
- 사이드바: 288px (w-72)
- 메인: flex-1

/* 타이포그래피 */
- headline-xl: 32px
- headline-lg: 24px

/* 간격 */
- 섹션 간격: 24px
- 컬럼 간격: 24px
```

---

## 🔧 7. 관리자 연동 고려사항

### 7.1 배너 영역 관리

| 위치 | 크기 | 비율 | CMS 설정 |
|------|------|------|----------|
| GNB | 234x60 | 3.9:1 | `gnb` type |
| 헤드라인 | 100%x280~380 | 16:9 | `headline` type |
| 사이드바 | 288x* | 자유 | `sidebar` type |
| 네이티브 | 100%x80 | 자유 | inline flag |

### 7.2 슬롯(Placement) 시스템

```js
// 기존 placement 옵션 유지
placement: 'headline' | 'subheadline' | 'featured' | 'regular' | 'none'

// UI에서 placement별 스타일 매핑
const placementStyles = {
  headline: 'headline-xl',
  subheadline: 'headline-lg', 
  featured: 'headline-md',
  regular: 'headline-sm',
};
```

### 7.3 카테고리 뱃지 통일

관리자에서 카테고리 추가 시 자동으로 색상 매핑:

```js
const categoryColors = {
  '정책': 'badge-policy',
  '학술': 'badge-academic',
  '병원': 'badge-hospital',
  '산업': 'badge-industry',
  'AI': 'badge-ai',
  '제약·바이오': 'badge-pharma',
  '해외뉴스': 'badge-world',
  '오피니언': 'badge-opinion',
  '칼럼': 'badge-opinion',
  '기고': 'badge-opinion',
};
```

---

## ✅ 8. 구현 체크리스트

### Phase 1: 기반 설정
- [ ] Noto Serif KR 폰트 추가 (Google Fonts CDN)
- [ ] tailwind.config.js 업데이트
- [ ] globals.css 타이포그래피 시스템 적용

### Phase 2: 핵심 컴포넌트
- [ ] Header.jsx - 로고 폰트 변경, 터치 영역 확대
- [ ] HeadlineSlider.jsx - 헤드라인 폰트, 오버레이 개선
- [ ] NewsListItem.jsx - 가독성 개선, 터치 타겟

### Phase 3: 보조 컴포넌트
- [ ] SubHeadline.jsx
- [ ] PopularNews.jsx
- [ ] NewsCard.jsx
- [ ] Opinion.jsx

### Phase 4: 전체 레이아웃
- [ ] page.js - 섹션 간격 조정
- [ ] 모바일 패딩 통일
- [ ] 카테고리 뱃지 색상 통일

### Phase 5: QA
- [ ] 모바일 가독성 테스트 (실기기)
- [ ] 터치 영역 테스트
- [ ] 다크모드 대응 여부 확인
- [ ] Lighthouse 접근성 점수 확인

---

## 📝 참고사항

1. **시사저널 핵심 스타일**: 미니멀한 구조, 명확한 계층, 충분한 여백
2. **의료 저널 차별화**: Serif 헤드라인으로 권위감, 그린/블루 악센트로 의료 느낌
3. **모바일 우선**: 모든 스타일은 모바일 기준으로 작성 후 데스크탑 확장
4. **관리자 호환**: 기존 placement 시스템과 배너 타입 유지

---

*작성일: 2026-02-24*
*버전: 1.0*
