# 🎯 TravelMate Daejeon 구현 계획

## 🛠️ 확정된 기술 스택

### 📦 코어 프레임워크 (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **Next.js** | 16.0.1 | React 프레임워크 (App Router) | ✅ 설치됨 |
| **React** | 19.2.0 | UI 라이브러리 | ✅ 설치됨 |
| **TypeScript** | 5.9.3 | 타입 안전성 | ✅ 설치됨 |

### 🔐 인증 & 보안 (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **NextAuth.js** | 5.0.0-beta.30 | 세션 기반 인증 | ✅ 설치됨 |
| **bcryptjs** | 3.0.2 | 비밀번호 해싱 | ✅ 설치됨 |
| **@auth/prisma-adapter** | 2.11.1 | Prisma 연동 | ✅ 설치됨 |

### 🗄️ 데이터베이스 & ORM (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **Prisma** | 6.19.0 | PostgreSQL ORM | ✅ 설치됨 |
| **@prisma/client** | 6.19.0 | 타입 안전 DB 클라이언트 | ✅ 설치됨 |

### 🌐 API & 상태 관리 (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **tRPC** | 11.7.1 | End-to-End 타입 안전 API | ✅ 설치됨 |
| **@tanstack/react-query** | 5.90.7 | 서버 상태 관리 | ✅ 설치됨 |
| **superjson** | 2.2.5 | 직렬화 (Date, Map 지원) | ✅ 설치됨 |
| **Zod** | 4.1.12 | 스키마 검증 | ✅ 설치됨 |

### 🎨 UI & 스타일링 (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **Tailwind CSS** | v4 | 유틸리티 CSS | ✅ 설치됨 |
| **shadcn/ui** | latest | React 컴포넌트 라이브러리 | ✅ 설치됨 |
| **Radix UI** | - | Headless UI 컴포넌트 | ✅ 설치됨 |
| **next-themes** | 0.4.6 | 다크모드 지원 | ✅ 설치됨 |
| **sonner** | 2.0.7 | Toast 알림 | ✅ 설치됨 |

### 📱 폼 & 검증 (기구현)
| 기술 | 버전 | 용도 | 상태 |
|------|------|------|------|
| **react-hook-form** | 7.65.0 | 폼 상태 관리 | ✅ 설치됨 |
| **@hookform/resolvers** | 5.2.2 | Zod 연동 | ✅ 설치됨 |

### 🚀 추가 설치 필요
| 기술 | 버전 | 용도 | 우선순위 |
|------|------|------|----------|
| **uploadthing** | latest | 파일 업로드 (가이드 인증서) | SHOULD |
| **date-fns** | latest | 날짜 처리 | MUST |
| **lucide-react** | latest | 아이콘 | MUST |
| **react-kakao-maps-sdk** | latest | Kakao Map 연동 | SHOULD |
| **pusher-js** | latest | 실시간 채팅 (옵션) | COULD |
| **pusher** | latest | Pusher 서버 (옵션) | COULD |

### 🌍 외부 API
| API | 용도 | 비용 | 상태 |
|-----|------|------|------|
| **Kakao Maps API** | 지도 & 위치 검색 | 무료 (일일 한도 있음) | 🔜 API 키 필요 |
| **UploadThing** | 파일 저장소 | 무료 플랜 (1GB) | 🔜 가입 필요 |
| **Pusher** | 실시간 메시징 (선택) | 무료 플랜 (100 동시접속) | ⚠️ 선택 사항 |

---

## 📊 현황 분석

### ✅ 보일러플레이트 기구현 사항
- ✅ **Next.js 16** + App Router + React 19
- ✅ **NextAuth v5** 인증 시스템 (로그인/회원가입)
- ✅ **tRPC 11** + TanStack Query 5
- ✅ **Prisma 6.19** ORM + PostgreSQL
- ✅ **Tailwind CSS v4** + shadcn/ui
- ✅ 기본 레이아웃 및 페이지 구조
- ✅ 환경변수 검증 (Zod)
- ✅ TypeScript 5.9 설정
- ✅ Toast 알림 (sonner)
- ✅ React Hook Form

