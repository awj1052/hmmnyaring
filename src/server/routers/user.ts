/**
 * User 라우터
 * 
 * 유저 관련 쿼리/뮤테이션
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import bcrypt from 'bcryptjs';

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
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email('올바른 이메일을 입력해주세요.'),
        password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
        name: z.string().min(1, '이름을 입력해주세요.'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 이메일 중복 체크
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // 유저 생성
      const user = await ctx.prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return user;
    }),

  // 프로필 업데이트
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});

