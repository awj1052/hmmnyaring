/**
 * 로그인 페이지
 */

import { LoginForm } from '@/components/auth/login-form';
import { auth } from '@/lib/auth';
import { redirect as nextRedirect } from 'next/navigation';
import { Compass } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function LoginPage() {
  const session = await auth();
  const t = await getTranslations('auth');
  const locale = await getLocale();

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (session) {
    nextRedirect(`/${locale}/dashboard`);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 gradient-hero">
      <div className="w-full max-w-md space-y-8">
        {/* 로고 */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="h-12 w-12 rounded-full gradient-travel flex items-center justify-center transform transition-transform group-hover:rotate-12">
              <Compass className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            {t('loginTitle')}
          </h1>
          <p className="text-muted-foreground">{t('loginSubtitle')}</p>
        </div>

        {/* 로그인 폼 */}
        <div className="glass rounded-2xl p-8 shadow-xl border-2">
          <LoginForm />
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
            {t('register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