### 🚧 구현 필요 사항
- **역할 기반 회원가입** (가이드/여행자 분리)
- **프로필 시스템** (가이드/여행자별 다른 필드)
- **매칭 시스템** (조건 기반 필터링 + AI 매칭 알고리즘)
- **실시간 채팅** (매칭 후 대화)
- **지도 연동** (Kakao Map API)
- **리뷰 시스템** (투어 완료 후 평가)
- **투어 관리** (요청/수락/거절/완료)
- **대시보드** (역할별 다른 UI)
- **모바일 화면** (이용자 대부분이 모바일을 사용할것으로 예상)

---

## 🗓️ 3일 개발 일정

### Day 1: 데이터베이스 & 인증 확장 (8시간)
**목표:** 역할 기반 인증 + 프로필 시스템 완성

#### 1.1 Prisma 스키마 설계 (1.5시간)
**파일:** `prisma/schema.prisma`

```prisma
enum UserRole {
  TRAVELER  // 여행자
  GUIDE     // 가이드
  ADMIN     // 관리자
}

enum Language {
  KOREAN
  ENGLISH
  JAPANESE
  CHINESE
  SPANISH
  FRENCH
}

enum TourCategory {
  FOOD       // 맛집
  CAFE       // 카페
  HISTORY    // 역사/문화
  NATURE     // 자연
  SHOPPING   // 쇼핑
  NIGHTLIFE  // 나이트라이프
}

enum TourRequestStatus {
  PENDING   // 대기중
  ACCEPTED  // 수락됨
  REJECTED  // 거절됨
  COMPLETED // 완료됨
  CANCELLED // 취소됨
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String
  role          UserRole  @default(TRAVELER)
  emailVerified DateTime?
  image         String?
  
  // 프로필 관계
  guideProfile    GuideProfile?
  travelerProfile TravelerProfile?
  
  // 활동 관계
  sentRequests     TourRequest[] @relation("TravelerRequests")
  receivedRequests TourRequest[] @relation("GuideRequests")
  sentMessages     Message[]
  sentReviews      Review[]      @relation("ReviewAuthor")
  receivedReviews  Review[]      @relation("ReviewReceiver")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([email])
  @@index([role])
}

model GuideProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 기본 정보
  bio         String   @db.Text
  phoneNumber String?
  
  // 전문 분야
  languages      Language[]
  categories     TourCategory[]
  certifications String[]  // ["JLPT N2", "TOEIC 900+"]
  
  // 활동 정보
  availableDays  String[]  // ["Monday", "Wednesday", "Friday"]
  isVerified     Boolean   @default(false)
  verificationDoc String?  // 인증서 URL
  
  // 통계
  totalTours     Int      @default(0)
  averageRating  Float    @default(0.0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

model TravelerProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 선호 정보
  preferredLanguages Language[]
  interests          TourCategory[]
  
  // 여행 정보
  visitStartDate DateTime?
  visitEndDate   DateTime?
  nationality    String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

model TourRequest {
  id       String             @id @default(cuid())
  status   TourRequestStatus  @default(PENDING)
  
  // 관계
  travelerId String
  traveler   User   @relation("TravelerRequests", fields: [travelerId], references: [id], onDelete: Cascade)
  
  guideId    String
  guide      User   @relation("GuideRequests", fields: [guideId], references: [id], onDelete: Cascade)
  
  // 투어 정보
  requestedDate DateTime
  message       String   @db.Text
  category      TourCategory
  isOnline      Boolean  @default(false)  // 비대면 투어 여부
  
  // 채팅방
  chatRoom   ChatRoom?
  
  // 리뷰
  review     Review?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([travelerId])
  @@index([guideId])
  @@index([status])
}

model ChatRoom {
  id            String   @id @default(cuid())
  tourRequestId String   @unique
  tourRequest   TourRequest @relation(fields: [tourRequestId], references: [id], onDelete: Cascade)
  
  messages   Message[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tourRequestId])
}

model Message {
  id         String   @id @default(cuid())
  content    String   @db.Text
  
  senderId   String
  sender     User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  chatRoomId String
  chatRoom   ChatRoom @relation(fields: [chatRoomId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([chatRoomId])
  @@index([senderId])
}

model Review {
  id            String   @id @default(cuid())
  rating        Int      // 1-5
  comment       String   @db.Text
  
  tourRequestId String   @unique
  tourRequest   TourRequest @relation(fields: [tourRequestId], references: [id], onDelete: Cascade)
  
  authorId      String
  author        User     @relation("ReviewAuthor", fields: [authorId], references: [id], onDelete: Cascade)
  
  receiverId    String
  receiver      User     @relation("ReviewReceiver", fields: [receiverId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tourRequestId])
  @@index([authorId])
  @@index([receiverId])
}

model TourLocation {
  id          String   @id @default(cuid())
  name        String
  description String   @db.Text
  category    TourCategory
  
  // 위치 정보 (Kakao Map)
  latitude    Float
  longitude   Float
  address     String
  placeId     String?  // Kakao Place ID
  
  // 이미지
  imageUrl    String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([category])
}
```

