/**
 * 프로필 수정 페이지
 */

import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { ProfileEditForm } from '@/components/profile/profile-edit-form';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function ProfileEditPage() {
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('profile');

  if (!session) {
    nextRedirect(`/${locale}/login`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      guideProfile: true,
      travelerProfile: true,
    },
  });

  if (!user) {
    nextRedirect(`/${locale}/login`);
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('editProfile')}</h1>
        <p className="text-muted-foreground">{t('editProfileDesc')}</p>
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}

