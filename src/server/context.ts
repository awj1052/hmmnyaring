/**
 * tRPC 컨텍스트 생성
 * 
 * 각 요청마다 실행되며, Prisma 클라이언트와 인증 세션 정보를 제공합니다.
 */

import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { prisma } from './db';
import { auth } from '@/lib/auth';

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // NextAuth 세션 가져오기
  const session = await auth();

  return {
    prisma,
    session,
    headers: opts?.req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

