# ✅ 해커톤 체크리스트

해커톤 시작 전과 개발 중 확인할 사항들입니다.

---

## 🎯 해커톤 시작 전 (D-1)

### 환경 설정
- [ ] `.env.local` 파일 생성 및 환경변수 설정
- [ ] PostgreSQL 데이터베이스 준비 (Supabase 추천)
- [ ] `pnpm install` 패키지 설치
- [ ] `pnpm db:push` DB 스키마 적용
- [ ] `pnpm db:seed` 시드 데이터 생성 (선택)
- [ ] `pnpm dev` 로컬 서버 실행 테스트
- [ ] 회원가입/로그인 테스트
- [ ] Prisma Studio 접속 확인 (`pnpm db:studio`)

### 팀 온보딩
- [ ] 팀원들에게 저장소 공유
- [ ] SETUP.md 가이드 공유
- [ ] 프로젝트 구조 설명 (README.md)
- [ ] 예제 코드 리뷰 (EXAMPLES.md)

### 배포 준비
- [ ] Vercel 계정 준비
- [ ] GitHub 저장소 생성
- [ ] 테스트 배포 진행 (선택)

---

## 🚀 해커톤 시작 후

### Day 1 - 기획 & 설계

#### 데이터 모델링
- [ ] 필요한 데이터 엔티티 파악
- [ ] `prisma/schema.prisma`에 모델 추가
- [ ] Relations(관계) 설정
- [ ] `pnpm db:push` 스키마 반영

#### API 설계
- [ ] 필요한 기능 리스트업
- [ ] 어떤 라우터가 필요한지 정리
- [ ] 퍼블릭 vs 보호된 엔드포인트 결정

#### UI 설계
- [ ] 주요 페이지 목록 작성
- [ ] 레이아웃 구조 결정
- [ ] 필요한 shadcn/ui 컴포넌트 파악

### Day 1-2 - 백엔드 개발

#### Prisma 모델 작성
```bash
# 1. schema.prisma 수정
# 2. 스키마 반영
pnpm db:push

# 3. Prisma Studio로 확인
pnpm db:studio
```

**체크리스트:**
- [ ] User와의 관계 설정 (authorId, userId 등)
- [ ] 인덱스 추가 (`@@index([userId])`)
- [ ] Cascade 설정 (`onDelete: Cascade`)
- [ ] 필수/선택 필드 결정 (`String` vs `String?`)

#### tRPC 라우터 작성

**새 라우터 생성 단계:**
1. [ ] `src/server/routers/[name].ts` 파일 생성
2. [ ] CRUD 작업 정의 (create, read, update, delete)
3. [ ] `_app.ts`에 라우터 등록
4. [ ] Zod 스키마로 입력 검증

**체크포인트:**
- [ ] `publicProcedure` vs `protectedProcedure` 선택
- [ ] 에러 처리 추가
- [ ] 권한 체크 (본인 데이터만 수정 가능하도록)

### Day 2 - 프론트엔드 개발

#### 페이지 생성
- [ ] `src/app/[route]/page.tsx` 파일 생성
- [ ] 서버 컴포넌트 vs 클라이언트 컴포넌트 결정
- [ ] 인증 필요 시 `await auth()` 체크

#### 컴포넌트 작성
```bash
# shadcn/ui 컴포넌트 추가
pnpm dlx shadcn@latest add [component-name]
```

**자주 사용하는 컴포넌트:**
- [ ] `button` - 버튼
- [ ] `input` - 입력 필드
- [ ] `card` - 카드 레이아웃
- [ ] `form` - 폼 처리
- [ ] `dialog` - 모달
- [ ] `table` - 테이블
- [ ] `select` - 드롭다운
- [ ] `textarea` - 텍스트 영역

#### tRPC 클라이언트 사용
- [ ] `'use client'` 지시어 추가
- [ ] `trpc.[router].[procedure].useQuery()` 쿼리
- [ ] `trpc.[router].[procedure].useMutation()` 뮤테이션
- [ ] 로딩 상태 처리
- [ ] 에러 처리
- [ ] `toast` 알림 추가

