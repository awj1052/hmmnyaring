/**
 * 대시보드 페이지 (보호된 라우트)
 * 역할에 따라 가이드/여행자 대시보드로 리다이렉트
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // DB에서 프로필 상태 확인 (needsProfile 세션 값과 관계없이)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      guideProfile: true,
      travelerProfile: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // 프로필이 없으면 complete 페이지로
  const hasProfile = !!(user.guideProfile || user.travelerProfile);

  if (!hasProfile) {
    redirect('/register/complete');
  }

  // 역할에 따라 리다이렉트
  if (user.role === 'GUIDE') {
    redirect('/dashboard/guide');
  } else if (user.role === 'TRAVELER') {
    redirect('/dashboard/traveler');
  }

  // 기본 (ADMIN 등)
  redirect('/');
}

