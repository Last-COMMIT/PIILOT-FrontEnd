import { API_BASE_URL } from "@/shared/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  RefreshResponse,
} from "./types";

const AUTH_BASE = `${API_BASE_URL}/api/auth`;

/** 로그인 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      code: (errorBody as { code?: string }).code ?? "",
      message:
        (errorBody as { message?: string }).message ??
        `요청 실패 (${res.status})`,
      result: null,
      timestamp: "",
    } as LoginResponse;
  }
  return res.json() as Promise<LoginResponse>;
}

/** 회원가입 */
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      code: (errorBody as { code?: string }).code ?? "",
      message:
        (errorBody as { message?: string }).message ??
        `요청 실패 (${res.status})`,
      result: null,
      timestamp: "",
    } as SignupResponse;
  }
  return res.json() as Promise<SignupResponse>;
}

/** 토큰 재발급 (Authorization: Bearer {refreshToken}) */
export async function refreshToken(token: string): Promise<RefreshResponse> {
  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    return {
      success: false,
      code: (errorBody as { code?: string }).code ?? "",
      message:
        (errorBody as { message?: string }).message ??
        `토큰 갱신 실패 (${res.status})`,
      result: null,
      timestamp: "",
    } as RefreshResponse;
  }
  return res.json() as Promise<RefreshResponse>;
}
