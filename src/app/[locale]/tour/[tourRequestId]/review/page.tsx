/**
 * 리뷰 작성 페이지
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

export default function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; tourRequestId: string }>;
}) {
  const { tourRequestId } = use(params);
  const router = useRouter();
  const trpc = useTRPC();
  const t = useTranslations('review');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  // 투어 요청 정보 조회
  const { data: tourRequest, isLoading } = useQuery(
    trpc.tourRequest.getById.queryOptions({ requestId: tourRequestId })
  );

  // 리뷰 생성 뮤테이션
  const createReviewMutation = useMutation({
    ...trpc.review.create.mutationOptions(),
    onSuccess: () => {
      toast.success(t('success'));
      router.push('/dashboard');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || t('error'));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error(t('selectRating'));
      return;
    }

    if (comment.length < 10) {
      toast.error(t('minLength'));
      return;
    }

    await createReviewMutation.mutateAsync({
      tourRequestId,
      rating,
      comment,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl space-y-6 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!tourRequest) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('notFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tourRequest.status !== 'COMPLETED') {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('onlyCompleted')}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tourRequest.review) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('alreadyReviewed')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const guide = tourRequest.guide;

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">{t('writeReview')}</h1>
        <p className="text-muted-foreground">{t('howWasTour')}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={guide.image || undefined} />
              <AvatarFallback>{guide.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{guide.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('guide')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 별점 */}
            <div className="space-y-2">
              <Label>{t('rating')}</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('ratingSelected', { rating })}
                </p>
              )}
            </div>

            {/* 코멘트 */}
            <div className="space-y-2">
              <Label htmlFor="comment">{t('reviewContent')}</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('reviewPlaceholder')}
                rows={6}
                minLength={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                {comment.length < 10
                  ? t('minCharacters', { count: comment.length })
                  : t('characterCount', { count: comment.length })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createReviewMutation.isPending || rating === 0 || comment.length < 10}
                className="flex-1"
              >
                {createReviewMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
