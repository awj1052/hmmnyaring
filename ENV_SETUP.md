# 🔐 환경변수 설정 가이드

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 복사하세요.

```env
# ===========================================
# DATABASE
# ===========================================

# PostgreSQL 연결 문자열
# 형식: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# 로컬 예시
DATABASE_URL="postgresql://postgres:password@localhost:5432/hackathon_db?schema=public"

# Supabase 예시 (추천)
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Railway 예시
# DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7891/railway"

# Neon 예시
# DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"


# ===========================================
# NEXTAUTH
# ===========================================

# NextAuth Secret Key
# 생성 방법: 터미널에서 아래 명령어 실행
# openssl rand -base64 32
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# NextAuth URL (로컬 개발)
NEXTAUTH_URL="http://localhost:3000"

# Production (배포 후 변경)
# NEXTAUTH_URL="https://yourapp.vercel.app"


# ===========================================
# APPLICATION
# ===========================================

# 앱 공개 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production
# NEXT_PUBLIC_APP_URL="https://yourapp.vercel.app"


# ===========================================
# OPTIONAL: 추가 OAuth Providers (선택사항)
# ===========================================

# Google OAuth (사용 시)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (사용 시)
# GITHUB_ID="your-github-client-id"
# GITHUB_SECRET="your-github-client-secret"

```

---

## 📝 환경변수 설명

### DATABASE_URL
PostgreSQL 데이터베이스 연결 문자열입니다.

**로컬 설정:**
```bash
# PostgreSQL 설치 (macOS)
brew install postgresql
brew services start postgresql

# 데이터베이스 생성
createdb hackathon_db

# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/hackathon_db?schema=public"
```

**클라우드 데이터베이스 (추천):**
- [Supabase](https://supabase.com) - 무료 PostgreSQL
- [Neon](https://neon.tech) - 서버리스 PostgreSQL
- [Railway](https://railway.app) - 간편한 배포

### NEXTAUTH_SECRET
NextAuth 세션 암호화에 사용되는 비밀 키입니다.

**생성 방법:**
```bash
openssl rand -base64 32
```

출력된 값을 복사하여 `NEXTAUTH_SECRET`에 붙여넣으세요.

### NEXTAUTH_URL
애플리케이션의 기본 URL입니다.

- 로컬: `http://localhost:3000`
- 프로덕션: `https://yourapp.vercel.app`

### NEXT_PUBLIC_APP_URL
클라이언트 사이드에서 접근 가능한 앱 URL입니다.

`NEXT_PUBLIC_` 접두사가 있어 브라우저에서도 접근 가능합니다.

---

## ✅ 설정 확인

`.env.local` 파일 생성 후:

```bash
# 1. 패키지 설치
pnpm install

# 2. Prisma Client 생성
pnpm db:generate

# 3. 데이터베이스 스키마 적용
pnpm db:push

# 4. (선택) 시드 데이터 생성
pnpm db:seed

# 5. 개발 서버 실행
pnpm dev
```

브라우저에서 http://localhost:3000 접속하여 확인!

---

## 🚨 문제 해결

### DATABASE_URL 연결 실패
- [ ] 데이터베이스 서버가 실행 중인지 확인
- [ ] 사용자명/비밀번호가 올바른지 확인
- [ ] 포트 번호가 맞는지 확인 (기본: 5432)
- [ ] 클라우드 DB의 경우 IP 화이트리스트 확인

### NEXTAUTH_SECRET 관련 에러
```
[next-auth][error][NO_SECRET]
```
→ `.env.local`에 `NEXTAUTH_SECRET`이 설정되었는지 확인

### 환경변수가 인식되지 않음
- 개발 서버 재시작 (`Ctrl+C` 후 `pnpm dev`)
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 파일명이 정확히 `.env.local`인지 확인 (`.env` 아님)

---

## 🌐 Vercel 배포 시 환경변수

Vercel 대시보드에서 설정:

1. 프로젝트 선택
2. Settings > Environment Variables
3. 다음 변수 추가:

```
DATABASE_URL = postgresql://...
NEXTAUTH_SECRET = your-secret-here
NEXTAUTH_URL = https://yourapp.vercel.app
NEXT_PUBLIC_APP_URL = https://yourapp.vercel.app
```

**주의:** Production과 Preview 환경에 각각 설정 필요!

---

더 자세한 내용은 [SETUP.md](./SETUP.md)를 참고하세요.

