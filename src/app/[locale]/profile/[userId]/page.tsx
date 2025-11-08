/**
 * 사용자 프로필 페이지 (공개)
 */

import { prisma } from '@/server/db';
import { notFound } from 'next/navigation';
import { GuideProfileCard } from '@/components/profile/guide-profile-card';
import { TravelerProfileCard } from '@/components/profile/traveler-profile-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';
import { TourRequestModal } from '@/components/tour/tour-request-modal';
import { Link } from '@/i18n/routing';
import { getTranslations, getLocale } from 'next-intl/server';
import { getDateLocale } from '@/lib/date-locale';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await auth();
  const locale = await getLocale();
  const t = await getTranslations('profile');
  const dateLocale = getDateLocale(locale);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guideProfile: true,
      travelerProfile: true,
      receivedReviews: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwner = session?.user.id === userId;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isOwner ? t('myProfile') : t('userProfile', { name: user.name || '' })}
        </h1>
        {isOwner && (
          <Button asChild>
            <Link href="/profile/edit">{t('editProfile')}</Link>
          </Button>
        )}
      </div>

      {user.role === 'GUIDE' ? (
        <GuideProfileCard user={user} />
      ) : (
        <TravelerProfileCard user={user} />
      )}

      {/* 리뷰 섹션 (가이드인 경우에만) */}
      {user.role === 'GUIDE' && user.receivedReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('reviews')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.receivedReviews.map((review) => (
              <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.author.image || undefined} />
                      <AvatarFallback>{review.author.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.createdAt), 'PPP', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 투어 요청 버튼 (가이드이고 본인이 아닌 경우, 여행자만) */}
      {user.role === 'GUIDE' && !isOwner && session?.user.role === 'TRAVELER' && (
        <TourRequestModal guideId={userId} guideName={user.name || t('guide')}>
          <Button size="lg" className="w-full">{t('requestTour')}</Button>
        </TourRequestModal>
      )}
    </div>
  );
}

