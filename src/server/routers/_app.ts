/**
 * tRPC 메인 앱 라우터
 * 
 * 모든 하위 라우터를 통합합니다.
 */

import { createTRPCRouter } from '../trpc';
import { postRouter } from './post';
import { userRouter } from './user';

export const appRouter = createTRPCRouter({
  user: userRouter,
  post: postRouter,
});

// tRPC 타입 export (클라이언트에서 사용)
export type AppRouter = typeof appRouter;

