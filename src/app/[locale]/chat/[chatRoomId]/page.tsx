/**
 * 채팅 페이지
 */

'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import { ShareLocationModal } from '@/components/chat/ShareLocationModal';
import { PlaceSearchResult } from '@/components/map/PlaceSearch';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { useTranslations, useLocale } from 'next-intl';
import { getDateLocale } from '@/lib/date-locale';

// 빌드 타임 프리렌더링 비활성화 (useSession 사용 시 필요)
export const dynamic = 'force-dynamic';

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatRoomId: string }>;
}) {
  const { chatRoomId } = use(params);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const locale = useLocale();
  const t = useTranslations('chatRoom');
  const dateLocale = getDateLocale(locale);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 정보
  const { data: roomInfo, isLoading: isLoadingRoom } = useQuery(
    trpc.chat.getRoomInfo.queryOptions({ chatRoomId }, { refetchInterval: false })
  );

  // 메시지 목록 (실시간 SSE로 업데이트, 폴링 제거)
  const { data: messagesData, isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery(
    trpc.chat.getMessages.queryOptions({ chatRoomId })
  );

  // 메시지 전송
  const sendMessageMutation = useMutation({
    ...trpc.chat.sendMessage.mutationOptions(),
    onSuccess: () => {
      setMessage('');
      // 메시지 목록 즉시 갱신
      refetchMessages();
    },
  });

  // SSE로 실시간 메시지 수신
  useEffect(() => {
    if (!chatRoomId || sessionStatus !== 'authenticated') return;

    const eventSource = new EventSource(`/api/chat/stream/${chatRoomId}`);

    eventSource.onmessage = (event) => {
      // 새 메시지가 도착하면 쿼리 무효화하여 리페치
      queryClient.invalidateQueries({
        queryKey: [['chat', 'getMessages'], { input: { chatRoomId }, type: 'query' }],
      });
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      // 연결 실패 시 자동 재연결 (5초 후)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [['chat', 'getMessages'], { input: { chatRoomId }, type: 'query' }],
        });
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [chatRoomId, sessionStatus, queryClient]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessageMutation.mutateAsync({
      chatRoomId,
      content: message.trim(),
    });
  };

  const handleShareLocation = async (place: PlaceSearchResult) => {
    await sendMessageMutation.mutateAsync({
      chatRoomId,
      content: `📍 ${place.place_name}`,
      placeId: place.id,
      placeName: place.place_name,
      placeAddress: place.road_address_name || place.address_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
    });
  };

  // 세션 로딩 중
  if (sessionStatus === 'loading' || isLoadingRoom) {
    return (
      <div className="container mx-auto max-w-4xl space-y-4 py-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!roomInfo) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('notFound')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherUser = roomInfo.otherUser;
  const messages = messagesData?.messages || [];

  return (
    <div className="container mx-auto max-w-4xl space-y-4 py-8">
      {/* 헤더 */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherUser.image || undefined} />
            <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{otherUser.name}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(roomInfo.tourRequest.requestedDate), 'PPP', { locale: dateLocale })} {t('tour')}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* 메시지 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-4">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {t('noMessages')}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMine = msg.sender.id === session?.user.id;
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isOwnMessage={isMine}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 메시지 입력 */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <ShareLocationModal onShare={handleShareLocation} />
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('inputPlaceholder')}
              disabled={sendMessageMutation.isPending}
            />
            <Button type="submit" disabled={!message.trim() || sendMessageMutation.isPending}>
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

