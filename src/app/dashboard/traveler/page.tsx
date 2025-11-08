/**
 * 여행자 대시보드
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function TravelerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== 'TRAVELER') {
    redirect('/login');
  }

  // 여행자 프로필 및 투어 요청
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      travelerProfile: true,
      sentRequests: {
        include: {
          guide: {
            select: {
              id: true,
              name: true,
              image: true,
              guideProfile: {
                select: {
                  averageRating: true,
                  totalTours: true,
                },
              },
            },
          },
          chatRoom: true,
          review: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      sentReviews: {
        include: {
          receiver: {
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
        take: 5,
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // 프로필이 없으면 complete 페이지로
  if (!user.travelerProfile) {
    redirect('/register/complete');
  }

  const pendingRequests = user.sentRequests.filter((r) => r.status === 'PENDING');
  const acceptedRequests = user.sentRequests.filter((r) => r.status === 'ACCEPTED');
  const completedRequests = user.sentRequests.filter((r) => r.status === 'COMPLETED');

  const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: '대기중', variant: 'secondary' },
    ACCEPTED: { label: '수락됨', variant: 'default' },
    REJECTED: { label: '거절됨', variant: 'destructive' },
    COMPLETED: { label: '완료됨', variant: 'outline' },
    CANCELLED: { label: '취소됨', variant: 'destructive' },
  };

  const CATEGORY_MAP: Record<string, string> = {
    FOOD: '맛집',
    CAFE: '카페',
    HISTORY: '역사/문화',
    NATURE: '자연',
    SHOPPING: '쇼핑',
    NIGHTLIFE: '나이트라이프',
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">여행자 대시보드</h1>
        <p className="text-muted-foreground">안녕하세요, {user.name}님!</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기 중인 요청</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">가이드 응답 대기</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예정된 투어</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRequests.length}</div>
            <p className="text-xs text-muted-foreground">수락된 투어</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료된 투어</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <p className="text-xs text-muted-foreground">총 투어 수</p>
          </CardContent>
        </Card>
      </div>

      {/* 가이드 찾기 버튼 */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">대전의 로컬 가이드를 찾아보세요!</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            AI 매칭으로 나에게 맞는 가이드를 추천받을 수 있습니다.
          </p>
          <Button size="lg" asChild>
            <Link href="/guides">가이드 찾기</Link>
          </Button>
        </CardContent>
      </Card>

      {/* 투어 요청 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>내 투어 요청</CardTitle>
        </CardHeader>
        <CardContent>
          {user.sentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              아직 보낸 투어 요청이 없습니다.
              <br />
              <Button className="mt-4" asChild>
                <Link href="/guides">가이드 찾아보기</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {user.sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={request.guide.image || undefined} />
                      <AvatarFallback>{request.guide.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${request.guide.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.guide.name}
                        </Link>
                        <Badge variant={STATUS_MAP[request.status].variant}>
                          {STATUS_MAP[request.status].label}
                        </Badge>
                        <Badge variant="outline">{CATEGORY_MAP[request.category]}</Badge>
                        {request.isOnline && <Badge variant="secondary">비대면</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          투어일: {format(new Date(request.requestedDate), 'PPP', { locale: ko })}
                        </span>
                        <span>
                          요청일: {format(new Date(request.createdAt), 'PPP', { locale: ko })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {request.status === 'ACCEPTED' && request.chatRoom && (
                      <Button size="sm" asChild>
                        <Link href={`/chat/${request.chatRoom.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          채팅
                        </Link>
                      </Button>
                    )}
                    {request.status === 'COMPLETED' && !request.review && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tour/${request.id}/review`}>리뷰 작성</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 내가 작성한 리뷰 */}
      {user.sentReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>내가 작성한 리뷰</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.sentReviews.map((review) => (
                <div key={review.id} className="space-y-2 border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={review.receiver.image || undefined} />
                        <AvatarFallback>{review.receiver.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link
                          href={`/profile/${review.receiver.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {review.receiver.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), 'PPP', { locale: ko })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{review.rating}.0</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

