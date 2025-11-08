/**
 * 번역 tRPC 라우터
 * 
 * Gemini API를 사용한 텍스트 번역 기능 제공
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { translateText } from '@/lib/gemini';
import { TRPCError } from '@trpc/server';
import { translationRateLimit, checkRateLimit } from '@/lib/simple-rate-limit';
import { translationTextSchema } from '@/lib/validators';

export const translationRouter = createTRPCRouter({
  /**
   * 텍스트 번역
   * 
   * 한국어 ↔ 영어 자동 감지 및 번역
   * 🔒 보안: Rate Limiting (1분당 10회)
   */
  translate: protectedProcedure
    .input(
      z.object({
        text: translationTextSchema,
        targetLang: z.enum(['ko', 'en']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 보안: Rate limit 체크
      const rateLimitResult = await checkRateLimit(
        translationRateLimit,
        ctx.session.user.id
      );

      if (!rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `번역 요청 한도를 초과했습니다. ${rateLimitResult.resetAt.toLocaleTimeString('ko-KR')}에 재시도하세요.`,
        });
      }

      try {
        const translatedText = await translateText(input.text, input.targetLang);

        return {
          success: true,
          originalText: input.text,
          translatedText,
          rateLimit: {
            remaining: rateLimitResult.remaining,
            resetAt: rateLimitResult.resetAt,
          },
        };
      } catch (error) {
        console.error('[Translation Router Error]', {
          userId: ctx.session.user.id,
          error: error instanceof Error ? error.message : 'Unknown',
          timestamp: new Date().toISOString(),
        });
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : '번역에 실패했습니다.',
        });
      }
    }),

  /**
   * 배치 번역 (여러 텍스트 동시 번역)
   * 
   * 추후 확장용
   */
  translateBatch: protectedProcedure
    .input(
      z.object({
        texts: z.array(z.string().min(1)).min(1).max(10),
        targetLang: z.enum(['ko', 'en']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const translations = await Promise.all(
          input.texts.map((text) => translateText(text, input.targetLang))
        );

        return {
          success: true,
          translations: input.texts.map((original, index) => ({
            originalText: original,
            translatedText: translations[index]!,
          })),
        };
      } catch (error) {
        console.error('Batch translation error:', error);
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : '배치 번역에 실패했습니다.',
        });
      }
    }),
});

