/**
 * Profile 라우터
 * 
 * 프로필 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { Language, TourCategory, UserRole } from '@prisma/client';
import { bioSchema, phoneSchema, nationalitySchema } from '@/lib/validators';
import { safeImageUrlSchema } from '@/lib/security';

export const profileRouter = createTRPCRouter({
  // 내 프로필 조회
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        guideProfile: true,
        travelerProfile: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    return user;
  }),

  // 특정 사용자 프로필 조회 (공개)
  getById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        include: {
          guideProfile: true,
          travelerProfile: true,
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
            take: 10,
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.',
        });
      }

      // 비밀번호 제거
      const { password, ...userWithoutPassword } = user;

      return userWithoutPassword;
    }),

  // 가이드 프로필 수정
  updateGuideProfile: protectedProcedure
    .input(
      z.object({
        bio: bioSchema.optional(),
        phoneNumber: phoneSchema.optional(),
        languages: z.array(z.nativeEnum(Language)).min(1, '최소 1개의 언어를 선택해주세요.').optional(),
        categories: z.array(z.nativeEnum(TourCategory)).min(1, '최소 1개의 카테고리를 선택해주세요.').optional(),
        certifications: z.array(z.string()).optional(),
        availableDays: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { guideProfile: true },
      });

      if (!user || user.role !== 'GUIDE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 접근할 수 있습니다.',
        });
      }

      if (!user.guideProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '가이드 프로필을 찾을 수 없습니다.',
        });
      }

      return ctx.prisma.guideProfile.update({
        where: { userId: ctx.session.user.id },
        data: input,
      });
    }),

  // 여행자 프로필 수정
  updateTravelerProfile: protectedProcedure
    .input(
      z.object({
        nationality: nationalitySchema.optional(),
        preferredLanguages: z.array(z.nativeEnum(Language)).optional(),
        interests: z.array(z.nativeEnum(TourCategory)).optional(),
        visitStartDate: z.date().optional(),
        visitEndDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { travelerProfile: true },
      });

      if (!user || user.role !== 'TRAVELER') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '여행자만 접근할 수 있습니다.',
        });
      }

      if (!user.travelerProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '여행자 프로필을 찾을 수 없습니다.',
        });
      }

      return ctx.prisma.travelerProfile.update({
        where: { userId: ctx.session.user.id },
        data: input,
      });
    }),

  // 가이드 인증서 업로드 (URL)
  // 🔒 보안: SSRF 방어 - 안전한 URL만 허용
  uploadVerification: protectedProcedure
    .input(
      z.object({
        verificationDoc: safeImageUrlSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { guideProfile: true },
      });

      if (!user || user.role !== 'GUIDE' || !user.guideProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: '가이드만 접근할 수 있습니다.',
        });
      }

      return ctx.prisma.guideProfile.update({
        where: { userId: ctx.session.user.id },
        data: {
          verificationDoc: input.verificationDoc,
          // 관리자 승인 전까지는 false
          isVerified: false,
        },
      });
    }),

  // Google 로그인 후 프로필 완성 (역할 선택 및 프로필 생성)
  completeProfile: protectedProcedure
    .input(
      z.object({
        role: z.nativeEnum(UserRole),
        // 가이드용
        bio: z.string().optional(),
        phoneNumber: z.string().optional(),
        languages: z.array(z.nativeEnum(Language)).optional(),
        categories: z.array(z.nativeEnum(TourCategory)).optional(),
        // 여행자용
        nationality: z.string().optional(),
        interests: z.array(z.nativeEnum(TourCategory)).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          guideProfile: true,
          travelerProfile: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: '사용자를 찾을 수 없습니다.',
        });
      }

      // 이미 프로필이 있는 경우
      if (user.guideProfile || user.travelerProfile) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '이미 프로필이 설정되어 있습니다.',
        });
      }

      // 역할 업데이트 및 프로필 생성
      const updatedUser = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          role: input.role,
          ...(input.role === UserRole.GUIDE
            ? {
                guideProfile: {
                  create: {
                    bio: input.bio || '안녕하세요! 대전을 소개할 준비가 되어있습니다.',
                    languages: input.languages || [Language.KOREAN],
                    categories: input.categories || [TourCategory.FOOD],
                    phoneNumber: input.phoneNumber,
                  },
                },
              }
            : {
                travelerProfile: {
                  create: {
                    nationality: input.nationality,
                    interests: input.interests || [TourCategory.FOOD],
                    preferredLanguages: [Language.KOREAN],
                  },
                },
              }),
        },
        include: {
          guideProfile: true,
          travelerProfile: true,
        },
      });

      return updatedUser;
    }),
});

