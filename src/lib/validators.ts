/**
 * 공통 입력 검증 스키마
 * 
 * Zod를 사용한 타입 안전한 검증
 */

import { z } from 'zod';

/**
 * 강력한 비밀번호 검증
 * 
 * - 최소 8자
 * - 대문자 1개 이상
 * - 소문자 1개 이상
 * - 숫자 1개 이상
 * - 특수문자 1개 이상
 */
export const strongPasswordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .max(72, '비밀번호는 72자를 초과할 수 없습니다.') // bcrypt 제한
  .regex(/[A-Z]/, '비밀번호는 대문자를 최소 1개 포함해야 합니다.')
  .regex(/[a-z]/, '비밀번호는 소문자를 최소 1개 포함해야 합니다.')
  .regex(/[0-9]/, '비밀번호는 숫자를 최소 1개 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '비밀번호는 특수문자를 최소 1개 포함해야 합니다.');

/**
 * 이메일 검증 (RFC 5321 준수)
 */
export const emailSchema = z
  .string()
  .email('올바른 이메일 형식이 아닙니다.')
  .toLowerCase()
  .trim()
  .max(254, '이메일은 254자를 초과할 수 없습니다.'); // RFC 5321 제한

/**
 * 이름 검증 (XSS 방어)
 */
export const nameSchema = z
  .string()
  .trim()
  .min(1, '이름을 입력해주세요.')
  .max(100, '이름은 100자를 초과할 수 없습니다.')
  .regex(
    /^[a-zA-Z가-힣\s\-'.]+$/,
    '이름은 문자, 공백, 하이픈, 아포스트로피만 사용할 수 있습니다.'
  );

/**
 * 메시지 검증
 */
export const messageSchema = z
  .string()
  .trim()
  .min(1, '메시지를 입력해주세요.')
  .max(2000, '메시지는 2000자를 초과할 수 없습니다.');

/**
 * 전화번호 검증
 */
export const phoneSchema = z
  .string()
  .regex(/^[0-9\-+() ]+$/, '올바른 전화번호 형식이 아닙니다.')
  .min(10, '전화번호는 최소 10자 이상이어야 합니다.')
  .max(20, '전화번호는 20자를 초과할 수 없습니다.');

/**
 * Bio/자기소개 검증
 */
export const bioSchema = z
  .string()
  .trim()
  .min(10, '자기소개는 최소 10자 이상이어야 합니다.')
  .max(1000, '자기소개는 1000자를 초과할 수 없습니다.');

/**
 * 리뷰 코멘트 검증
 */
export const reviewCommentSchema = z
  .string()
  .trim()
  .min(10, '리뷰는 최소 10자 이상 작성해주세요.')
  .max(1000, '리뷰는 1000자를 초과할 수 없습니다.');

/**
 * 국적 검증
 */
export const nationalitySchema = z
  .string()
  .trim()
  .min(2, '국적을 입력해주세요.')
  .max(50, '국적은 50자를 초과할 수 없습니다.')
  .regex(/^[a-zA-Z가-힣\s]+$/, '국적은 문자와 공백만 사용할 수 있습니다.');

/**
 * ID 검증 (CUID)
 */
export const idSchema = z
  .string()
  .regex(/^c[a-z0-9]{24,25}$/, '올바른 ID 형식이 아닙니다.');

/**
 * 별점 검증
 */
export const ratingSchema = z
  .number()
  .int('별점은 정수여야 합니다.')
  .min(1, '별점은 최소 1점입니다.')
  .max(5, '별점은 최대 5점입니다.');

/**
 * 페이지네이션 제한
 */
export const limitSchema = z
  .number()
  .int()
  .min(1, '최소 1개 이상 조회해야 합니다.')
  .max(100, '최대 100개까지 조회할 수 있습니다.')
  .default(10);

/**
 * 번역 텍스트 검증
 */
export const translationTextSchema = z
  .string()
  .trim()
  .min(1, '번역할 텍스트를 입력해주세요.')
  .max(1000, '번역할 텍스트는 1000자를 초과할 수 없습니다.');

