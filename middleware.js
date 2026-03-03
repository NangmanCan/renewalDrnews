import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // /admin/login은 보호하지 않음
  if (pathname === '/admin/login') {
    // 이미 로그인된 사용자가 login 페이지 접근 시 → /admin으로 리다이렉트
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  // /admin/** 라우트 보호
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    // 만료되거나 유효하지 않은 토큰 → 쿠키 삭제 후 로그인으로
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