**작업:**
- [ ] 위 스키마를 `prisma/schema.prisma`에 추가
- [ ] `pnpm db:push` 실행
- [ ] Prisma Client 재생성

#### 1.2 회원가입 플로우 수정 (2시간)
**파일:**
- `src/app/register/page.tsx`
- `src/server/routers/auth.ts` (신규)
- `src/lib/schemas/auth.ts` (Zod 스키마)

**작업:**
1. 회원가입 시 역할 선택 추가 (가이드/여행자)
2. 역할별 추가 정보 입력 폼
   - 가이드: 언어, 전문분야, 자기소개
   - 여행자: 관심사, 선호 언어, 방문 기간
3. NextAuth 설정에 role 추가
4. 회원가입 후 자동으로 프로필 생성

#### 1.3 프로필 페이지 구현 (2.5시간)
**파일:**
- `src/app/profile/page.tsx` (본인 프로필)
- `src/app/profile/[userId]/page.tsx` (다른 사람 프로필 보기)
- `src/app/profile/edit/page.tsx` (프로필 수정)
- `src/server/routers/profile.ts` (신규)
- `src/components/profile/` (프로필 컴포넌트들)

**컴포넌트:**
- `GuideProfileCard.tsx` - 가이드 프로필 카드
- `TravelerProfileCard.tsx` - 여행자 프로필 카드
- `ProfileEditForm.tsx` - 프로필 수정 폼
- `LanguageBadge.tsx` - 언어 배지
- `CategoryBadge.tsx` - 카테고리 배지

**tRPC 프로시저:**
- `profile.getMyProfile` - 내 프로필 조회
- `profile.getById` - 특정 사용자 프로필 조회
- `profile.updateGuideProfile` - 가이드 프로필 수정
- `profile.updateTravelerProfile` - 여행자 프로필 수정
- `profile.uploadVerification` - 가이드 인증서 업로드

#### 1.4 대시보드 역할별 분기 (2시간)
**파일:**
- `src/app/dashboard/page.tsx` (역할 감지 후 리다이렉트)
- `src/app/dashboard/guide/page.tsx` (가이드 대시보드)
- `src/app/dashboard/traveler/page.tsx` (여행자 대시보드)
- `src/components/dashboard/` (대시보드 컴포넌트들)

**가이드 대시보드:**
- 받은 매칭 요청 리스트
- 진행 중인 투어
- 평균 평점 + 총 투어 수
- 최근 리뷰

**여행자 대시보드:**
- 보낸 매칭 요청 상태
- 예정된 투어
- 찜한 가이드 (COULD)
- 내 리뷰 목록

---

### Day 2: 매칭 & 채팅 시스템 (10시간)

#### 2.1 가이드 검색 & 필터링 (3시간)
**파일:**
- `src/app/guides/page.tsx` (가이드 리스트)
- `src/app/guides/[guideId]/page.tsx` (가이드 상세)
- `src/server/routers/guide.ts` (신규)
- `src/components/guides/` (가이드 관련 컴포넌트)

**컴포넌트:**
- `GuideCard.tsx` - 가이드 카드 (사진, 이름, 언어, 카테고리, 평점)
- `GuideList.tsx` - 가이드 리스트 + 페이지네이션
- `GuideFilter.tsx` - 필터 UI (언어, 카테고리, 날짜)
- `GuideDetailView.tsx` - 가이드 상세 페이지

**tRPC 프로시저:**
- `guide.getAll` - 모든 가이드 조회 (필터 적용)
- `guide.getById` - 가이드 상세 정보
- `guide.search` - 검색 (이름, 바이오)

