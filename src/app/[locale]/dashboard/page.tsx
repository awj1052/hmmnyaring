/**
 * 대시보드 페이지 (보호된 라우트)
 * 역할에 따라 가이드/여행자 대시보드로 리다이렉트
 */

import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { getLocale } from 'next-intl/server';

export default async function DashboardPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session) {
    nextRedirect(`/${locale}/login`);
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
    nextRedirect(`/${locale}/login`);
  }

  // 프로필이 없으면 complete 페이지로
  const hasProfile = !!(user.guideProfile || user.travelerProfile);

  if (!hasProfile) {
    nextRedirect(`/${locale}/register/complete`);
  }

  // 역할에 따라 리다이렉트
  if (user.role === 'GUIDE') {
    nextRedirect(`/${locale}/dashboard/guide`);
  } else if (user.role === 'TRAVELER') {
    nextRedirect(`/${locale}/dashboard/traveler`);
  }

  // 기본 (ADMIN 등)
  nextRedirect(`/${locale}/`);
}

