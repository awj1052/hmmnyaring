/**
 * 간단한 In-Memory Rate Limiting
 * 
 * Upstash Redis 없이 단일 서버 환경에서 사용 가능
 * 다중 서버 환경에서는 Upstash Redis 권장
 */

type RateLimitStore = Map<string, { count: number; resetAt: number }>;

class SimpleRateLimit {
  private store: RateLimitStore = new Map();
  private maxRequests: number;
  private windowMs: number;
  private name: string;

  constructor(name: string, maxRequests: number, windowMs: number) {
    this.name = name;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // 주기적으로 오래된 항목 정리 (메모리 누수 방지)
    setInterval(() => this.cleanup(), 60000); // 1분마다
  }

  async check(identifier: string): Promise<{ 
    success: boolean; 
    remaining: number; 
    resetAt: Date 
  }> {
    const now = Date.now();
    const key = `${this.name}:${identifier}`;
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // 새로운 윈도우 시작
      const resetAt = now + this.windowMs;
      this.store.set(key, {
        count: 1,
        resetAt,
      });
      return { 
        success: true, 
        remaining: this.maxRequests - 1,
        resetAt: new Date(resetAt)
      };
    }

    if (record.count >= this.maxRequests) {
      // 제한 초과
      return { 
        success: false, 
        remaining: 0,
        resetAt: new Date(record.resetAt)
      };
    }

    // 카운트 증가
    record.count++;
    return { 
      success: true, 
      remaining: this.maxRequests - record.count,
      resetAt: new Date(record.resetAt)
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetAt) {
        this.store.delete(key);
      }
    }
  }

  // 개발/테스트용: 특정 식별자의 제한 초기화
  reset(identifier: string) {
    const key = `${this.name}:${identifier}`;
    this.store.delete(key);
  }

  // 개발/테스트용: 모든 제한 초기화
  resetAll() {
    this.store.clear();
  }
}

/**
 * 번역 API 호출 제한 (비용 발생)
 * - 1분당 10회
 */
export const translationRateLimit = new SimpleRateLimit(
  'translation',
  10,
  60 * 1000 // 1분
);

/**
 * 채팅 메시지 전송 제한
 * - 10초당 5회
 */
export const chatRateLimit = new SimpleRateLimit(
  'chat',
  5,
  10 * 1000 // 10초
);

/**
 * 회원가입 제한 (IP 기반)
 * - 1시간당 3회
 */
export const registerRateLimit = new SimpleRateLimit(
  'register',
  3,
  60 * 60 * 1000 // 1시간
);

/**
 * 로그인 시도 제한 (브루트포스 방어)
 * - 5분당 5회
 */
export const loginRateLimit = new SimpleRateLimit(
  'login',
  5,
  5 * 60 * 1000 // 5분
);

/**
 * 투어 요청 생성 제한
 * - 1시간당 5회
 */
export const tourRequestRateLimit = new SimpleRateLimit(
  'tour-request',
  5,
  60 * 60 * 1000 // 1시간
);

/**
 * Rate limit 체크 헬퍼
 */
export async function checkRateLimit(
  rateLimit: SimpleRateLimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  return await rateLimit.check(identifier);
}