**필터 기능:**
- 언어 (다중 선택)
- 카테고리 (다중 선택)
- 평점 (최소 평점)
- 정렬 (평점순, 리뷰 많은 순, 최신순)

#### 2.2 AI 매칭 알고리즘 (2시간)
**파일:**
- `src/server/helpers/matching.ts` (신규)
- `src/server/routers/matching.ts` (신규)

**매칭 스코어 계산 로직:**
```typescript
function calculateMatchScore(traveler: TravelerProfile, guide: GuideProfile): number {
  let score = 0;
  
  // 1. 언어 매칭 (40점)
  const languageMatch = traveler.preferredLanguages.some(lang => 
    guide.languages.includes(lang)
  );
  if (languageMatch) score += 40;
  
  // 2. 관심사 매칭 (30점)
  const interestOverlap = traveler.interests.filter(interest => 
    guide.categories.includes(interest)
  ).length;
  score += (interestOverlap / traveler.interests.length) * 30;
  
  // 3. 평점 보너스 (20점)
  score += (guide.averageRating / 5) * 20;
  
  // 4. 투어 경험 보너스 (10점)
  score += Math.min(guide.totalTours / 10, 1) * 10;
  
  return Math.round(score);
}
```

**tRPC 프로시저:**
- `matching.getRecommendedGuides` - AI 추천 가이드 (스코어 기반 정렬)
- `matching.calculateScore` - 특정 가이드와의 매칭 스코어 계산

#### 2.3 투어 요청 시스템 (2시간)
**파일:**
- `src/server/routers/tour-request.ts` (신규)
- `src/components/tour/` (투어 관련 컴포넌트)

**컴포넌트:**
- `TourRequestModal.tsx` - 투어 요청 모달
- `TourRequestCard.tsx` - 요청 카드
- `TourRequestList.tsx` - 요청 리스트
- `TourRequestDetail.tsx` - 요청 상세

**tRPC 프로시저:**
- `tourRequest.create` - 투어 요청 생성
- `tourRequest.getMyRequests` - 내가 보낸 요청들
- `tourRequest.getReceivedRequests` - 내가 받은 요청들
- `tourRequest.accept` - 요청 수락 (+ 채팅방 생성)
- `tourRequest.reject` - 요청 거절
- `tourRequest.cancel` - 요청 취소
- `tourRequest.complete` - 투어 완료 처리

**플로우:**
1. 여행자가 가이드 프로필에서 "매칭 요청" 클릭
2. 모달에서 날짜, 카테고리, 메시지, 온라인/오프라인 선택
3. 요청 생성 (status: PENDING)
4. 가이드 대시보드에 알림
5. 가이드가 수락/거절
6. 수락 시 자동으로 채팅방 생성

#### 2.4 실시간 채팅 시스템 (3시간)
**파일:**
- `src/app/chat/page.tsx` (채팅 목록)
- `src/app/chat/[chatRoomId]/page.tsx` (채팅방)
- `src/server/routers/chat.ts` (신규)
- `src/components/chat/` (채팅 컴포넌트)

**옵션 1: Polling 방식 (간단, 해커톤 추천)**
- 5초마다 새 메시지 가져오기
- TanStack Query의 `refetchInterval` 사용

**옵션 2: WebSocket (실시간, 복잡)**
- Socket.io 설정
- tRPC subscription 사용

**컴포넌트:**
- `ChatRoomList.tsx` - 채팅방 목록
- `ChatRoomItem.tsx` - 채팅방 항목 (최근 메시지, 시간)
- `ChatMessageList.tsx` - 메시지 리스트
- `ChatMessageInput.tsx` - 메시지 입력
- `ChatMessage.tsx` - 메시지 버블

**tRPC 프로시저:**
- `chat.getRooms` - 내 채팅방 목록
- `chat.getMessages` - 특정 채팅방 메시지
- `chat.sendMessage` - 메시지 전송
- `chat.markAsRead` (COULD) - 읽음 표시

**UI 특징:**
- 자동 스크롤 (최신 메시지로)
- 메시지 시간 표시 (5분 전, 1시간 전)
- 상대방 정보 헤더 (이름, 사진)

---

### Day 3: 리뷰 & 지도 & 최종 마무리 (6시간)

