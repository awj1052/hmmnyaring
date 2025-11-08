/**
 * 채팅 메시지 컴포넌트 (텍스트 + 장소 공유)
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, ExternalLink, Languages, Loader2 } from 'lucide-react';
import { KakaoMap } from '@/components/map/KakaoMap';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/lib/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import { getDateLocale } from '@/lib/date-locale';

type ChatMessageProps = {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string | null;
      image: string | null;
    };
    // 장소 정보 (선택적)
    placeId?: string | null;
    placeName?: string | null;
    placeAddress?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  isOwnMessage: boolean;
};

export function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const locale = useLocale();
  const t = useTranslations('chat');
  const dateLocale = getDateLocale(locale);
  const [showMapModal, setShowMapModal] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const trpc = useTRPC();

  const hasLocation =
    message.placeId &&
    message.placeName &&
    message.latitude !== null &&
    message.longitude !== null;

  // 번역 mutation
  const translateMutation = useMutation({
    ...trpc.translation.translate.mutationOptions(),
    onSuccess: (data) => {
      setTranslatedText(data.translatedText);
      setShowTranslation(true);
    },
    onError: (error) => {
      toast.error('번역 실패', {
        description: error.message || '번역 중 오류가 발생했습니다.',
      });
    },
  });

  const handleTranslate = () => {
    if (translatedText && showTranslation) {
      // 이미 번역되어 있으면 토글
      setShowTranslation(!showTranslation);
    } else if (translatedText) {
      // 번역은 있지만 숨겨져 있으면 표시
      setShowTranslation(true);
    } else {
      // 번역이 없으면 API 호출
      translateMutation.mutate({ text: message.content });
    }
  };

  const openKakaoMap = () => {
    if (hasLocation) {
      const url = `https://map.kakao.com/link/map/${encodeURIComponent(
        message.placeName!
      )},${message.latitude},${message.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        {!isOwnMessage && (
          <Avatar className="mr-2 h-8 w-8">
            <AvatarImage src={message.sender.image || undefined} />
            <AvatarFallback>{message.sender.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {!isOwnMessage && (
            <p className="mb-1 text-xs text-muted-foreground">{message.sender.name}</p>
          )}

          {/* 장소 공유 메시지 */}
          {hasLocation ? (
            <div
              className={`rounded-lg overflow-hidden border-2 ${isOwnMessage ? 'border-primary' : 'border-muted'
                }`}
            >
              {/* 지도 미리보기 */}
              <div
                className="cursor-pointer relative group"
                onClick={() => setShowMapModal(true)}
              >
                <KakaoMap
                  center={{
                    latitude: message.latitude!,
                    longitude: message.longitude!,
                  }}
                  level={3}
                  markers={[
                    {
                      latitude: message.latitude!,
                      longitude: message.longitude!,
                      title: message.placeName!,
                    },
                  ]}
                  height="150px"
                  className="pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>

              {/* 장소 정보 */}
              <div className="p-3 bg-background">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{message.placeName}</p>
                    {message.placeAddress && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.placeAddress}
                      </p>
                    )}
                  </div>
                </div>

                {/* Kakao 지도 앱으로 열기 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={openKakaoMap}
                >
                  <ExternalLink className="mr-2 h-3 w-3" />
                  {t('viewOnKakao')}
                </Button>
              </div>

              {/* 추가 메시지 */}
              {message.content.trim() && (
                <div className={`px-3 pb-3 pt-0`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            /* 일반 텍스트 메시지 */
            <div className="space-y-2">
              <div
                className={`rounded-lg px-4 py-2 ${isOwnMessage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* 번역 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTranslate}
                  disabled={translateMutation.isPending}
                  className={`flex items-center gap-1 text-xs transition-colors ${showTranslation
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                  aria-label="번역"
                >
                  {translateMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Languages className="h-3 w-3" />
                  )}
                </button>

                {/* 번역된 텍스트 */}
                {showTranslation && translatedText && (
                  <div
                    className={`flex-1 rounded-lg px-3 py-2 text-sm ${isOwnMessage
                      ? 'bg-primary/10 text-primary-foreground/80'
                      : 'bg-muted/50 text-muted-foreground'
                      }`}
                  >
                    <p className="whitespace-pre-wrap italic">{translatedText}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-muted-foreground">
            {format(new Date(message.createdAt), 'p', { locale: dateLocale })}
          </p>
        </div>

        {isOwnMessage && (
          <Avatar className="ml-2 h-8 w-8">
            <AvatarImage src={message.sender.image || undefined} />
            <AvatarFallback>{message.sender.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* 지도 확대 모달 */}
      {hasLocation && (
        <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{message.placeName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <KakaoMap
                center={{
                  latitude: message.latitude!,
                  longitude: message.longitude!,
                }}
                level={3}
                markers={[
                  {
                    latitude: message.latitude!,
                    longitude: message.longitude!,
                    title: message.placeName!,
                    content: message.placeAddress || undefined,
                  },
                ]}
                height="400px"
              />
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{message.placeName}</p>
                  {message.placeAddress && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {message.placeAddress}
                    </p>
                  )}
                </div>
              </div>
              <Button className="w-full" onClick={openKakaoMap}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {t('openInKakao')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

