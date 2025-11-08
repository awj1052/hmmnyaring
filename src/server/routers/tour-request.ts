/**
 * TourRequest 라우터
 * 
 * 투어 요청 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { TourCategory, TourRequestStatus } from '@prisma/client';
import { tourRequestRateLimit, checkRateLimit } from '@/lib/simple-rate-limit';
import { messageSchema } from '@/lib/validators';

export const tourRequestRouter = createTRPCRouter({
  // 투어 요청 생성 (여행자 전용)
  // 🔒 보안: Rate Limiting (1시간당 5회)
  create: protectedProcedure
    .input(
      z.object({
        guideId: z.string(),
        requestedDate: z.date(),
        message: messageSchema,
        category: z.nativeEnum(TourCategory),
        isOnline: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 보안: Rate limit 체크
      const rateLimitResult = await checkRateLimit(
        tourRequestRateLimit,
        ctx.session.user.id
      );

      if (!rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: '투어 요청이 너무 많습니다. 1시간 후 다시 시도하세요.',
        });
      }
      // 여행자만 요청 가능
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== 'TRAVELER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '여행자만 투어를 요청할 수 있습니다.',
        });
      }

      // 가이드 존재 확인
      const guide = await ctx.prisma.user.findUnique({
        where: { id: input.guideId, role: 'GUIDE' },
      });

      if (!guide) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '가이드를 찾을 수 없습니다.',
        });
      }

      // 투어 요청 생성
      const tourRequest = await ctx.prisma.tourRequest.create({
        data: {
          travelerId: ctx.session.user.id,
          guideId: input.guideId,
          requestedDate: input.requestedDate,
          message: input.message,
          category: input.category,
          isOnline: input.isOnline,
          status: 'PENDING',
        },
        include: {
          guide: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return tourRequest;
    }),

  // 내가 보낸 요청 목록
  getMyRequests: protectedProcedure.query(async ({ ctx }) => {
    const requests = await ctx.prisma.tourRequest.findMany({
      where: { travelerId: ctx.session.user.id },
      include: {
        guide: {
          select: {
            id: true,
            name: true,
            image: true,
            guideProfile: {
              select: {
                averageRating: true,
                totalTours: true,
              },
            },
          },
        },
        chatRoom: true,
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }),

  // 내가 받은 요청 목록 (가이드 전용)
  getReceivedRequests: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    if (!user || user.role !== 'GUIDE') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: '가이드만 접근할 수 있습니다.',
      });
    }

    const requests = await ctx.prisma.tourRequest.findMany({
      where: { guideId: ctx.session.user.id },
      include: {
        traveler: {
          select: {
            id: true,
            name: true,
            image: true,
            travelerProfile: {
              select: {
                nationality: true,
                interests: true,
              },
            },
          },
        },
        chatRoom: true,
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }),

  // 투어 요청 수락 (가이드 전용)
  accept: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== 'GUIDE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 요청을 수락할 수 있습니다.',
        });
      }

      // 요청 확인
      const request = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.guideId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '요청을 찾을 수 없거나 권한이 없습니다.',
        });
      }

      if (request.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미 처리된 요청입니다.',
        });
      }

      // 요청 수락 + 채팅방 생성
      const updatedRequest = await ctx.prisma.tourRequest.update({
        where: { id: input.requestId },
        data: {
          status: 'ACCEPTED',
          chatRoom: {
            create: {},
          },
        },
        include: {
          chatRoom: true,
          traveler: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedRequest;
    }),

  // 투어 요청 거절 (가이드 전용)
  reject: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== 'GUIDE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 요청을 거절할 수 있습니다.',
        });
      }

      // 요청 확인
      const request = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.guideId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '요청을 찾을 수 없거나 권한이 없습니다.',
        });
      }

      if (request.status !== 'PENDING') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미 처리된 요청입니다.',
        });
      }

      // 요청 거절
      const updatedRequest = await ctx.prisma.tourRequest.update({
        where: { id: input.requestId },
        data: {
          status: 'REJECTED',
        },
      });

      return updatedRequest;
    }),

  // 투어 요청 취소 (여행자 전용)
  cancel: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 요청 확인
      const request = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.travelerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '요청을 찾을 수 없거나 권한이 없습니다.',
        });
      }

      if (request.status !== 'PENDING' && request.status !== 'ACCEPTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '취소할 수 없는 상태입니다.',
        });
      }

      // 요청 취소
      const updatedRequest = await ctx.prisma.tourRequest.update({
        where: { id: input.requestId },
        data: {
          status: 'CANCELLED',
        },
      });

      return updatedRequest;
    }),

  // 투어 완료 처리 (가이드 전용)
  complete: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
      });

      if (!user || user.role !== 'GUIDE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 투어를 완료 처리할 수 있습니다.',
        });
      }

      // 요청 확인
      const request = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.requestId },
      });

      if (!request || request.guideId !== ctx.session.user.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '요청을 찾을 수 없거나 권한이 없습니다.',
        });
      }

      if (request.status !== 'ACCEPTED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '완료 처리할 수 없는 상태입니다.',
        });
      }

      // 투어 완료
      const updatedRequest = await ctx.prisma.tourRequest.update({
        where: { id: input.requestId },
        data: {
          status: 'COMPLETED',
        },
      });

      return updatedRequest;
    }),

  // 특정 투어 요청 조회
  getById: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.tourRequest.findUnique({
        where: { id: input.requestId },
        include: {
          traveler: {
            select: {
              id: true,
              name: true,
              image: true,
              travelerProfile: true,
            },
          },
          guide: {
            select: {
              id: true,
              name: true,
              image: true,
              guideProfile: true,
            },
          },
          chatRoom: true,
          review: true,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '요청을 찾을 수 없습니다.',
        });
      }

      // 권한 확인 (본인 또는 상대방만)
      if (
        request.travelerId !== ctx.session.user.id &&
        request.guideId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '권한이 없습니다.',
        });
      }

      return request;
    }),
});

