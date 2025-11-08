/**
 * 가이드 프로필 카드 컴포넌트
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Languages, Award, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTRPC } from '@/lib/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type GuideProfileCardProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    guideProfile: {
      bio: string;
      languages: string[];
      categories: string[];
      certifications: string[];
      availableDays: string[];
      averageRating: number;
      totalTours: number;
      isVerified: boolean;
    } | null;
  };
};

const getLanguageMap = (t: (key: string) => string): Record<string, string> => ({
  KOREAN: t('language.korean'),
  ENGLISH: t('language.english'),
  JAPANESE: t('language.japanese'),
  CHINESE: t('language.chinese'),
  SPANISH: t('language.spanish'),
  FRENCH: t('language.french'),
});

const getCategoryMap = (t: (key: string) => string): Record<string, string> => ({
  FOOD: t('category.food'),
  CAFE: t('category.cafe'),
  HISTORY: t('category.history'),
  NATURE: t('category.nature'),
  SHOPPING: t('category.shopping'),
  NIGHTLIFE: t('category.nightlife'),
});

export function GuideProfileCard({ user }: GuideProfileCardProps) {
  const profile = user.guideProfile;
  const t = useTranslations();
  const tProfile = useTranslations('profileCard');
  const tCommon = useTranslations('common');

  const LANGUAGE_MAP = getLanguageMap(t);
  const CATEGORY_MAP = getCategoryMap(t);

  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const trpc = useTRPC();

  // 번역 mutation
  const translateMutation = useMutation({
    ...trpc.translation.translate.mutationOptions(),
    onSuccess: (data) => {
      setTranslatedBio(data.translatedText);
      setShowTranslation(true);
    },
    onError: (error) => {
      toast.error(tCommon('translateError'), {
        description: error.message || tCommon('translateErrorDesc'),
      });
    },
  });

  const handleTranslate = () => {
    if (translatedBio && showTranslation) {
      // 이미 번역되어 있으면 원문으로 토글
      setShowTranslation(false);
    } else if (translatedBio) {
      // 번역은 있지만 숨겨져 있으면 번역문 표시
      setShowTranslation(true);
    } else {
      // 번역이 없으면 API 호출
      translateMutation.mutate({ text: profile?.bio || '' });
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image || undefined} alt={user.name || ''} />
            <AvatarFallback>{user.name?.charAt(0) || 'G'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              {profile.isVerified && (
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{profile.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.totalTours} {tProfile('tours')}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
              {showTranslation && translatedBio ? translatedBio : profile.bio}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={translateMutation.isPending}
              className="shrink-0 h-8 w-8 p-0"
              title={showTranslation && translatedBio ? tCommon('original') : tCommon('translate')}
            >
              {translateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Languages className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{tProfile('languages')}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {profile.languages.map((lang) => (
                  <Badge key={lang} variant="secondary">
                    {LANGUAGE_MAP[lang] || lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{tProfile('categories')}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {profile.categories.map((cat) => (
                  <Badge key={cat} variant="outline">
                    {CATEGORY_MAP[cat] || cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {profile.certifications.length > 0 && (
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{tProfile('certifications')}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile.certifications.map((cert, i) => (
                    <Badge key={i} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

