# Dr.News - Product Requirements Document (PRD)

> **문서 버전**: v1.0
> **최종 갱신일**: 2026-02-07
> **대상 브랜치**: `claude/redesign-main-ui-N3WEX` (기반: `claude/fix-news-slot-state-pDG7n`)
> **배포 환경**: Cloudflare Pages (`@cloudflare/next-on-pages`)

---

## 1. 제품 개요

### 1.1 제품명
**Dr.News (닥터뉴스)** — 의료 전문 뉴스 플랫폼

### 1.2 제품 비전
의료·제약·바이오 산업 종사자와 관심자를 위한 전문 뉴스 웹 플랫폼.
신문사 스타일의 텍스트 중심 UI로 정보 전달력을 극대화하고, 관리자 CMS를 통해 기사·광고·콘텐츠를 통합 관리한다.

### 1.3 기술 스택
| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15.1.0 (App Router) |
| 런타임 | Edge Runtime (Cloudflare Workers) |
| 스타일링 | Tailwind CSS 3.4.4 |
| 폰트 | Pretendard Variable (jsDelivr CDN) |
| 데이터베이스 | Supabase (PostgreSQL) |
| 배포 | Cloudflare Pages (`@cloudflare/next-on-pages`) |
| 이미지 최적화 | Next.js Image (AVIF, WebP / 60s TTL) |
| 캐싱 | ISR (revalidate: 60초) + React `cache()` 중복 제거 |

---

## 2. 정보 구조 (Information Architecture)

### 2.1 콘텐츠 유형

| 콘텐츠 | 설명 | DB 테이블 |
|--------|------|-----------|
| **기사 (Articles)** | 일반 뉴스 기사 | `articles` |
| **오피니언 (Opinions)** | 전문가 칼럼·기고 | `opinions` |
| **CEO 리포트 (CEO Reports)** | 경영진 주간 리포트 | `ceo_reports` |
| **배너 (Banners)** | 광고·프로모션 배너 | `banners` |

### 2.2 기사 카테고리
- 정책
- 학술
- 병원
- 산업
- AI
- 제약·바이오
- 해외뉴스
- 오피니언

### 2.3 기사 배치(Placement) 시스템
기사를 메인페이지 특정 슬롯에 배치하는 시스템:

| 배치 값 | 위치 | 최대 수량 |
|---------|------|-----------|
| `headline` | 메인 슬라이더 | 2 |
| `subheadline` | 서브 헤드라인 영역 | 2 |
| `news` | 일반 뉴스 목록 | 무제한 |
| `opinion` | 오피니언 섹션 | - |
| `none` | 메인에서 숨김 | - |

---

## 3. 페이지별 기능 명세

### 3.1 메인 페이지 (`/`)

#### 3.1.1 공통 요구사항
- ISR 60초 주기 재검증
- Edge Runtime 실행
- 카테고리 쿼리 파라미터 지원 (`?category=정책`)
- Supabase 연결 실패 시 정적 데이터 자동 폴백
- 병렬 데이터 페칭 (기사, 헤드라인, 인기기사, CEO리포트, 오피니언, 배너 동시 호출)

#### 3.1.2 PC 레이아웃 (lg 이상, ≥1024px)

```
┌──────────────────────────────────────────────┐
│                   Header                      │
├──────────────────────────────────────────────┤
│  [HeadlineSlider]              │  [Opinions]  │
│  (기사+광고 자동 슬라이드)       │              │
│  높이: 380px                   │              │
├────────────────────────────────│              │
│  [SubHeadline 1] [SubHeadline 2]│             │
├────────────────────────────────│──────────────│
│  [CEO Report]                  │[PopularNews] │
├────────────────────────────────│              │
│  [BioPharmNews]                │──────────────│
├────────────────────────────────│ [SidebarAd]  │
│  [최신 뉴스 목록]               │              │
│  (썸네일+본문 텍스트 노출)       │              │
│  카테고리 뱃지 없음             │              │
└──────────────────────────────────────────────┘
│                   Footer                      │
└──────────────────────────────────────────────┘
```

