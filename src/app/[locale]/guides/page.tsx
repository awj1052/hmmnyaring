/**
 * 가이드 검색 페이지
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Languages, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Language, TourCategory } from '@prisma/client';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

type SortBy = 'rating' | 'tours' | 'recent';

const getLanguages = (t: (key: string) => string): { value: Language; label: string }[] => [
  { value: Language.KOREAN, label: t('language.korean') },
  { value: Language.ENGLISH, label: t('language.english') },
  { value: Language.JAPANESE, label: t('language.japanese') },
  { value: Language.CHINESE, label: t('language.chinese') },
  { value: Language.SPANISH, label: t('language.spanish') },
  { value: Language.FRENCH, label: t('language.french') },
];

const getCategories = (t: (key: string) => string): { value: TourCategory; label: string }[] => [
  { value: TourCategory.FOOD, label: t('category.food') },
  { value: TourCategory.CAFE, label: t('category.cafe') },
  { value: TourCategory.HISTORY, label: t('category.history') },
  { value: TourCategory.NATURE, label: t('category.nature') },
  { value: TourCategory.SHOPPING, label: t('category.shopping') },
  { value: TourCategory.NIGHTLIFE, label: t('category.nightlife') },
];

const getSortOptions = (t: (key: string) => string): { value: SortBy; label: string }[] => [
  { value: 'rating', label: t('guides.sortRating') },
  { value: 'tours', label: t('guides.sortTours') },
  { value: 'recent', label: t('guides.sortRecent') },
];

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

export default function GuidesPage() {
  const trpc = useTRPC();
  const t = useTranslations();
  const tGuides = useTranslations('guides');
  const tCommon = useTranslations('common');

  const LANGUAGES = getLanguages(t);
  const CATEGORIES = getCategories(t);
  const SORT_OPTIONS = getSortOptions(t);
  const LANGUAGE_MAP = getLanguageMap(t);
  const CATEGORY_MAP = getCategoryMap(t);

  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<TourCategory[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('rating');

  // 번역 상태 관리 (가이드 ID별)
  const [translatedBios, setTranslatedBios] = useState<Record<string, string>>({});
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [translatingGuideId, setTranslatingGuideId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    ...trpc.guide.getAll.queryOptions({
      languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sortBy,
      limit: 20,
    }),
    staleTime: 30000, // 30초
  });

  // 번역 mutation
  const translateMutation = useMutation({
    ...trpc.translation.translate.mutationOptions(),
    onSuccess: (data, variables) => {
      const guideId = translatingGuideId;
      if (guideId) {
        setTranslatedBios((prev) => ({ ...prev, [guideId]: data.translatedText }));
        setShowTranslations((prev) => ({ ...prev, [guideId]: true }));
      }
      setTranslatingGuideId(null);
    },
    onError: (error) => {
      toast.error(t('common.translateError'), {
        description: error.message || t('common.translateErrorDesc'),
      });
      setTranslatingGuideId(null);
    },
  });

  const handleTranslate = (guideId: string, bio: string) => {
    const hasTranslation = translatedBios[guideId];
    const isShowingTranslation = showTranslations[guideId];

    if (hasTranslation && isShowingTranslation) {
      // 번역 보이는 중 -> 원문으로
      setShowTranslations((prev) => ({ ...prev, [guideId]: false }));
    } else if (hasTranslation) {
      // 번역 있지만 숨김 -> 번역 보이기
      setShowTranslations((prev) => ({ ...prev, [guideId]: true }));
    } else {
      // 번역 없음 -> API 호출
      setTranslatingGuideId(guideId);
      translateMutation.mutate({ text: bio });
    }
  };

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

  const allGuides = data?.guides ?? [];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto max-w-7xl space-y-8 py-12 px-4">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            {tGuides('title')}
          </h1>
          <p className="text-lg text-muted-foreground">{tGuides('subtitle')}</p>
        </div>

        {/* 필터 */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              {tGuides('filterTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Languages className="h-4 w-4 text-secondary" />
                {tGuides('filterLanguage')}
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Badge
                    key={lang.value}
                    variant={selectedLanguages.includes(lang.value) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleLanguage(lang.value)}
                  >
                    {lang.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                {tGuides('filterCategory')}
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.value}
                    variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => toggleCategory(cat.value)}
                  >
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">{tGuides('filterSort')}</p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 가이드 리스트 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                <span>{tGuides('count', { count: allGuides.length })}</span>
              )}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // 로딩 스켈레톤
              [...Array(6)].map((_, i) => (
                <Card key={i} className="border-2">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-20 w-20 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : allGuides.length === 0 ? (
              <div className="col-span-full">
                <Card className="border-2 border-dashed">
                  <CardContent className="text-center py-16">
                    <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold mb-2">{tGuides('noGuides')}</p>
                    <p className="text-sm text-muted-foreground">{tGuides('noGuidesDesc')}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              allGuides.map((guide: {
                id: string;
                name: string | null;
                image: string | null;
                guideProfile: {
                  averageRating: number;
                  totalTours: number;
                  bio: string;
                  languages: string[];
                  categories: string[];
                } | null;
              }) => (
                <Card key={guide.id} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-20 w-20 border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                        <AvatarImage src={guide.image || undefined} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-travel text-white">
                          {guide.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{guide.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-accent">
                            <Star className="h-4 w-4 fill-accent" />
                            <span className="font-semibold">{guide.guideProfile?.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-primary">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{guide.guideProfile?.totalTours} {tGuides('tours')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex-1 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {showTranslations[guide.id] && translatedBios[guide.id]
                          ? translatedBios[guide.id]
                          : guide.guideProfile?.bio}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslate(guide.id, guide.guideProfile?.bio || '')}
                        disabled={translatingGuideId === guide.id}
                        className="shrink-0 h-8 w-8 p-0"
                        title={showTranslations[guide.id] && translatedBios[guide.id] ? t('common.original') : t('common.translate')}
                      >
                        {translatingGuideId === guide.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Languages className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Languages className="h-4 w-4 text-secondary mt-1 shrink-0" />
                        <div className="flex flex-wrap gap-1.5">
                          {guide.guideProfile?.languages.slice(0, 3).map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="text-xs font-medium">
                              {LANGUAGE_MAP[lang]}
                            </Badge>
                          ))}
                          {(guide.guideProfile?.languages.length ?? 0) > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(guide.guideProfile?.languages.length ?? 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {guide.guideProfile?.categories.slice(0, 3).map((cat: string) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {CATEGORY_MAP[cat]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full gradient-travel text-white border-0 hover:opacity-90" asChild>
                      <Link href={`/profile/${guide.id}`}>{tCommon('profileView')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

