/**
 * User 라우터
 * 
 * 유저 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import bcrypt from 'bcryptjs';
import { UserRole, Language, TourCategory } from '@prisma/client';
import { registerRateLimit, checkRateLimit } from '@/lib/simple-rate-limit';
import { getClientIp } from '@/lib/security';
import { 
  emailSchema, 
  strongPasswordSchema, 
  nameSchema,
  bioSchema,
  phoneSchema,
  nationalitySchema 
} from '@/lib/validators';
import { TRPCError } from '@trpc/server';

export const userRouter = createTRPCRouter({
  // 현재 로그인된 유저 정보
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
  }),

  // 유저 회원가입 (Credentials용)
  // 🔒 보안: Rate Limiting (IP 기반, 1시간당 3회)
  register: publicProcedure
    .input(
      z.object({
        email: emailSchema,
        password: strongPasswordSchema,
        name: nameSchema,
        role: z.enum(['TRAVELER', 'GUIDE']).default('TRAVELER'),
        // 가이드용 추가 정보
        bio: bioSchema.optional(),
        languages: z.array(z.enum(['KOREAN', 'ENGLISH', 'JAPANESE', 'CHINESE', 'SPANISH', 'FRENCH'])).optional(),
        categories: z.array(z.enum(['FOOD', 'CAFE', 'HISTORY', 'NATURE', 'SHOPPING', 'NIGHTLIFE'])).optional(),
        phoneNumber: phoneSchema.optional(),
        // 여행자용 추가 정보
        nationality: nationalitySchema.optional(),
        interests: z.array(z.enum(['FOOD', 'CAFE', 'HISTORY', 'NATURE', 'SHOPPING', 'NIGHTLIFE'])).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 보안: IP 기반 rate limit
      const ip = ctx.headers ? getClientIp(ctx.headers) : 'unknown';
      const rateLimitResult = await checkRateLimit(registerRateLimit, ip);

      if (!rateLimitResult.success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: '회원가입 시도 횟수를 초과했습니다. 1시간 후 다시 시도하세요.',
        });
      }
      // 이메일 중복 체크
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // 유저 생성 + 역할별 프로필 생성
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
          role: input.role as UserRole,
          // 역할별 프로필 생성
          ...(input.role === 'GUIDE'
            ? {
                guideProfile: {
                  create: {
                    bio: input.bio || '안녕하세요! 대전을 소개할 준비가 되어있습니다.',
                    languages: (input.languages || ['KOREAN']) as Language[],
                    categories: (input.categories || ['FOOD']) as TourCategory[],
                    phoneNumber: input.phoneNumber,
                  },
                },
              }
            : {
                travelerProfile: {
                  create: {
                    nationality: input.nationality,
                    interests: (input.interests || ['FOOD']) as TourCategory[],
                    preferredLanguages: ['KOREAN'] as Language[],
                  },
                },
              }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return user;
    }),

  // 프로필 업데이트
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: nameSchema.optional(),
        image: z.string().url().optional(), // 🔒 보안: 이미지 URL은 OAuth 제공자에서만 받음
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 🔒 보안: 이미지 URL은 OAuth 제공자(Google 등)에서 제공된 것만 사용
      // 사용자가 직접 URL을 변경할 수 없도록 함
      if (input.image) {
        const { isAllowedImageUrl } = await import('@/lib/security');
        if (!isAllowedImageUrl(input.image)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '허용되지 않은 이미지 URL입니다.',
          });
        }
      }

      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});