**PC 뉴스 목록 상세:**
- 썸네일 이미지 + 제목 + 본문 텍스트 3줄 (content 우선, summary 폴백)
- 카테고리 뱃지 미표시
- 날짜 표시
- 호버 시 제목 밑줄

#### 3.1.3 모바일 레이아웃 (< 1024px)

```
┌─────────────────────┐
│      Header          │
├─────────────────────┤
│  [HeadlineSlider]    │
│  높이: 300px         │
├─────────────────────┤
│ [최신뉴스 - 상단 2열] │  ← MobileTopCards
│ ┌────────┬─────────┐ │
│ │ 이미지  │ 이미지   │ │  높이: 160px
│ │+타이틀  │+타이틀   │ │  폰트: 15px ExtraBold
│ └────────┴─────────┘ │
├─────────────────────┤
│ [최신뉴스 텍스트 목록] │  ← compact NewsListItem
│  · 기사 제목 1        │  제목만 1줄, 14px bold
│  · 기사 제목 2        │  이미지 없음
│  · ...               │
│  · 기사 제목 8        │  최대 10개 (상단2개 제외 8개)
│  ─────────────────── │
│      MORE +          │  10개 초과 시 표시
├─────────────────────┤
│  [SubHeadline]       │
├─────────────────────┤
│  [CEO Report]        │
├─────────────────────┤
│  [BioPharmNews]      │
├─────────────────────┤
│  [Opinions]          │
├─────────────────────┤
│  [PopularNews]       │
├─────────────────────┤
│      Footer          │
└─────────────────────┘
```

**모바일 최신뉴스 상세:**
- 상단 2개 기사: 2열 이미지 카드 (이미지 위에 타이틀 오버레이)
  - 카드 높이 160px, 그라디언트 오버레이 (black/80 → transparent)
  - 타이틀: Pretendard ExtraBold 15px, 흰색, 2줄 제한
- 나머지 기사: 텍스트 전용 컴팩트 목록
  - 제목만 표시 (1줄 제한), 14px bold
  - 최대 10개 기사로 제한 (상단 2개 포함)
  - 초과 시 하단에 `MORE +` 버튼 → `/?category=전체` 이동

### 3.2 기사 상세 페이지 (`/article/[id]`)

- 동적 메타데이터 생성 (OpenGraph, 제목, 설명)
- ISR 60초 재검증
- 조회수 자동 증가 (Supabase RPC: `increment_views`)
- 구성:
  - 카테고리 뱃지 + 제목 + 저자/날짜
  - 대표 이미지
  - 본문 (HTML 렌더링)
  - 공유 버튼
  - 관련 기사 3개 (같은 카테고리)
  - PC: 우측 사이드바 광고

### 3.3 오피니언 상세 페이지 (`/opinion/[id]`)

- 동적 메타데이터 (OpenGraph)
- ISR 60초 재검증
- 구성:
  - 카테고리 + 제목 + 날짜
  - 저자 정보 하이라이트 박스 (보라색 배경)
  - 대표 이미지 + 본문
  - 공유 버튼
  - 관련 오피니언 3개 카드
  - PC: 우측 사이드바 광고

### 3.4 CEO 리포트 상세 페이지 (`/ceo-report/[id]`)

- 구성:
  - 히어로 섹션 (다크 그라디언트 배경, 제목/부제/저자)
  - 브레드크럼 내비게이션
  - 본문 (prose 스타일)
  - 이전/다음 리포트 네비게이션
  - 관련 CEO 리포트 3개
  - 홈으로 돌아가기 CTA

---

## 4. 디자인 시스템

### 4.1 디자인 원칙: 신문 스타일 (시사저널 참고)

