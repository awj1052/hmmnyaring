/**
 * NextAuth 미들웨어
 * 
 * 보호된 라우트에 대한 인증 체크
 */

export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

