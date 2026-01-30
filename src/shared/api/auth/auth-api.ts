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
  return res.json() as Promise<LoginResponse>;
}

/** 회원가입 */
export async function signup(body: SignupRequest): Promise<SignupResponse> {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<SignupResponse>;
}

/** 토큰 재발급 (Authorization: Bearer {refreshToken}) */
export async function refreshToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  const res = await fetch(`${AUTH_BASE}/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return res.json() as Promise<RefreshResponse>;
}
