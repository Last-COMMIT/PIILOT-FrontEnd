import { refreshToken as callRefreshToken } from "../api/auth-api";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  redirectToLogin,
} from "./auth-storage";

/** 동시 다중 401 시 refresh 한 번만 호출 */
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const token = getRefreshToken();
    if (!token) return false;
    const data = await callRefreshToken(token);
    if (data.success && data.result) {
      saveTokens(data.result.accessToken, data.result.refreshToken);
      return true;
    }
    return false;
  })();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * 인증이 필요한 API 호출용 fetch.
 * - Authorization: Bearer {accessToken} 자동 추가
 * - access 없으면 refresh 시도 후 진행, 401 시에도 refresh 후 한 번 재시도
 * - refresh 실패 시에만 로그인 페이지로 이동 및 토큰 제거
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let accessToken = getAccessToken();
  if (!accessToken) {
    const refreshed = await doRefresh();
    if (!refreshed) {
      redirectToLogin();
      throw new Error("No access token");
    }
    accessToken = getAccessToken();
    if (!accessToken) {
      redirectToLogin();
      throw new Error("No access token after refresh");
    }
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status !== 401) return res;

  const refreshed = await doRefresh();
  if (!refreshed) {
    redirectToLogin();
    throw new Error("Session expired");
  }

  const newAccessToken = getAccessToken();
  if (!newAccessToken) {
    redirectToLogin();
    throw new Error("No access token after refresh");
  }
  headers.set("Authorization", `Bearer ${newAccessToken}`);
  return fetch(input, { ...init, headers });
}
