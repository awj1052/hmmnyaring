/**
 * 내 프로필 페이지
 */

import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GuideProfileCard } from '@/components/profile/guide-profile-card';
import { TravelerProfileCard } from '@/components/profile/traveler-profile-card';
import { Edit } from 'lucide-react';
import { prisma } from '@/server/db';
import { Link } from '@/i18n/routing';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function ProfilePage() {
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
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('myProfile')}</h1>
        <Button asChild>
          <Link href="/profile/edit">
            <Edit className="mr-2 h-4 w-4" />
            {t('editProfile')}
          </Link>
        </Button>
      </div>

      {user.role === 'GUIDE' ? (
        <GuideProfileCard user={user} />
      ) : (
        <TravelerProfileCard user={user} />
      )}
    </div>
  );
}

