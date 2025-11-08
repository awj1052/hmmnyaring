/**
 * Review 라우터
 * 
 * 리뷰 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { reviewCommentSchema, ratingSchema, limitSchema } from '@/lib/validators';

export const reviewRouter = createTRPCRouter({
  // 리뷰 작성 (투어 완료 후만 가능)
  create: protectedProcedure
    .input(
      z.object({
        tourRequestId: z.string(),
        rating: ratingSchema,
        comment: reviewCommentSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 투어 요청 확인
      const tourRequest = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.tourRequestId },
        include: {
          review: true,
        },
      });

      if (!tourRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '투어 요청을 찾을 수 없습니다.',
        });
      }

      // 여행자만 리뷰 작성 가능
      if (tourRequest.travelerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '리뷰를 작성할 권한이 없습니다.',
        });
      }

      // 투어가 완료되지 않음
      if (tourRequest.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '완료된 투어만 리뷰를 작성할 수 있습니다.',
        });
      }

      // 이미 리뷰 작성함
      if (tourRequest.review) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미 리뷰를 작성하셨습니다.',
        });
      }

      // 리뷰 생성
      const review = await ctx.prisma.review.create({
        data: {
          rating: input.rating,
          comment: input.comment,
          tourRequestId: input.tourRequestId,
          authorId: ctx.session.user.id,
          receiverId: tourRequest.guideId,
        },
      });

      // 가이드 통계 업데이트
      const guide = await ctx.prisma.user.findUnique({
        where: { id: tourRequest.guideId },
        include: {
          guideProfile: true,
          receivedReviews: true,
        },
      });

      if (guide && guide.guideProfile) {
        const totalReviews = guide.receivedReviews.length;
        const sumRatings = guide.receivedReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = sumRatings / totalReviews;

        await ctx.prisma.guideProfile.update({
          where: { userId: tourRequest.guideId },
          data: {
            averageRating,
            totalTours: guide.guideProfile.totalTours + 1,
          },
        });
      }

      return review;
    }),

  // 특정 가이드의 리뷰 조회
  getByGuideId: publicProcedure
    .input(
      z.object({
        guideId: z.string(),
        limit: limitSchema,
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const reviews = await ctx.prisma.review.findMany({
        where: { receiverId: input.guideId },
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
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined = undefined;
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop();
        nextCursor = nextItem?.id;
      }

      return {
        reviews,
        nextCursor,
      };
    }),

  // 내가 받은 리뷰 (가이드 전용)
  getMyReviews: protectedProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      where: { receiverId: ctx.session.user.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tourRequest: {
          select: {
            id: true,
            requestedDate: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }),

  // 내가 작성한 리뷰 (여행자 전용)
  getMySentReviews: protectedProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      where: { authorId: ctx.session.user.id },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tourRequest: {
          select: {
            id: true,
            requestedDate: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }),

  // 리뷰 수정 (작성자만)
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: ratingSchema.optional(),
        comment: reviewCommentSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
        include: {
          tourRequest: true,
        },
      });

      if (!review || review.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '리뷰를 찾을 수 없거나 권한이 없습니다.',
        });
      }

      const updatedReview = await ctx.prisma.review.update({
        where: { id: input.reviewId },
        data: {
          ...(input.rating && { rating: input.rating }),
          ...(input.comment && { comment: input.comment }),
        },
      });

      // 가이드 평균 평점 재계산
      const guide = await ctx.prisma.user.findUnique({
        where: { id: review.receiverId },
        include: {
          guideProfile: true,
          receivedReviews: true,
        },
      });

      if (guide && guide.guideProfile && guide.receivedReviews.length > 0) {
        const sumRatings = guide.receivedReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = sumRatings / guide.receivedReviews.length;

        await ctx.prisma.guideProfile.update({
          where: { userId: review.receiverId },
          data: {
            averageRating,
          },
        });
      }

      return updatedReview;
    }),

  // 리뷰 삭제 (작성자만)
  delete: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
      });

      if (!review || review.authorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '리뷰를 찾을 수 없거나 권한이 없습니다.',
        });
      }

      await ctx.prisma.review.delete({
        where: { id: input.reviewId },
      });

      // 가이드 평균 평점 재계산
      const guide = await ctx.prisma.user.findUnique({
        where: { id: review.receiverId },
        include: {
          guideProfile: true,
          receivedReviews: true,
        },
      });

      if (guide && guide.guideProfile) {
        if (guide.receivedReviews.length > 0) {
          const sumRatings = guide.receivedReviews.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = sumRatings / guide.receivedReviews.length;

          await ctx.prisma.guideProfile.update({
            where: { userId: review.receiverId },
            data: {
              averageRating,
              totalTours: Math.max(0, guide.guideProfile.totalTours - 1),
            },
          });
        } else {
          await ctx.prisma.guideProfile.update({
            where: { userId: review.receiverId },
            data: {
              averageRating: 0,
              totalTours: 0,
            },
          });
        }
      }

      return { success: true };
    }),
});

