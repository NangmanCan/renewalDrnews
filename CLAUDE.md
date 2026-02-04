# Next.js & Cloudflare Pages 프로젝트 가이드라인

## 🏗️ 기본 스택
- **Framework**: Next.js (App Router 사용)
- **Deployment**: Cloudflare Pages
- **Runtime**: Edge Runtime (Cloudflare 호환성 필수)

## 🚨 핵심 개발 규칙 (필수 준수)
1. **Edge Runtime 강제**:
   - 모든 동적 라우트(Dynamic Routes) 및 API Route 파일 상단에는 반드시 아래 코드를 포함할 것:
     `export const runtime = 'edge';`
2. **Cloudflare 호환성**:
   - Node.js 전용 라이브러리(fs, child_process 등) 사용 금지.
   - Cloudflare 환경에서 지원하지 않는 라이브러리 도입 시 반드시 사전에 확인할 것.
3. **컴포넌트 작성**:
   - 'use client'와 서버 컴포넌트를 명확히 구분할 것.

## 💻 실행 및 빌드 명령어
- **개발 환경**: `npm run dev`
- **로컬 빌드 테스트**: `npm run build`
- **Lint 확인**: `npm run lint`

## 🛠️ 환경 설정
- `.env.local` 파일의 환경 변수가 Cloudflare Pages 대시보드와 일치해야 함.
