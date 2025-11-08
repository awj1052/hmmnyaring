/**
 * Guide 라우터
 * 
 * 가이드 검색 및 조회 관련 쿼리
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { Language, TourCategory } from '@prisma/client';

export const guideRouter = createTRPCRouter({
  // 모든 가이드 조회 (필터 적용)
  getAll: publicProcedure
    .input(
      z.object({
        languages: z.array(z.nativeEnum(Language)).optional(),
        categories: z.array(z.nativeEnum(TourCategory)).optional(),
        minRating: z.number().min(0).max(5).optional(),
        sortBy: z.enum(['rating', 'tours', 'recent']).default('rating'),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { languages, categories, minRating, sortBy, limit, cursor } = input;

      // 필터 조건 구성
      const guideProfileFilter: Record<string, unknown> = {};
      
      if (languages && languages.length > 0) {
        guideProfileFilter.languages = {
          hasSome: languages,
        };
      }
      
      if (categories && categories.length > 0) {
        guideProfileFilter.categories = {
          hasSome: categories,
        };
      }
      
      if (minRating) {
        guideProfileFilter.averageRating = {
          gte: minRating,
        };
      }

      const where: Record<string, unknown> = {
        role: 'GUIDE',
        guideProfile: Object.keys(guideProfileFilter).length > 0
          ? {
              is: guideProfileFilter,
            }
          : {
              isNot: null,
            },
      };

      // 정렬 조건
      let orderBy: Record<string, unknown> = {};
      if (sortBy === 'rating') {
        orderBy = { guideProfile: { averageRating: 'desc' } };
      } else if (sortBy === 'tours') {
        orderBy = { guideProfile: { totalTours: 'desc' } };
      } else {
        orderBy = { createdAt: 'desc' };
      }

      const guides = await ctx.prisma.user.findMany({
        where,
        include: {
          guideProfile: true,
          receivedReviews: {
            take: 3,
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined = undefined;
      if (guides.length > limit) {
        const nextItem = guides.pop();
        nextCursor = nextItem?.id;
      }

      // 비밀번호 제거
      const guidesWithoutPassword = guides.map(({ password, ...guide }) => guide);

      return {
        guides: guidesWithoutPassword,
        nextCursor,
      };
    }),

  // 가이드 상세 조회
  getById: publicProcedure
    .input(z.object({ guideId: z.string() }))
    .query(async ({ ctx, input }) => {
      const guide = await ctx.prisma.user.findUnique({
        where: { id: input.guideId, role: 'GUIDE' },
        include: {
          guideProfile: true,
          receivedReviews: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 20,
          },
        },
      });

      if (!guide) {
        throw new Error('가이드를 찾을 수 없습니다.');
      }

      const { password, ...guideWithoutPassword } = guide;

      return guideWithoutPassword;
    }),

  // 가이드 검색 (이름, 자기소개)
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const guides = await ctx.prisma.user.findMany({
        where: {
          role: 'GUIDE',
          OR: [
            {
              name: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              guideProfile: {
                bio: {
                  contains: input.query,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        include: {
          guideProfile: true,
        },
        take: input.limit,
      });

      const guidesWithoutPassword = guides.map(({ password, ...guide }) => guide);

      return guidesWithoutPassword;
    }),
});

