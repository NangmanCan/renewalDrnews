import { createSessionToken, getAdminCredentials, getSessionMaxAge, COOKIE_NAME } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const admin = getAdminCredentials();

    if (username !== admin.username || password !== admin.password) {
      return Response.json(
        { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken(username);
    const maxAge = getSessionMaxAge();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
      },
    });
  } catch {
    return Response.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