### Day 2-3 - 통합 & 테스트

#### 기능 테스트
- [ ] 회원가입 플로우
- [ ] 로그인 플로우
- [ ] CRUD 작업 (생성, 조회, 수정, 삭제)
- [ ] 권한 체크 (타인 데이터 접근 차단)
- [ ] 에러 시나리오 (잘못된 입력 등)

#### UI/UX 개선
- [ ] 로딩 스피너 추가
- [ ] 에러 메시지 표시
- [ ] 성공 알림 (toast)
- [ ] 반응형 디자인 확인 (모바일)
- [ ] 빈 상태(Empty State) 처리

#### 성능 최적화
- [ ] 이미지 최적화 (next/image 사용)
- [ ] 불필요한 리렌더링 방지
- [ ] React Query staleTime 설정

---

## 🎨 배포 전 체크

### 코드 정리
- [ ] 콘솔 로그 제거
- [ ] 사용하지 않는 import 제거
- [ ] `pnpm lint` 에러 없음
- [ ] TypeScript 에러 없음 (`pnpm build` 테스트)

### 환경변수 확인
- [ ] `.env.example` 업데이트
- [ ] Vercel 환경변수 설정
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `NEXT_PUBLIC_APP_URL`

### 배포
- [ ] GitHub에 push
- [ ] Vercel에서 자동 배포
- [ ] 프로덕션 환경 테스트
- [ ] 데이터베이스 마이그레이션 확인

---

## 🔧 자주 발생하는 문제

### Prisma Client 에러
```bash
pnpm db:generate
```

### tRPC 타입 에러
```bash
# 서버 재시작
# Ctrl+C 후 pnpm dev
```

### 세션 문제
- [ ] `NEXTAUTH_SECRET` 설정 확인
- [ ] 브라우저 쿠키 삭제 후 재로그인

### 데이터베이스 연결 실패
- [ ] `DATABASE_URL` 확인
- [ ] 데이터베이스 서버 실행 상태 확인
- [ ] IP 화이트리스트 설정 (클라우드 DB 사용 시)

---

## 💡 해커톤 꿀팁

### 시간 절약 패턴

1. **빠른 프로토타이핑**
   ```bash
   # 마이그레이션 파일 생성 대신 빠르게 반영
   pnpm db:push
   ```

2. **Prisma Studio 활용**
   ```bash
   # DB 직접 수정 (시드 데이터 대신)
   pnpm db:studio
   ```

3. **shadcn/ui 검색**
   ```
   https://ui.shadcn.com/docs/components/[component]
   ```

4. **AI 코드 생성 활용**
   - tRPC 라우터 반복 패턴 → ChatGPT/Copilot
   - Zod 스키마 자동 생성

### 우선순위

**우선 구현:**
- ✅ 핵심 기능 (MVP)
- ✅ 사용자 인증
- ✅ 기본 CRUD

**나중에:**
- ⏰ 복잡한 애니메이션
- ⏰ 세밀한 에러 처리
- ⏰ 성능 최적화

### 협업 전략

- **역할 분담:** 백엔드(Prisma/tRPC) vs 프론트엔드(페이지/컴포넌트)
- **Git 브랜치:** feature 브랜치 사용
- **PR 리뷰:** 간단하게, 빠르게
- **소통:** Discord/Slack 실시간 소통

---

## 🎯 데모 준비

### 발표 전
- [ ] 시연 계정 준비 (test@example.com)
- [ ] 샘플 데이터 준비
- [ ] 시연 시나리오 작성
- [ ] 배포 URL 확인
- [ ] 스크린샷/화면 녹화

### 발표 자료
- [ ] 프로젝트 소개
- [ ] 기술 스택 설명
- [ ] 핵심 기능 시연
- [ ] 향후 계획

---

**Good Luck! 🚀**

