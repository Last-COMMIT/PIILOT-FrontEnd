"use client";

import { useState } from "react";

/**
 * 권한 훅
 * - localStorage `piilot_role` 값이 "admin" (대소문자 무시)이면 관리자
 * - 로그인 시 백엔드가 result.role 을 내려주면 auth-storage에서 저장
 * - 값이 없으면 기본 "user" → 일반 사용자
 */
export function useIsAdmin() {
  const [isAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const role = window.localStorage.getItem("piilot_role");
      return role?.toLowerCase() === "admin";
    } catch {
      return false;
    }
  });

  return isAdmin;
}
