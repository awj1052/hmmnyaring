/**
 * tRPC 초기화 및 기본 설정
 * 
 * - transformer: superjson 사용 (Date, Map, Set 등 전송 가능)
 * - errorFormatter: Zod 에러를 클라이언트로 전달
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import superjson from 'superjson';
import { ZodError } from 'zod';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * tRPC 라우터 생성 헬퍼
 */
export const createTRPCRouter = t.router;

/**
 * 퍼블릭 프로시저 (인증 불필요)
 */
export const publicProcedure = t.procedure;

/**
 * 미들웨어
 */
export const middleware = t.middleware;

/**
 * 인증 미들웨어
 */
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

/**
 * 보호된 프로시저 (인증 필요)
 */
export const protectedProcedure = t.procedure.use(isAuthed);

