/**
 * 경로 표시 지도 컴포넌트
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript } from '@/lib/kakao-map';
import { Loader2 } from 'lucide-react';

type RoutePoint = {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
};

type RouteMapProps = {
  points: RoutePoint[];
  height?: string;
  className?: string;
  showPolyline?: boolean;
};

export function RouteMap({
  points,
  height = '400px',
  className = '',
  showPolyline = true,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await loadKakaoMapScript();

        const { kakao } = window;
        if (!kakao?.maps) {
          throw new Error('Kakao Maps API를 로드할 수 없습니다.');
        }

        // 지도 중심 계산 (첫 번째 지점)
        const mapOption = {
          center: new kakao.maps.LatLng(points[0].latitude, points[0].longitude),
          level: 5,
        };

        const map = new kakao.maps.Map(mapRef.current!, mapOption);
        mapInstanceRef.current = map;

        // 마커 추가
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const linePath: any[] = [];

        points.forEach((point, index) => {
          const position = new kakao.maps.LatLng(point.latitude, point.longitude);
          linePath.push(position);

          // 마커 생성
          const marker = new kakao.maps.Marker({
            position: position,
            map: map,
          });

          // 인포윈도우 생성
          const content = `
            <div style="padding:10px;min-width:150px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <span style="
                  display:inline-block;
                  width:24px;
                  height:24px;
                  background:#FF6B3D;
                  color:white;
                  border-radius:50%;
                  text-align:center;
                  line-height:24px;
                  font-weight:bold;
                  font-size:12px;
                ">${index + 1}</span>
                <strong>${point.name}</strong>
              </div>
              ${point.address ? `<p style="margin:0;font-size:12px;color:#666;">${point.address}</p>` : ''}
            </div>
          `;

          const infowindow = new kakao.maps.InfoWindow({
            content: content,
          });

          // 마커 클릭 이벤트
          kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
          });

          // 첫 번째 마커는 기본적으로 인포윈도우 열기
          if (index === 0) {
            infowindow.open(map, marker);
          }

          markersRef.current.push(marker);
        });

        // Polyline으로 경로 연결
        if (showPolyline && points.length > 1) {
          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: '#FF6B3D',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          });

          polyline.setMap(map);
          polylineRef.current = polyline;
        }

        // 모든 지점이 보이도록 지도 범위 조정
        if (points.length > 1) {
          const bounds = new kakao.maps.LatLngBounds();
          points.forEach((point) => {
            bounds.extend(new kakao.maps.LatLng(point.latitude, point.longitude));
          });
          map.setBounds(bounds);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Route Map 초기화 실패:', err);
        setError('지도를 불러올 수 없습니다.');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      // 정리
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [points, showPolyline]);

  if (points.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">표시할 경로가 없습니다.</p>
      </div>
    );
  }

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
      
      {/* 경로 정보 */}
      {!isLoading && points.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm font-medium">
            총 {points.length}개 장소
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {points[0].name} → {points[points.length - 1].name}
          </p>
        </div>
      )}
    </div>
  );
}

