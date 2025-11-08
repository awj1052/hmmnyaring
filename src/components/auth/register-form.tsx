/**
 * 회원가입 폼 컴포넌트
 */

'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, User } from 'lucide-react';
import { UserRole, Language, TourCategory } from '@prisma/client';
import { useTranslations } from 'next-intl';

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

export function RegisterForm() {
  const trpc = useTRPC();
  const router = useRouter();
  const t = useTranslations();
  const tAuth = useTranslations('auth');

  const LANGUAGES = getLanguages(t);
  const CATEGORIES = getCategories(t);

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.TRAVELER);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([Language.KOREAN]);
  const [selectedCategories, setSelectedCategories] = useState<TourCategory[]>([TourCategory.FOOD]);
  const registerMutation = useMutation(trpc.user.register.mutationOptions());

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

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const { signIn } = await import('next-auth/react');
      // 미들웨어가 자동으로 프로필 없는 사용자를 /register/complete로 리다이렉트
      await signIn('google');
    } catch {
      toast.error(tAuth('googleSignInFailed'));
      setIsLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      if (role === UserRole.GUIDE) {
        await registerMutation.mutateAsync({
          email,
          password,
          name,
          role: UserRole.GUIDE,
          bio: formData.get('bio') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          languages: selectedLanguages,
          categories: selectedCategories,
        });
      } else {
        await registerMutation.mutateAsync({
          email,
          password,
          name,
          role: UserRole.TRAVELER,
          nationality: formData.get('nationality') as string,
          interests: selectedCategories,
        });
      }

      toast.success(tAuth('registerSuccess'), {
        description: tAuth('registerSuccessDesc'),
      });

      router.push('/login');
    } catch (error) {
      toast.error(tAuth('registerFailed'), {
        description: error instanceof Error ? error.message : tAuth('error'),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-2">
        <h2 className="text-2xl font-bold">{tAuth('registerFormTitle')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{tAuth('registerFormSubtitle')}</p>
      </div>

      {/* Google 회원가입 */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 hover:bg-primary/5 hover:border-primary"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {tAuth('googleSignUp')}
      </Button>

      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{tAuth('or')}</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* 역할 선택 */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">{tAuth('roleTitle')}</Label>
          <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value={UserRole.TRAVELER} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {tAuth('roleTraveler')}
              </TabsTrigger>
              <TabsTrigger value={UserRole.GUIDE} className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {tAuth('roleGuide')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tAuth('name')}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={tAuth('namePlaceholder')}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{tAuth('email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={tAuth('emailPlaceholder')}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{tAuth('password')}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={tAuth('passwordPlaceholder')}
              required
              minLength={6}
              disabled={isLoading}
              className="h-11"
            />
          </div>
        </div>

        {/* 역할별 추가 정보 */}
        {role === UserRole.GUIDE ? (
          <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {t('guide.info')}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="bio">{t('guide.bio')}</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder={t('guide.bioPlaceholder')}
                rows={3}
                disabled={isLoading}
                className="resize-none"
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
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('guide.languages')}</Label>
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
            <div className="space-y-2">
              <Label>{t('guide.categories')}</Label>
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
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border-2 border-secondary/20 bg-secondary/5 p-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-secondary" />
              {t('traveler.info')}
            </h3>
            <div className="space-y-2">
              <Label htmlFor="nationality">{t('traveler.nationality')}</Label>
              <Input
                id="nationality"
                name="nationality"
                type="text"
                placeholder={t('traveler.nationalityPlaceholder')}
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('traveler.interests')}</Label>
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
          </div>
        )}

        <Button type="submit" className="w-full h-11 gradient-travel text-white border-0" disabled={isLoading}>
          {isLoading ? tAuth('signingUp') : tAuth('register')}
        </Button>
      </form>
    </div>
  );
}

