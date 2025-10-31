/**
 * Post 라우터
 * 
 * 포스트 CRUD 예제
 */

import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  // 모든 공개 포스트 조회
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // ID로 포스트 조회
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('포스트를 찾을 수 없습니다.');
      }

      return post;
    }),

  // 내 포스트 목록 조회 (인증 필요)
  getMyPosts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      where: { authorId: ctx.session.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // 포스트 생성 (인증 필요)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, '제목을 입력해주세요.'),
        content: z.string().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          published: input.published,
          authorId: ctx.session.user.id!,
        },
      });
    }),

  // 포스트 수정 (인증 필요)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // 본인 포스트인지 확인
      const post = await ctx.prisma.post.findUnique({ where: { id } });
      if (!post || post.authorId !== ctx.session.user.id) {
        throw new Error('권한이 없습니다.');
      }

      return ctx.prisma.post.update({
        where: { id },
        data,
      });
    }),

  // 포스트 삭제 (인증 필요)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 본인 포스트인지 확인
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post || post.authorId !== ctx.session.user.id) {
        throw new Error('권한이 없습니다.');
      }

      return ctx.prisma.post.delete({
        where: { id: input.id },
      });
    }),
});

