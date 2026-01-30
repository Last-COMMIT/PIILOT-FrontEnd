import type { ApiResponse } from "@/shared/api";

/** 로그인 요청 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 성공 시 result */
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

export type LoginResponse = ApiResponse<LoginResult>;

/** 회원가입 요청 */
export interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}

/** 회원가입 성공 시 result */
export interface SignupResult {
  id: number;
  email: string;
  name: string;
  role: string;
}

export type SignupResponse = ApiResponse<SignupResult>;

/** 토큰 재발급 성공 시 result (로그인과 동일) */
export type RefreshResult = LoginResult;
export type RefreshResponse = ApiResponse<RefreshResult>;