#### 3.1 리뷰 시스템 (1.5시간)
**파일:**
- `src/server/routers/review.ts` (신규)
- `src/components/review/` (리뷰 컴포넌트)
- `src/app/tour/[tourRequestId]/review/page.tsx` (리뷰 작성)

**컴포넌트:**
- `ReviewForm.tsx` - 리뷰 작성 폼 (별점 + 코멘트)
- `ReviewCard.tsx` - 리뷰 카드
- `ReviewList.tsx` - 리뷰 리스트
- `StarRating.tsx` - 별점 표시/입력 컴포넌트

**tRPC 프로시저:**
- `review.create` - 리뷰 작성 (투어 완료 후만 가능)
- `review.getByGuideId` - 특정 가이드 리뷰 조회
- `review.getMyReviews` - 내가 받은 리뷰
- `review.update` - 리뷰 수정 (작성자만)
- `review.delete` - 리뷰 삭제 (작성자만)

**리뷰 작성 후 처리:**
- 가이드의 `averageRating` 재계산
- 가이드의 `totalTours` +1
- 투어 요청 상태를 COMPLETED로 변경

#### 3.2 Kakao Map 연동 (2시간)
**파일:**
- `src/components/map/KakaoMap.tsx` (지도 컴포넌트)
- `src/components/map/LocationPicker.tsx` (위치 선택)
- `src/components/map/TourRoute.tsx` (투어 경로)
- `src/lib/kakao-map.ts` (유틸리티)
- `src/app/locations/page.tsx` (추천 장소 리스트)

**환경변수 추가:**
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY="your_kakao_api_key"
```

**스크립트 로드:**
```typescript
// src/lib/kakao-map.ts
export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

**지도 기능:**
- 가이드 프로필에 활동 지역 표시
- 채팅에서 만날 장소 공유
- 추천 장소 리스트 (맛집, 카페 등)
- 마커 클릭 시 장소 정보 표시

**TourLocation 데이터 시드:**
- 대전 주요 명소 10-20개 등록
- 성심당, 대전역, 한밭수목원, 엑스포, 뿌리공원 등

#### 3.3 UI/UX 개선 (1.5시간)
**작업:**
- [ ] 로딩 상태에 Skeleton 적용
- [ ] 에러 처리 Toast/Alert 추가
- [ ] 반응형 디자인 체크 (모바일 대응)
- [ ] 다크모드 지원 (shadcn/ui 기본 제공)
- [ ] 애니메이션 추가 (Framer Motion - COULD)
- [ ] 빈 상태 UI (Empty State)
  - 가이드가 없을 때
  - 메시지가 없을 때
  - 리뷰가 없을 때
- [ ] 404/500 에러 페이지

**컴포넌트:**
- `src/components/ui/empty-state.tsx`
- `src/components/ui/loading-skeleton.tsx`
- `src/components/ui/toast.tsx` (shadcn/ui 추가)

#### 3.4 시드 데이터 & 테스트 (1시간)
**파일:** `prisma/seed.ts`

**시드 데이터 생성:**
- 가이드 10명 (다양한 언어/카테고리)
- 여행자 5명
- 투어 요청 15개 (다양한 상태)
- 리뷰 30개
- 대전 추천 장소 20개

**테스트 계정:**
```
가이드1: guide1@example.com / password123
가이드2: guide2@example.com / password123
여행자1: traveler1@example.com / password123
여행자2: traveler2@example.com / password123
```

**수동 테스트 체크리스트:**
- [ ] 회원가입 (가이드/여행자)
- [ ] 로그인/로그아웃
- [ ] 프로필 수정
- [ ] 가이드 검색 & 필터링
- [ ] 투어 요청 생성
- [ ] 투어 요청 수락/거절
- [ ] 채팅 메시지 송수신
- [ ] 투어 완료 처리
- [ ] 리뷰 작성
- [ ] 지도 표시

---

## 🎨 디자인 가이드

### 색상 팔레트 (Tailwind)
- Primary: `blue-600` (신뢰, 여행)
- Secondary: `green-500` (안전, 승인)
- Accent: `orange-500` (활동, 열정)
- Danger: `red-500` (거절, 취소)
- Neutral: `slate-700` (텍스트)

### 주요 페이지 레이아웃

