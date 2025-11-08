/**
 * 클라이언트 환경변수 검증
 * 
 * NEXT_PUBLIC_ 접두사가 있는 환경변수만 포함
 */

import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_KAKAO_MAP_API_KEY: z.string().min(1, 'NEXT_PUBLIC_KAKAO_MAP_API_KEY is required'),
});

/**
 * 클라이언트 환경변수
 * 
 * @example
 * import { clientEnv } from '@/env/client';
 * console.log(clientEnv.NEXT_PUBLIC_APP_URL);
 */
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
});

// 타입 export
export type ClientEnv = z.infer<typeof clientSchema>;

