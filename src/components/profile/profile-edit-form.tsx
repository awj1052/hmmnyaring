/**
 * 프로필 수정 폼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Language, TourCategory } from '@prisma/client';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: Language.KOREAN, label: '한국어' },
  { value: Language.ENGLISH, label: '영어' },
  { value: Language.JAPANESE, label: '일본어' },
  { value: Language.CHINESE, label: '중국어' },
  { value: Language.SPANISH, label: '스페인어' },
  { value: Language.FRENCH, label: '프랑스어' },
];

const CATEGORIES: { value: TourCategory; label: string }[] = [
  { value: TourCategory.FOOD, label: '맛집' },
  { value: TourCategory.CAFE, label: '카페' },
  { value: TourCategory.HISTORY, label: '역사/문화' },
  { value: TourCategory.NATURE, label: '자연' },
  { value: TourCategory.SHOPPING, label: '쇼핑' },
  { value: TourCategory.NIGHTLIFE, label: '나이트라이프' },
];

type ProfileEditFormProps = {
  user: {
    id: string;
    role: string;
    name: string | null;
    email: string | null;
    guideProfile?: {
      bio: string;
      phoneNumber: string | null;
      languages: string[];
      categories: string[];
      certifications: string[];
      availableDays: string[];
    } | null;
    travelerProfile?: {
      nationality: string | null;
      preferredLanguages: string[];
      interests: string[];
      visitStartDate: Date | null;
      visitEndDate: Date | null;
    } | null;
  };
};

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 가이드용 상태
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(
    (user.guideProfile?.languages || [Language.KOREAN]) as Language[]
  );
  const [selectedCategories, setSelectedCategories] = useState<TourCategory[]>(
    ((user.role === 'GUIDE'
      ? user.guideProfile?.categories
      : user.travelerProfile?.interests) || [TourCategory.FOOD]) as TourCategory[]
  );

  const updateGuideMutation = useMutation(trpc.profile.updateGuideProfile.mutationOptions());
  const updateTravelerMutation = useMutation(trpc.profile.updateTravelerProfile.mutationOptions());

  const toggleLanguage = (lang: Language) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleCategory = (cat: TourCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (user.role === 'GUIDE') {
        await updateGuideMutation.mutateAsync({
          bio: formData.get('bio') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          languages: selectedLanguages,
          categories: selectedCategories,
        });
      } else {
        await updateTravelerMutation.mutateAsync({
          nationality: formData.get('nationality') as string,
          interests: selectedCategories,
        });
      }

      toast.success('프로필이 업데이트되었습니다!');
      router.push('/profile');
      router.refresh();
    } catch (error) {
      toast.error('프로필 업데이트 실패', {
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.role === 'GUIDE' ? '가이드 정보' : '여행자 정보'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {user.role === 'GUIDE' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="여러분께 대전의 매력을 소개하고 싶습니다..."
                  rows={4}
                  defaultValue={user.guideProfile?.bio}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">연락처</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="010-1234-5678"
                  defaultValue={user.guideProfile?.phoneNumber || ''}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>가능한 언어</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <Badge
                      key={lang.value}
                      variant={selectedLanguages.includes(lang.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => !isLoading && toggleLanguage(lang.value)}
                    >
                      {lang.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>전문 분야</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => !isLoading && toggleCategory(cat.value)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="nationality">국적</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  type="text"
                  placeholder="대한민국"
                  defaultValue={user.travelerProfile?.nationality || ''}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>관심 분야</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.value}
                      variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => !isLoading && toggleCategory(cat.value)}
                    >
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/profile')}
              disabled={isLoading}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