#### 홈페이지 (`/`)
```
+----------------------------------+
|  Header (Logo + Login)           |
+----------------------------------+
|  Hero Section                    |
|  "대전을 아는 로컬 가이드와"        |
|  [가이드 찾기] [가이드 등록하기]    |
+----------------------------------+
|  Features (3 Cards)              |
|  - AI 매칭                        |
|  - 안전한 투어                     |
|  - 실시간 채팅                     |
+----------------------------------+
|  Top Guides (Carousel)           |
+----------------------------------+
|  Footer                          |
+----------------------------------+
```

#### 가이드 리스트 (`/guides`)
```
+----------------------------------+
|  Header + Navigation             |
+----------------------------------+
|  [Filters]     |  Guide Cards    |
|  - 언어        |  +------------+ |
|  - 카테고리    |  | 사진       | |
|  - 평점        |  | 이름       | |
|  - 정렬        |  | 언어 배지  | |
|                |  | ★★★★☆     | |
|                |  +------------+ |
+----------------------------------+
```

#### 채팅 (`/chat/[id]`)
```
+----------------------------------+
|  가이드 이름 (Header)             |
+----------------------------------+
|  Message List (Scrollable)       |
|  [상대] 안녕하세요!               |
|          [나] 반갑습니다!         |
+----------------------------------+
|  [메시지 입력] [전송]            |
+----------------------------------+
```

---

## 📦 추가 패키지 설치

### 🔧 1단계: 필수 패키지 (MUST)

```bash
# 날짜 처리
pnpm add date-fns

# 아이콘
pnpm add lucide-react

# UI 컴포넌트 추가
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add avatar
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add button
```

### ⭐ 2단계: 권장 패키지 (SHOULD)

```bash
# 파일 업로드 (가이드 인증서)
pnpm add uploadthing @uploadthing/react

# 지도 (Kakao Map)
pnpm add react-kakao-maps-sdk
```

### 💡 3단계: 선택 패키지 (COULD)

**옵션 A: Pusher (실시간 채팅)**
```bash
pnpm add pusher pusher-js
```

**옵션 B: Polling 방식 (권장 - 해커톤)**
- 추가 패키지 불필요
- TanStack Query의 `refetchInterval` 사용
- 간단하고 안정적

### 📊 채팅 시스템 비교

| 구분 | Polling | Pusher | WebSocket (Socket.io) |
|------|---------|--------|----------------------|
| **복잡도** | ⭐ 낮음 | ⭐⭐ 중간 | ⭐⭐⭐ 높음 |
| **실시간성** | ~5초 지연 | 즉시 | 즉시 |
| **설정 시간** | 5분 | 30분 | 1-2시간 |
| **비용** | 무료 | 무료 플랜 100 동시접속 | 무료 |
| **안정성** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **해커톤 적합** | ✅ 강력 추천 | ⭐ 선택 | ⚠️ 비추천 |

**✅ 권장: Polling 방식**
- 5초 간격으로 메시지 가져오기
- 채팅방에 있을 때만 refetch
- 데모에서는 충분히 실시간처럼 보임
- 코드 예시:
```typescript
const { data: messages } = trpc.chat.getMessages.useQuery(
  { chatRoomId },
  { refetchInterval: 5000 } // 5초마다
);
```

---

## 🚀 배포 준비

### 환경변수 체크리스트
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.vercel.app"

# App
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_API_KEY="..."

