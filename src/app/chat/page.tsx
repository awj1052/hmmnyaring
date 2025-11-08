/**
 * 채팅 목록 페이지
 */

'use client';

import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

// 빌드 타임 프리렌더링 비활성화 (useSession 사용 시 필요)
export const dynamic = 'force-dynamic';

export default function ChatListPage() {
  const trpc = useTRPC();
  const { data: session, status: sessionStatus } = useSession();

  // 채팅방 목록 (폴링 제거 - 실시간 채팅은 개별 채팅방에서 처리)
  const { data: rooms, isLoading } = useQuery(
    trpc.chat.getRooms.queryOptions()
  );

  // 세션 로딩 중
  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 py-8">
        <h1 className="text-3xl font-bold">채팅</h1>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 py-8">
        <h1 className="text-3xl font-bold">채팅</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">아직 채팅방이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              투어 요청이 수락되면 채팅방이 생성됩니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">채팅</h1>
        <Badge variant="secondary">{rooms.length}개의 대화</Badge>
      </div>

      <div className="space-y-2">
        {rooms.map((room) => {
          const otherUser =
            session?.user.id === room.traveler.id ? room.guide : room.traveler;
          const isUnread = false; // TODO: 읽지 않은 메시지 표시 (선택 사항)

          return (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.image || undefined} />
                      <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{otherUser.name}</h3>
                        {room.lastMessage && (
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {format(new Date(room.lastMessage.createdAt), 'p', {
                              locale: ko,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {room.lastMessage
                          ? room.lastMessage.content
                          : '메시지를 시작해보세요!'}
                      </p>
                    </div>
                    {isUnread && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