| 항목 | 규칙 |
|------|------|
| **모서리** | 전 컴포넌트 직각 (rounded 제거) |
| **그림자** | 최소화, 보더 라인 활용 |
| **색상** | 배경 화이트, 강조색 네이비(#0f172a) |
| **레이아웃** | 텍스트 중심, 이미지는 보조 요소 |
| **호버** | 밑줄(underline) 효과 |

### 4.2 타이포그래피

```css
/* 기본 폰트 */
font-family: 'Pretendard Variable', Pretendard, -apple-system,
             BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
             Arial, sans-serif;

/* 헤드라인 폰트 (.font-headline) */
font-family: 'Pretendard Variable', Pretendard, -apple-system,
             BlinkMacSystemFont, sans-serif;
font-weight: 800;           /* ExtraBold */
letter-spacing: -0.02em;
line-height: 1.3;
```

| 용도 | 크기 | 두께 |
|------|------|------|
| 헤드라인 슬라이더 제목 | responsive (lg:text-3xl) | ExtraBold (800) |
| 서브헤드라인 제목 | text-lg | ExtraBold (800) |
| 뉴스 목록 제목 (PC) | text-base~lg | Bold (700) |
| 뉴스 목록 제목 (모바일 compact) | 14px | Bold (700) |
| 모바일 상단 카드 제목 | 15px | ExtraBold (800) |
| 인기뉴스 제목 | 14px | Bold (700) |
| 인기뉴스 섹션 타이틀 | text-base | Bold (700) |
| 본문 텍스트 | text-sm | Normal (400) |

### 4.3 색상 팔레트

| 토큰 | 값 | 용도 |
|------|-----|------|
| navy | `#0f172a` | 섹션 헤더 배경, 강조 |
| medical-blue | `#0284c7` | 의료 관련 강조색 |
| white | `#ffffff` | 페이지 배경 |
| gray-100~900 | Tailwind 기본 | 텍스트, 보더 |
| red-500 | Tailwind 기본 | 인기뉴스 1~3위 숫자 |

---

## 5. 컴포넌트 명세

### 5.1 Header (`components/Header.jsx`)
- 상단 고정(sticky)
- 좌측: 로고 (`font-headline` 적용)
- 중앙: 현재 날짜 (한국어 형식)
- 우측: 관리자 버튼 (보더 스타일)
- 하단: 카테고리 내비게이션 (8개 카테고리 가로 스크롤)
- PC: GNB 배너 광고 슬롯 (234x60px)
- 직각 모서리, 배경 화이트

### 5.2 HeadlineSlider (`components/HeadlineSlider.jsx`)
- 기사 + 광고 배너 자동 슬라이드 (5초 간격)
- 높이: 모바일 300px / PC 380px
- 좌우 화살표 (호버 시 표시) + 하단 도트 인디케이터
- 기사 슬라이드: 이미지 배경 + 그라디언트 오버레이 + 제목
- 배너 슬라이드: 이미지 배경 + 타이틀 + 설명
- 제목: `font-headline` 적용, 호버 시 밑줄
- 직각 모서리

### 5.3 SubHeadline (`components/SubHeadline.jsx`)
- 가로형 카드: 좌측 썸네일(640x360) + 우측 텍스트
- 제목: `font-headline`, 호버 시 밑줄
- 카테고리 뱃지 없음
- 본문 미리보기 + 저자/날짜
- 직각 모서리, 보더 스타일

### 5.4 NewsListItem (`components/NewsListItem.jsx`)
- **기본 모드 (PC)**: 좌측 날짜 + 중앙(제목+본문 3줄) + 우측 썸네일
  - 본문: `content` 우선 사용, 없으면 `summary` 폴백
  - 오피니언 기사: 저자 이미지 표시
  - 일반 기사: 기사 이미지 표시
- **컴팩트 모드 (모바일)**: 제목만 1줄 표시
  - 이미지 없음
  - 14px bold, 1줄 제한 (`line-clamp-1`)
  - `py-2.5` 패딩, 하단 보더

### 5.5 MobileTopCards (`components/MobileTopCards.jsx`)
- 모바일 전용 2열 그리드 카드
- 카드 높이: 160px
- 이미지 배경 + 그라디언트 오버레이 (from-black/80 → transparent)
- 타이틀: 15px, `font-headline`, 흰색, 2줄 제한
- 기사 2개 미만 시 렌더링 안 함
- 갭: 2px

### 5.6 PopularNews (`components/PopularNews.jsx`)
- "많이 본 뉴스" 섹션
- 순위 리스트 (1~5위)
- 1~3위: 빨간색 숫자
- 4~5위: 회색 숫자
- 제목: 14px bold
- 섹션 타이틀: text-base bold
- 직각 모서리

### 5.7 Opinion (`components/Opinion.jsx`)
- 네이비 배경 헤더 (말풍선 아이콘 + "오피니언")
- 오피니언 카드 목록: 저자 이미지 + 날짜 + 제목(1줄) + 요약 + 저자명/직함
- 카테고리 뱃지 없음
- 하단: "더보기" 링크
- 직각 모서리

### 5.8 CeoReport (`components/CeoReport.jsx`)
- 네이비 배경 헤더 (별 아이콘 + "CEO 리포트")
- 날짜 + 주차 표시
- 제목 + 이탤릭 부제
- 본문 미리보기 (인용 스타일 박스)
- 저자 이미지 + 이름 + 직함
- "전문 읽기" 링크
- 직각 모서리

### 5.9 BioPharmNews (`components/BioPharmNews.jsx`)
- "제약·바이오" 섹션
- 보더-네이비 하단선 헤더
- "속보" 뱃지
- 기사별: 카테고리 + 요약
- 직각 모서리

### 5.10 SidebarAd (`components/SidebarAd.jsx`)
- PC 사이드바 광고 컨테이너
- Sticky 포지셔닝 (선택)
- 배너 이미지 + 타이틀 + 설명 세로 나열
- 하단: "광고" 라벨 (네이비 배경) + 광고문의 안내
- 직각 모서리

### 5.11 NativeAd (`components/NativeAd.jsx`)
- 인라인 스폰서드 콘텐츠
- 가로 레이아웃: 좌측 썸네일 + 우측 텍스트
- "Sponsored" 라벨
- 보더 스타일, 직각 모서리

### 5.12 Footer (`components/Footer.jsx`)
- 라이트 스타일 (상단 보더)
- 로고 + "의료 전문 뉴스"
- 저작권 표시
- 다크 배경 대신 밝은 보더-탑 스타일

---

## 6. 광고 시스템

### 6.1 배너 유형

| 유형 | 위치 | 사이즈 |
|------|------|--------|
| `headline` | 헤드라인 슬라이더 내 | 전체 슬라이더 영역 |
| `gnb` | 헤더 내비게이션 바 | 234x60px |
| `sidebar` | PC 우측 사이드바 | 가변 |

### 6.2 배너 포지션 플래그
각 배너는 4개 위치에 독립적으로 노출 가능:
- `sidebarTop`: 사이드바 상단
- `sidebarBottom`: 사이드바 하단
- `mobileBetween`: 모바일 섹션 사이
- `mobileInline`: 모바일 인라인

### 6.3 배너 관리
- 활성/비활성 토글
- 노출 순서 지정 (sort_order)
- 이미지 URL + 링크 URL
- 복수 포지션 동시 노출 가능

---

## 7. 관리자 시스템 (CMS)

### 7.1 인증

| 항목 | 명세 |
|------|------|
| 로그인 경로 | `/admin/login` |
| 관리자 페이지 | `/admin` |
| 인증 방식 | HMAC-SHA256 세션 토큰 |
| 쿠키 | `drnews_admin_session` (HttpOnly, SameSite=Lax) |
| 세션 유효기간 | 24시간 |
| 미들웨어 | `/admin/*` 경로 보호 (로그인 제외) |

### 7.2 관리 기능

#### 7.2.1 기사 관리
- CRUD (생성/조회/수정/삭제)
- 필드: 제목, 요약, 본문, 카테고리, 저자, 이미지, 배치(placement)
- 배치 슬롯 시각화 (현재 배치 현황 표시)
- 이미지 사이즈 가이드

#### 7.2.2 오피니언 관리
- CRUD
- 필드: 제목, 요약, 본문, 카테고리(칼럼/기고), 저자, 저자직함, 저자이미지
- 피처드(is_featured) 토글로 메인 노출 제어

#### 7.2.3 CEO 리포트 관리
- CRUD
- 필드: 제목, 부제, 본문, 카테고리, 저자, 저자직함, 저자이미지, 주차번호

#### 7.2.4 배너 관리
- CRUD
- 필드: 제목, 설명, 이미지 URL, 링크 URL, 유형, 포지션 체크박스
- 활성/비활성 토글

---

## 8. API 명세

모든 API는 **Edge Runtime**으로 실행.

### 8.1 인증 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/login` | 로그인 (세션 토큰 발급) |
| POST | `/api/auth/logout` | 로그아웃 (쿠키 삭제) |

### 8.2 기사 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/articles` | 전체 기사 조회 |
| POST | `/api/articles` | 기사 생성 |
| PUT | `/api/articles/[id]` | 기사 수정 |
| DELETE | `/api/articles/[id]` | 기사 삭제 |

### 8.3 배너 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/banners` | 전체 배너 조회 |
| POST | `/api/banners` | 배너 생성 |
| PUT | `/api/banners/[id]` | 배너 수정 |
| DELETE | `/api/banners/[id]` | 배너 삭제 |

### 8.4 CEO 리포트 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/ceo-reports` | 전체 리포트 조회 |
| POST | `/api/ceo-reports` | 리포트 생성 |
| PUT | `/api/ceo-reports/[id]` | 리포트 수정 |
| DELETE | `/api/ceo-reports/[id]` | 리포트 삭제 |

### 8.5 오피니언 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/opinions` | 전체 오피니언 조회 |
| POST | `/api/opinions` | 오피니언 생성 |
| PUT | `/api/opinions/[id]` | 오피니언 수정 |
| DELETE | `/api/opinions/[id]` | 오피니언 삭제 |

---

## 9. 데이터 모델

### 9.1 Articles

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | PK |
| title | text | 기사 제목 |
| summary | text | 요약 |
| content | text | 본문 (HTML) |
| category | text | 카테고리 |
| author | text | 저자명 |
| image | text | 대표 이미지 URL |
| is_headline | boolean | 헤드라인 여부 (레거시) |
| placement | text | 배치 슬롯 (headline/subheadline/news/opinion/none) |
| views | int | 조회수 |
| created_at | timestamp | 생성일시 |

### 9.2 Banners

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | PK |
| title | text | 배너 제목 |
| description | text | 설명 |
| image | text | 이미지 URL |
| link | text | 클릭 시 이동 URL |
| type | text | 유형 (headline/gnb/sidebar) |
| is_active | boolean | 활성 여부 |
| sort_order | int | 노출 순서 |
| position_sidebar_top | boolean | 사이드바 상단 노출 |
| position_sidebar_bottom | boolean | 사이드바 하단 노출 |
| position_mobile_between | boolean | 모바일 섹션간 노출 |
| position_mobile_inline | boolean | 모바일 인라인 노출 |
| created_at | timestamp | 생성일시 |

### 9.3 CEO Reports

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | PK |
| title | text | 제목 |
| subtitle | text | 부제 |
| content | text | 본문 |
| category | text | 카테고리 |
| author | text | 저자명 |
| author_title | text | 저자 직함 |
| author_image | text | 저자 이미지 URL |
| week_number | int | 주차 번호 |
| created_at | timestamp | 생성일시 |

### 9.4 Opinions

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | int | PK |
| title | text | 제목 |
| summary | text | 요약 |
| content | text | 본문 |
| category | text | 카테고리 (칼럼/기고) |
| author | text | 저자명 |
| author_title | text | 저자 직함 |
| author_image | text | 저자 이미지 URL |
| is_featured | boolean | 메인 노출 여부 |
| created_at | timestamp | 생성일시 |

---

## 10. 성능 요구사항

| 항목 | 목표 |
|------|------|
| 페이지 캐시 | ISR 60초 (`revalidate: 60`) |
| 런타임 | Edge Runtime (Cloudflare Workers) |
| 이미지 포맷 | AVIF > WebP 자동 선택 |
| 이미지 캐시 | 60초 TTL (`minimumCacheTTL: 60`) |
| 데이터 중복 요청 | React `cache()` 함수로 동일 렌더 내 중복 제거 |
| 데이터 페칭 | 서버 컴포넌트에서 병렬 호출 (`Promise.all` 패턴) |
| 폴백 | Supabase 장애 시 정적 데이터 자동 전환 |

---

## 11. 데이터 폴백 시스템

Supabase 연결 실패 시 `/data/` 디렉토리의 정적 데이터로 자동 전환:

| 파일 | 데이터 |
|------|--------|
| `data/articles.js` | 12개 샘플 기사 |
| `data/banners.js` | 9개 샘플 배너 |
| `data/ceoReports.js` | 3개 CEO 리포트 |
| `data/opinions.js` | 3개 오피니언 |

- 모든 `lib/*.js` 함수에서 try-catch로 Supabase 호출 감싸고, 실패 시 정적 데이터 반환
- 프론트엔드 동작에 차이 없음 (동일 데이터 구조)

---

## 12. 보안 요구사항

| 항목 | 구현 |
|------|------|
| 관리자 인증 | HMAC-SHA256 세션 토큰 |
| 쿠키 보안 | HttpOnly, SameSite=Lax, Secure (production) |
| 세션 만료 | 24시간 자동 만료 |
| 미들웨어 보호 | `/admin/*` 경로 토큰 검증 |
| DB 권한 분리 | 읽기: anon key / 쓰기: service role key |
| API 응답 캐시 방지 | `Cache-Control: no-store, no-cache` 헤더 |
| 환경변수 관리 | `.env.local` (비공개), `.env.local.example` (템플릿) |

---

## 13. 개발 히스토리 요약

### Phase 1: 초기 구축
- 메인 페이지 레이아웃 및 컴포넌트 스캐폴딩
- 모바일 반응형 레이아웃
- 뉴스 목록 이미지/텍스트 정렬

### Phase 2: 기능 확장
- 제약·바이오 기사 데이터 추가
- GNB 및 모바일 레이아웃 개선
- 광고 슬롯 관리 (사이드바, 노출 제어)
- CEO 리포트/오피니언 상세 페이지
- PC 사이드바 상/하단 광고 분리

### Phase 3: Supabase 연동 & CMS
- Supabase 데이터베이스 통합
- Edge Runtime API 라우트 구현
- 슬롯 관리 저장 기능 (캐시, 데이터 포맷, 상태 복원 버그 수정 다수)

### Phase 4: 인증 & 콘텐츠
- 관리자 로그인 인증 시스템
- "해외뉴스" 카테고리 추가
- 오피니언 카테고리 링크
- 헤드라인 슬롯 2개 확장 + GIF 업로드 지원

### Phase 5: 성능 최적화
- 사이드바 광고 통합 및 모바일 롤링
- PC 레이아웃 2컬럼 구조 정리
- ISR (`revalidate=60`) 적용 (`force-dynamic` 대체)
- React `cache()` 중복 제거, 쿼리 병렬화, 쿼리 수 최적화

### Phase 6: 신문 스타일 리디자인 (현재)
- 전체 UI를 신문/저널 스타일로 전환
- 직각 모서리, 그림자 제거, 보더 라인 활용
- 모바일: 상단 2열 이미지 카드 + 텍스트 전용 목록
- PC: 본문 텍스트 노출 확대, 카테고리 뱃지 제거
- Pretendard Variable 폰트 전면 적용 (헤드라인 ExtraBold)
- 최신뉴스 10개 제한 + MORE+ 버튼
- 인기뉴스 폰트 크기 조정

---

## 14. 환경변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Admin Auth
AUTH_SECRET=[hmac-secret]
ADMIN_USERNAME=[admin-username]
ADMIN_PASSWORD=[admin-password]
```

---

## 15. 외부 의존성

| 패키지 | 용도 |
|--------|------|
| `next` 15.1.0 | 프레임워크 |
| `react` / `react-dom` | UI 라이브러리 |
| `@supabase/supabase-js` | Supabase 클라이언트 |
| `tailwindcss` 3.4.4 | 유틸리티 CSS |
| `@cloudflare/next-on-pages` | Cloudflare 배포 |
| Pretendard Variable (CDN) | 한국어 웹폰트 |
