// 관리자 인증 유틸리티 (Edge Runtime 호환 - Web Crypto API 사용)

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'drnews-admin-secret-change-me';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kyh6384';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kyh6384';
const SESSION_MAX_AGE = 24 * 60 * 60; // 24시간 (초)

export function getAdminCredentials() {
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
}

export function getSessionMaxAge() {
  return SESSION_MAX_AGE;
}

// HMAC-SHA256 서명 생성
async function hmacSign(payload) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = encoder.encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// HMAC-SHA256 서명 검증
async function hmacVerify(payload, signatureHex) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const data = encoder.encode(JSON.stringify(payload));
  const signature = new Uint8Array(
    signatureHex.match(/.{2}/g).map((byte) => parseInt(byte, 16))
  );
  return crypto.subtle.verify('HMAC', key, signature, data);
}

// 세션 토큰 생성 (로그인 성공 시)
export async function createSessionToken(username) {
  const payload = { sub: username, iat: Date.now() };
  const sig = await hmacSign(payload);
  // base64url(payload).signature
  const payloadB64 = btoa(JSON.stringify(payload));
  return `${payloadB64}.${sig}`;
}

// 세션 토큰 검증 (미들웨어 / API에서 사용)
export async function verifySessionToken(token) {
  try {
    const dotIdx = token.indexOf('.');
    if (dotIdx === -1) return null;

    const payloadB64 = token.substring(0, dotIdx);
    const sig = token.substring(dotIdx + 1);

    const payload = JSON.parse(atob(payloadB64));

    const valid = await hmacVerify(payload, sig);
    if (!valid) return null;

    // 만료 체크
    if (Date.now() - payload.iat > SESSION_MAX_AGE * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export const COOKIE_NAME = 'drnews_admin_session';
