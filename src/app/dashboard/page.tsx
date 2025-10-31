/**
 * 대시보드 페이지 (보호된 라우트)
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">안녕하세요, {session.user.name}님!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>시작하기</CardTitle>
            <CardDescription>보일러플레이트 사용법</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              이 템플릿은 Next.js, tRPC, Prisma를 사용합니다. 
              새 기능을 추가하려면 tRPC 라우터를 만들고 프론트엔드에서 호출하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle className="p-6">📝 포스트 관리</CardTitle>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              예제 CRUD 기능이 포함되어 있습니다. src/server/routers/post.ts를 확인하세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚀 빠른 배포</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vercel에 배포하고 DATABASE_URL 환경변수만 설정하면 바로 사용 가능합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

