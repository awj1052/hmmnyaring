/**
 * 채팅에서 장소 공유 모달
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlaceSearch, PlaceSearchResult } from '@/components/map/PlaceSearch';
import { KakaoMap } from '@/components/map/KakaoMap';
import { MapPin, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

type ShareLocationModalProps = {
  onShare: (place: PlaceSearchResult) => void;
  children?: React.ReactNode;
};

export function ShareLocationModal({ onShare, children }: ShareLocationModalProps) {
  const t = useTranslations('shareLocation');
  const [open, setOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);

  const handleSelect = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
  };

  const handleShare = () => {
    if (selectedPlace) {
      onShare(selectedPlace);
      setOpen(false);
      setSelectedPlace(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedPlace(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <MapPin className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 장소 검색 */}
          <PlaceSearch onSelect={handleSelect} autoFocus />

          {/* 선택된 장소 미리보기 */}
          {selectedPlace && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedPlace.place_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPlace.road_address_name || selectedPlace.address_name}
                    </p>
                    {selectedPlace.category_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPlace.category_name.split('>').pop()?.trim()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 지도 미리보기 */}
              <KakaoMap
                center={{
                  latitude: parseFloat(selectedPlace.y),
                  longitude: parseFloat(selectedPlace.x),
                }}
                level={3}
                markers={[
                  {
                    latitude: parseFloat(selectedPlace.y),
                    longitude: parseFloat(selectedPlace.x),
                    title: selectedPlace.place_name,
                    content: selectedPlace.address_name,
                  },
                ]}
                height="300px"
              />

              {/* 공유 버튼 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t('share')}
                </Button>
              </div>
            </div>
          )}

          {!selectedPlace && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('searchPlaceholder')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

