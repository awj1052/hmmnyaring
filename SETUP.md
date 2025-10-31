# 🚀 빠른 시작 가이드

## 📋 사전 준비

- Node.js 18+ 설치
- pnpm 설치 (`npm install -g pnpm`)
- PostgreSQL 데이터베이스 (로컬 또는 클라우드)

## 🔧 초기 설정

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth Secret 생성
# 터미널에서 실행: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 데이터베이스 마이그레이션

```bash
# 개발 중: 빠른 스키마 반영 (마이그레이션 파일 생성 안 함)
pnpm db:push

# 또는: 마이그레이션 파일 생성
pnpm db:migrate
```

### 4. (선택) 시드 데이터 생성

```bash
pnpm db:seed
```

테스트 계정:
- 이메일: `test@example.com`
- 비밀번호: `password123`

### 5. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

---

## 📦 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 개발 서버 시작 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 실행 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:push` | DB 스키마 빠른 반영 |
| `pnpm db:migrate` | 마이그레이션 실행 |
| `pnpm db:studio` | Prisma Studio 실행 |
| `pnpm db:seed` | 시드 데이터 생성 |

---

## 🗄️ 데이터베이스 설정

### 로컬 PostgreSQL

```bash
# PostgreSQL 설치 (macOS)
brew install postgresql

# PostgreSQL 시작
brew services start postgresql

# 데이터베이스 생성
createdb hackathon_db

# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/hackathon_db?schema=public"
```

### Supabase (추천)

1. [Supabase](https://supabase.com) 가입
2. 새 프로젝트 생성
3. Settings > Database > Connection String (URI) 복사
4. `.env.local`에 `DATABASE_URL` 설정

### Railway / Neon / PlanetScale

각 서비스에서 PostgreSQL 인스턴스 생성 후 연결 문자열 사용

---

## 🔐 NextAuth Secret 생성

터미널에서 실행:

```bash
openssl rand -base64 32
```

생성된 값을 `.env.local`의 `NEXTAUTH_SECRET`에 입력

---

## ✅ 설정 확인

```bash
# Prisma Studio로 DB 확인
pnpm db:studio

# 개발 서버 실행
pnpm dev
```

- [ ] http://localhost:3000 접속 확인
- [ ] 회원가입 / 로그인 테스트
- [ ] 대시보드 접근 확인

---

## 🚨 문제 해결

### Prisma Client 에러

```bash
pnpm db:generate
```

### 마이그레이션 충돌

```bash
# 개발 환경: DB 리셋
pnpm prisma migrate reset
pnpm db:push
pnpm db:seed
```

### 포트 충돌

`.env.local`에 추가:
```env
PORT=3001
```

---

## 🎯 다음 단계

✅ [해커톤 체크리스트](./HACKATHON_CHECKLIST.md) 확인  
✅ [예제 코드](./EXAMPLES.md) 참고  
✅ [프로젝트 구조](./README.md#프로젝트-구조) 파악

