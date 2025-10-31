/**
 * tRPC 클라이언트 생성
 * 
 * 클라이언트 컴포넌트에서 사용
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();

