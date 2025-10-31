/**
 * 포스트 관련 Zod 스키마
 */

import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(200, '제목이 너무 깁니다.'),
  content: z.string().optional(),
  published: z.boolean().default(false),
});

export const updatePostSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(200, '제목이 너무 깁니다.')
    .optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

export const getPostByIdSchema = z.object({
  id: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;

