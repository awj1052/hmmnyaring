/**
 * Google 로그인 후 추가 정보 입력 페이지
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { CompleteProfileForm } from '@/components/auth/complete-profile-form';

export default async function CompleteRegistrationPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // 사용자 정보 조회 - 항상 DB에서 최신 상태 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      guideProfile: true,
      travelerProfile: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  // 이미 프로필이 있으면 대시보드로 (needsProfile과 관계없이 DB 상태 우선)
  if (user.guideProfile || user.travelerProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <CompleteProfileForm user={user} />
      </div>
    </div>
  );
}

