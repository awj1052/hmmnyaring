/**
 * 헤더 컴포넌트
 */

import { auth } from '@/lib/auth';
import { UserMenu } from '@/components/auth/user-menu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Hackathon Starter
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                대시보드
              </Link>
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

