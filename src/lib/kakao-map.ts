/**
 * Kakao Maps SDK 로드 유틸리티
 */

import { clientEnv } from '@/env/client';

let isLoading = false;
let isLoaded = false;

/**
 * Kakao Maps SDK를 동적으로 로드합니다.
 * 이미 로드되었거나 로드 중이면 중복 로드하지 않습니다.
 */
export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (window.kakao?.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    // 로드 중
    if (isLoading) {
      // 로드 완료를 기다림
      const checkInterval = setInterval(() => {
        if (isLoaded && window.kakao?.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    isLoading = true;

    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${clientEnv.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
      script.async = true;

      script.onload = () => {
        if (window.kakao?.maps) {
          window.kakao.maps.load(() => {
            isLoaded = true;
            isLoading = false;
            resolve();
          });
        } else {
          isLoading = false;
          reject(new Error('Kakao Maps SDK를 로드할 수 없습니다.'));
        }
      };

      script.onerror = () => {
        isLoading = false;
        reject(new Error('Kakao Maps SDK 스크립트 로드 실패'));
      };

      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
}

/**
 * Kakao Maps가 로드되었는지 확인합니다.
 */
export function isKakaoMapLoaded(): boolean {
  return !!(window.kakao?.maps);
}

/**
 * 두 좌표 사이의 거리를 계산합니다 (미터 단위)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  if (!window.kakao?.maps) {
    throw new Error('Kakao Maps SDK가 로드되지 않았습니다.');
  }

  const pos1 = new window.kakao.maps.LatLng(lat1, lng1);
  const pos2 = new window.kakao.maps.LatLng(lat2, lng2);

  const polyline = new window.kakao.maps.Polyline({
    path: [pos1, pos2],
  });

  return polyline.getLength();
}