# UploadThing (파일 업로드)
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."
```

### Vercel 배포
1. GitHub에 푸시
2. Vercel 연결
3. 환경변수 설정
4. 자동 배포
5. `pnpm db:push` 실행 (Vercel Postgres 사용 시)

---

## 🎤 발표 자료 준비

### 데모 시나리오
1. **홈페이지** (5초)
   - "대전 로컬 가이드 매칭 플랫폼입니다"

2. **가이드 검색** (10초)
   - 일본어 가능 + 맛집 전문 필터링
   - AI 매칭 스코어 표시

3. **가이드 프로필** (10초)
   - 자기소개, 언어, 카테고리, 평점, 리뷰
   - "매칭 요청" 버튼

4. **투어 요청** (10초)
   - 날짜, 메시지 입력
   - 온라인/오프라인 선택

5. **채팅** (10초)
   - 실시간 메시지 송수신
   - 만날 장소 공유

6. **리뷰** (5초)
   - 별점 + 코멘트 작성

### 발표 포인트
- **문제 정의:** 대전 관광 콘텐츠 부족, 외국인 접근성 낮음
- **솔루션:** 로컬 청년이 가이드 → 진짜 대전 경험 제공
- **기술 스택:** Next.js + tRPC + Prisma (타입 세이프)
- **차별화:** AI 매칭, 비대면 옵션, 안전 시스템
- **임팩트:** 지역 경제 활성화 + 청년 일자리 + 문화 교류

---

## 🔥 우선순위 (시간 부족 시)

### MUST (반드시 구현)
- ✅ 역할 기반 회원가입/로그인
- ✅ 프로필 시스템 (가이드/여행자)
- ✅ 가이드 검색 & 필터링
- ✅ 매칭 요청 (생성/수락/거절)
- ✅ 채팅 (Polling 방식)
- ✅ 대시보드 (요청 리스트)

### SHOULD (있으면 좋음)
- ⭐ 리뷰 시스템
- ⭐ AI 매칭 알고리즘
- ⭐ Kakao Map 연동
- ⭐ 가이드 통계 (평점, 투어 수)

### COULD (시간 남으면)
- 💡 파일 업로드 (가이드 인증서)
- 💡 찜하기 기능
- 💡 알림 시스템
- 💡 투어 히스토리/타임라인
- 💡 다국어 지원 (i18n)

---

## ⚠️ 주의사항

### 코드 품질
- [ ] tRPC 모든 프로시저에 Zod 검증
- [ ] 보호된 라우트는 `protectedProcedure` 사용
- [ ] 에러 처리 (try-catch + TRPCError)
- [ ] 타입 안전성 (any 금지)
- [ ] 로딩 상태 (Skeleton 사용)
- [ ] 권한 체크 (본인 데이터만 수정)

### 성능
- [ ] Prisma 쿼리 최적화 (select, include)
- [ ] 페이지네이션 (커서 기반)
- [ ] 이미지 최적화 (Next.js Image)
- [ ] 인덱스 확인 (Prisma schema)

### 보안
- [ ] 비밀번호 해싱 (bcrypt)
- [ ] CSRF 보호 (NextAuth 기본 제공)
- [ ] XSS 방지 (React 기본 제공)
- [ ] SQL Injection 방지 (Prisma 기본 제공)
- [ ] 환경변수 검증 (Zod)

---

## 📊 진행 상황 체크

### Day 1
- [ ] Prisma 스키마 완성
- [ ] 역할 기반 회원가입
- [ ] 프로필 CRUD
- [ ] 대시보드 분기

### Day 2
- [ ] 가이드 검색/필터링
- [ ] AI 매칭 알고리즘
- [ ] 투어 요청 시스템
- [ ] 채팅 시스템

### Day 3
- [ ] 리뷰 시스템
- [ ] Kakao Map 연동
- [ ] UI/UX 개선
- [ ] 시드 데이터 & 테스트

---

## 🎯 성공 기준

### 기능 완성도
- ✅ 가이드/여행자 모두 회원가입 가능
- ✅ 가이드 검색 및 프로필 조회 가능
- ✅ 투어 요청 및 수락/거절 가능
- ✅ 채팅으로 소통 가능
- ✅ 투어 완료 후 리뷰 작성 가능

### 데모 준비
- ✅ 시드 데이터로 풍부한 콘텐츠
- ✅ 5분 발표 시나리오 완성
- ✅ 실제 작동하는 프로토타입
- ✅ Vercel 배포 완료

### 심사 포인트
- ✅ 지역 문제 해결 (대전 관광 활성화)
- ✅ 기술적 완성도 (타입 세이프티, 아키텍처)
- ✅ 확장 가능성 (다른 도시로 확대)
- ✅ UI/UX 품질

---

## 🏗️ 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │  React 19  │  │  Next.js 16 │  │ Tailwind v4  │         │
│  │            │  │  App Router │  │  shadcn/ui   │         │
│  └────────────┘  └─────────────┘  └──────────────┘         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           TanStack Query (Client State)               │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ tRPC (Type-Safe API)
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Server (Next.js)                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │ NextAuth   │  │   tRPC 11   │  │    Zod       │         │
│  │  v5 Auth   │  │  Procedures │  │  Validation  │         │
│  └────────────┘  └─────────────┘  └──────────────┘         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma ORM 6.19                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────────┐   │
│  │  Users  │  │ Profiles│  │  Tours   │  │  Messages  │   │
│  └─────────┘  └─────────┘  └──────────┘  └────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Services:
┌─────────────┐  ┌─────────────┐  ┌──────────────┐
│   Kakao     │  │ UploadThing │  │   Vercel     │
│  Maps API   │  │ File Storage│  │  Deployment  │
└─────────────┘  └─────────────┘  └──────────────┘
```

