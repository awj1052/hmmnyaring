/**
 * 데이터베이스 시드 스크립트
 * 실행: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 테스트 유저 생성
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  console.log('✅ 유저 생성:', user.email);

  // 샘플 포스트 생성
  const posts = await prisma.post.createMany({
    data: [
      {
        title: '첫 번째 포스트',
        content: '해커톤 보일러플레이트 테스트 포스트입니다.',
        published: true,
        authorId: user.id,
      },
      {
        title: '두 번째 포스트 (비공개)',
        content: '아직 작성 중인 포스트입니다.',
        published: false,
        authorId: user.id,
      },
    ],
  });

  console.log(`✅ ${posts.count}개 포스트 생성`);
  console.log('🎉 시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

