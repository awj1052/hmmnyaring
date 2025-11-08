/**
 * Google 로그인 후 추가 정보 입력 폼
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, User, Loader2 } from 'lucide-react';
import { UserRole, Language, TourCategory } from '@prisma/client';
import { useTranslations, useLocale } from 'next-intl';

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

type CompleteProfileFormProps = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export function CompleteProfileForm({ user }: CompleteProfileFormProps) {
  const trpc = useTRPC();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const tComplete = useTranslations('complete');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.TRAVELER);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([Language.KOREAN]);
  const [selectedCategories, setSelectedCategories] = useState<TourCategory[]>([TourCategory.FOOD]);

  const LANGUAGES = getLanguages(t);
  const CATEGORIES = getCategories(t);

  const completeProfileMutation = useMutation(trpc.profile.completeProfile.mutationOptions());

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
      if (role === UserRole.GUIDE) {
        await completeProfileMutation.mutateAsync({
          role: UserRole.GUIDE,
          bio: formData.get('bio') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          languages: selectedLanguages,
          categories: selectedCategories,
        });
      } else {
        await completeProfileMutation.mutateAsync({
          role: UserRole.TRAVELER,
          nationality: formData.get('nationality') as string,
          interests: selectedCategories,
        });
      }

      toast.success(tComplete('success'), {
        description: tComplete('successDesc'),
      });

      // 페이지 새로고침하여 세션 업데이트 후 대시보드로 이동
      window.location.href = `/${locale}/dashboard`;
    } catch (error) {
      toast.error(tComplete('failed'), {
        description: error instanceof Error ? error.message : tComplete('error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{tComplete('title')}</CardTitle>
        <CardDescription>
          {tComplete('description', { name: user.name || '' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* 역할 선택 */}
          <div className="space-y-3">
            <Label>{t('auth.roleTitle')}</Label>
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={UserRole.TRAVELER} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('auth.roleTraveler')}
                </TabsTrigger>
                <TabsTrigger value={UserRole.GUIDE} className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('auth.roleGuide')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 역할별 추가 정보 */}
          {role === UserRole.GUIDE ? (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">{t('guide.info')}</h3>
              <div className="space-y-2">
                <Label htmlFor="bio">{t('guide.bio')}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder={t('guide.bioPlaceholder')}
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('guide.phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder={t('guide.phoneNumberPlaceholder')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('guide.languages')}</Label>
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
                <Label>{t('guide.categories')}</Label>
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
            </div>
          ) : (
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">{t('traveler.info')}</h3>
              <div className="space-y-2">
                <Label htmlFor="nationality">{t('traveler.nationality')}</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  type="text"
                  placeholder={t('traveler.nationalityPlaceholder')}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('traveler.interests')}</Label>
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
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tComplete('submit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

