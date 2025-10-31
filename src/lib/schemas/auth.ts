/**
 * 인증 관련 Zod 스키마
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다.'),
});

export const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .max(100, '비밀번호가 너무 깁니다.'),
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(100, '이름이 너무 깁니다.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').optional(),
  image: z.string().url('올바른 URL을 입력해주세요.').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

