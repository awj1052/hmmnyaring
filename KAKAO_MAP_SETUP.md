# Kakao Maps API 설정 가이드

## 1. Kakao Developers 앱 생성 및 API 키 발급

### 1.1 Kakao Developers 가입
1. https://developers.kakao.com 접속
2. Kakao 계정으로 로그인 (없으면 회원가입)

### 1.2 애플리케이션 생성
1. 로그인 후 우측 상단 "내 애플리케이션" 클릭
2. "애플리케이션 추가하기" 버튼 클릭
3. 다음 정보 입력:
   - **앱 이름**: TravelMate Daejeon
   - **회사 이름**: (선택 사항)
4. "저장" 버튼 클릭

### 1.3 JavaScript 키 발급
1. 생성된 앱 클릭하여 상세 페이지 진입
2. 좌측 메뉴에서 "앱 키" 선택
3. **"JavaScript 키"** 복사 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - 이 키를 `.env` 파일에 사용합니다

### 1.4 플랫폼 설정 (중요!)
1. 좌측 메뉴에서 "플랫폼" 선택
2. "Web 플랫폼 등록" 버튼 클릭
3. 사이트 도메인 등록:
   - **개발 환경**: `http://localhost:3000`
   - **프로덕션**: `https://your-domain.com` (배포 후 추가)
4. "저장" 클릭

**주의**: 등록한 도메인에서만 API가 동작합니다!

## 2. 환경변수 설정

### 2.1 .env 파일 생성
프로젝트 루트에 `.env` 파일 생성 (이미 있다면 추가)

```env
# Kakao Maps API
NEXT_PUBLIC_KAKAO_MAP_API_KEY="여기에_발급받은_JavaScript_키_입력"
```

### 2.2 환경변수 예시
```env
NEXT_PUBLIC_KAKAO_MAP_API_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## 3. 확인사항

### ✅ 체크리스트
- [ ] Kakao Developers 가입 완료
- [ ] 애플리케이션 생성 완료
- [ ] JavaScript 키 발급 완료
- [ ] Web 플랫폼 등록 완료 (localhost:3000)
- [ ] .env 파일에 API 키 설정 완료
- [ ] 개발 서버 재시작

## 4. 테스트

환경변수가 제대로 설정되었는지 확인:

```bash
# 개발 서버 재시작
pnpm dev
```

브라우저 콘솔에서 확인:
```javascript
console.log(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
```

## 5. 문제 해결

### API 키가 인식되지 않을 때
1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 환경변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
3. 개발 서버를 재시작했는지 확인

### 지도가 로드되지 않을 때
1. Kakao Developers에서 플랫폼 설정 확인
2. `http://localhost:3000`이 등록되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### CORS 에러가 발생할 때
- Kakao Developers의 플랫폼 설정에서 도메인이 정확히 등록되어 있는지 확인
- 프로토콜(http/https) 포함하여 정확히 입력

## 6. 참고 링크

- [Kakao Developers](https://developers.kakao.com)
- [Kakao Maps API 문서](https://apis.map.kakao.com/web/)
- [JavaScript 키 발급 가이드](https://developers.kakao.com/docs/latest/ko/getting-started/app)