## 🎯 기술 선정 이유

### ✅ Next.js 16 + React 19
- **App Router**: 파일 기반 라우팅, Server Components
- **Server Actions**: API 없이 서버 코드 호출
- **Image Optimization**: 자동 이미지 최적화
- **SEO**: 메타태그, sitemap 자동 생성

### ✅ tRPC 11 + TanStack Query
- **End-to-End Type Safety**: API 타입 자동 추론
- **No Code Generation**: 별도 빌드 단계 불필요
- **React Query Integration**: 캐싱, 리페칭 자동 처리
- **Optimistic Updates**: 낙관적 업데이트 쉬움

### ✅ Prisma 6.19
- **Type-Safe ORM**: DB 쿼리 타입 안전
- **Migration**: 스키마 변경 추적
- **Prisma Studio**: 데이터베이스 GUI
- **Auto-completion**: IDE 자동완성

### ✅ NextAuth v5
- **세션 관리**: JWT + 데이터베이스 세션
- **Provider 확장성**: Google, GitHub 등 추가 쉬움
- **보안**: CSRF, XSS 기본 방어
- **TypeScript**: 완벽한 타입 지원

### ✅ Tailwind CSS v4
- **유틸리티 기반**: 빠른 스타일링
- **반응형**: 모바일 대응 쉬움
- **다크모드**: 내장 지원
- **커스터마이징**: 테마 확장 가능

### ✅ Polling 방식 채팅 (추천)
- **간단함**: 5분 안에 구현
- **안정성**: WebSocket 연결 문제 없음
- **충분한 실시간성**: 5초 간격이면 데모용 OK
- **비용**: 무료

### ⚠️ Pusher vs Polling

**Pusher를 선택하면:**
- ✅ 진짜 실시간 (지연 없음)
- ✅ 배터리 효율적
- ❌ 설정 시간 30분+
- ❌ 외부 서비스 의존
- ❌ 무료 플랜 제한

**Polling을 선택하면:**
- ✅ 5분 안에 구현
- ✅ 외부 의존성 없음
- ✅ 디버깅 쉬움
- ❌ 5초 지연
- ❌ 약간의 서버 부하

**결론: 해커톤에서는 Polling 추천!**

---

## 🔒 보안 체크리스트

### ✅ 이미 구현됨 (보일러플레이트)
- [x] 비밀번호 해싱 (bcryptjs)
- [x] CSRF 보호 (NextAuth)
- [x] XSS 방지 (React 기본)
- [x] SQL Injection 방지 (Prisma)
- [x] 환경변수 검증 (Zod)
- [x] HTTPS (Vercel 자동)

### 🔜 구현 필요
- [ ] Rate Limiting (tRPC middleware)
- [ ] Input Sanitization (Zod strict mode)
- [ ] 권한 체크 (protectedProcedure)
- [ ] 파일 업로드 검증 (UploadThing)
- [ ] 이메일 인증 (선택 사항)

---

## 📈 성능 최적화

### ✅ 기본 제공
- [x] React 19 Compiler (자동 메모이제이션)
- [x] Next.js Image Optimization
- [x] TanStack Query Caching
- [x] Prisma Connection Pooling
- [x] Vercel Edge Network

### 🔜 추가 최적화 (시간 있으면)
- [ ] Prisma Query Optimization (select, include)
- [ ] 커서 기반 페이지네이션
- [ ] Lazy Loading (React.lazy)
- [ ] 이미지 압축 (Sharp)
- [ ] CDN 활용 (Vercel 자동)

---

**마지막 업데이트:** 2025-11-08
**예상 작업 시간:** 24시간 (3일)
**난이도:** ⭐⭐⭐⭐☆ (높음)
**성공 가능성:** 90% (보일러플레이트 + 확정된 스택)

