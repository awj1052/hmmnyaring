/**
 * 기본 Kakao Map 컴포넌트
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '@/lib/kakao-map';
import { Loader2 } from 'lucide-react';

type Marker = {
  latitude: number;
  longitude: number;
  title?: string;
  content?: string;
};

type KakaoMapProps = {
  center: {
    latitude: number;
    longitude: number;
  };
  level?: number; // 1-14 (작을수록 확대)
  markers?: Marker[];
  onMarkerClick?: (marker: Marker) => void;
  height?: string;
  className?: string;
};

export function KakaoMap({
  center,
  level = 3,
  markers = [],
  onMarkerClick,
  height = '400px',
  className = '',
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Kakao Maps SDK 로드
        await loadKakaoMapScript();

        const { kakao } = window;
        if (!kakao?.maps) {
          throw new Error('Kakao Maps API를 로드할 수 없습니다.');
        }

        // 지도 생성
        const mapOption = {
          center: new kakao.maps.LatLng(center.latitude, center.longitude),
          level: level,
        };

        const map = new kakao.maps.Map(mapRef.current!, mapOption);
        mapInstanceRef.current = map;

        setIsLoading(false);
      } catch (err) {
        console.error('Kakao Map 초기화 실패:', err);
        setError('지도를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [center.latitude, center.longitude, level]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao) return;

    const { kakao } = window;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    markers.forEach((markerData) => {
      const markerPosition = new kakao.maps.LatLng(
        markerData.latitude,
        markerData.longitude
      );

      const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: mapInstanceRef.current,
      });

      // 마커 클릭 이벤트
      if (markerData.title || markerData.content) {
        const infowindow = new kakao.maps.InfoWindow({
          content: `
            <div style="padding:10px;min-width:150px;">
              ${markerData.title ? `<strong>${markerData.title}</strong>` : ''}
              ${markerData.content ? `<p style="margin:5px 0 0 0;font-size:12px;">${markerData.content}</p>` : ''}
            </div>
          `,
        });

        kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(mapInstanceRef.current, marker);
          onMarkerClick?.(markerData);
        });
      } else if (onMarkerClick) {
        kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(markerData);
        });
      }

      markersRef.current.push(marker);
    });

    // 마커가 여러 개면 모든 마커가 보이도록 지도 범위 조정
    if (markers.length > 1) {
      const bounds = new kakao.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend(new kakao.maps.LatLng(marker.latitude, marker.longitude));
      });
      mapInstanceRef.current.setBounds(bounds);
    }
  }, [markers, onMarkerClick]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}

