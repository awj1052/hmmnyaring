/**
 * Kakao 장소 검색 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { loadKakaoMapScript } from '@/lib/kakao-map';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, MapPin } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export type PlaceSearchResult = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  phone?: string;
  category_name?: string;
  x: string; // longitude
  y: string; // latitude
};

type PlaceSearchProps = {
  onSelect: (place: PlaceSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function PlaceSearch({
  onSelect,
  placeholder = '장소를 검색하세요 (예: 성심당, 대전역)',
  autoFocus = false,
}: PlaceSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    loadKakaoMapScript().then(() => {
      setIsSDKLoaded(true);
    });
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!keyword.trim()) return;
    if (!isSDKLoaded || !window.kakao) return;

    setIsSearching(true);

    try {
      const ps = new window.kakao.maps.services.Places();

      ps.keywordSearch(keyword, (data: any, status: any) => {
        setIsSearching(false);

        if (status === window.kakao.maps.services.Status.OK) {
          setResults(data);
        } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
          setResults([]);
        } else {
          console.error('장소 검색 실패:', status);
          setResults([]);
        }
      });
    } catch (error) {
      console.error('검색 중 오류:', error);
      setIsSearching(false);
      setResults([]);
    }
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    onSelect(place);
    setKeyword('');
    setResults([]);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={!isSDKLoaded || isSearching}
        />
        <Button
          type="submit"
          disabled={!keyword.trim() || !isSDKLoaded || isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {results.length > 0 && (
        <ScrollArea className="h-[300px] rounded-md border">
          <div className="p-2 space-y-2">
            {results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {place.place_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {place.road_address_name || place.address_name}
                    </p>
                    {place.category_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {place.category_name.split('>').pop()?.trim()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      {keyword && results.length === 0 && !isSearching && (
        <p className="text-sm text-muted-foreground text-center py-4">
          검색 결과가 없습니다.
        </p>
      )}
    </div>
  );
}

