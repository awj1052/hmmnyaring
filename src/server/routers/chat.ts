/**
 * Chat 라우터
 * 
 * 채팅 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { chatEvents } from '@/lib/events';

export const chatRouter = createTRPCRouter({
  // 내 채팅방 목록
  getRooms: protectedProcedure.query(async ({ ctx }) => {
    const tourRequests = await ctx.prisma.tourRequest.findMany({
      where: {
        OR: [{ travelerId: ctx.session.user.id }, { guideId: ctx.session.user.id }],
        chatRoom: {
          isNot: null,
        },
      },
      include: {
        chatRoom: {
          include: {
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        },
        traveler: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        guide: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return tourRequests.map((request) => ({
      id: request.chatRoom!.id,
      tourRequestId: request.id,
      traveler: request.traveler,
      guide: request.guide,
      lastMessage: request.chatRoom!.messages[0] || null,
      updatedAt: request.chatRoom!.updatedAt,
    }));
  }),

  // 특정 채팅방의 메시지 목록
  getMessages: protectedProcedure
    .input(
      z.object({
        chatRoomId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // 채팅방 확인
      const chatRoom = await ctx.prisma.chatRoom.findUnique({
        where: { id: input.chatRoomId },
        include: {
          tourRequest: {
            select: {
              travelerId: true,
              guideId: true,
            },
          },
        },
      });

      if (!chatRoom) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '채팅방을 찾을 수 없습니다.',
        });
      }

      // 권한 확인
      if (
        chatRoom.tourRequest.travelerId !== ctx.session.user.id &&
        chatRoom.tourRequest.guideId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '권한이 없습니다.',
        });
      }

      const messages = await ctx.prisma.message.findMany({
        where: { chatRoomId: input.chatRoomId },
        include: {
          sender: {
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
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),

  // 메시지 전송
  // 🔒 보안: Rate Limiting (10초당 5회)
  sendMessage: protectedProcedure
    .input(
      z.object({
        chatRoomId: z.string(),
        content: z.string().min(1, '메시지를 입력해주세요.').max(2000, '메시지는 2000자를 초과할 수 없습니다.'),
        // 장소 정보 (선택적)
        placeId: z.string().optional(),
        placeName: z.string().optional(),
        placeAddress: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 보안: Rate limit 체크
      const { chatRateLimit, checkRateLimit } = await import('@/lib/simple-rate-limit');
      const rateLimitResult = await checkRateLimit(
        chatRateLimit,
        ctx.session.user.id
      );

      if (!rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: '메시지 전송이 너무 빠릅니다. 잠시 후 다시 시도하세요.',
        });
      }
      // 채팅방 확인
      const chatRoom = await ctx.prisma.chatRoom.findUnique({
        where: { id: input.chatRoomId },
        include: {
          tourRequest: {
            select: {
              travelerId: true,
              guideId: true,
            },
          },
        },
      });

      if (!chatRoom) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '채팅방을 찾을 수 없습니다.',
        });
      }

      // 권한 확인
      if (
        chatRoom.tourRequest.travelerId !== ctx.session.user.id &&
        chatRoom.tourRequest.guideId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '권한이 없습니다.',
        });
      }

      // 메시지 생성
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          senderId: ctx.session.user.id,
          chatRoomId: input.chatRoomId,
          // 장소 정보 (있는 경우만)
          ...(input.placeId && {
            placeId: input.placeId,
            placeName: input.placeName,
            placeAddress: input.placeAddress,
            latitude: input.latitude,
            longitude: input.longitude,
          }),
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 채팅방 업데이트 시간 갱신
      await ctx.prisma.chatRoom.update({
        where: { id: input.chatRoomId },
        data: {
          updatedAt: new Date(),
        },
      });

      // 실시간 이벤트 브로드캐스트
      chatEvents.broadcastMessage({
        chatRoomId: input.chatRoomId,
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
          sender: message.sender,
          placeId: message.placeId,
          placeName: message.placeName,
          placeAddress: message.placeAddress,
          latitude: message.latitude,
          longitude: message.longitude,
        },
      });

      return message;
    }),

  // 채팅방 정보 조회
  getRoomInfo: protectedProcedure
    .input(
      z.object({
        chatRoomId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const chatRoom = await ctx.prisma.chatRoom.findUnique({
        where: { id: input.chatRoomId },
        include: {
          tourRequest: {
            include: {
              traveler: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
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
            },
          },
        },
      });

      if (!chatRoom) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '채팅방을 찾을 수 없습니다.',
        });
      }

      // 권한 확인
      if (
        chatRoom.tourRequest.travelerId !== ctx.session.user.id &&
        chatRoom.tourRequest.guideId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '권한이 없습니다.',
        });
      }

      // 상대방 정보
      const otherUser =
        chatRoom.tourRequest.travelerId === ctx.session.user.id
          ? chatRoom.tourRequest.guide
          : chatRoom.tourRequest.traveler;

      return {
        chatRoom,
        otherUser,
        tourRequest: chatRoom.tourRequest,
      };
    }),
});

