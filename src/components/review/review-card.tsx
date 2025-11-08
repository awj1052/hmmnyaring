/**
 * 리뷰 카드 컴포넌트
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';

type ReviewCardProps = {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  showAuthor?: boolean;
};

export function ReviewCard({ review, showAuthor = true }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* 작성자 정보 */}
          {showAuthor && (
            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${review.author.id}`}
                className="flex items-center gap-2 hover:underline"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.author.image || undefined} />
                  <AvatarFallback>{review.author.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{review.author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.createdAt), 'PPP', { locale: ko })}
                  </p>
                </div>
              </Link>

              {/* 별점 */}
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
          )}

          {!showAuthor && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), 'PPP', { locale: ko })}
              </p>
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
          )}

          {/* 리뷰 내용 */}
          <p className="text-sm leading-relaxed">{review.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}

