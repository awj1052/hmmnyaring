/**
 * tRPC 서버 사이드 클라이언트
 * 
 * 서버 컴포넌트에서 직접 호출용
 */

import { createCaller } from '@trpc/server';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';

/**
 * 서버 컴포넌트에서 tRPC 프로시저 직접 호출
 * 
 * @example
 * const posts = await serverTrpc.post.getAll();
 */
export const serverTrpc = createCaller(appRouter)(await createContext());

