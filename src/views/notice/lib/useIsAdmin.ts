"use client";

import { useState } from "react";

/**
 * 권한 훅
 * - localStorage `piilot_role` 값이 "admin"이면 관리자
 * - 값이 없으면 기본 "user"
 */
export function useIsAdmin() {
  const [isAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const role = window.localStorage.getItem("piilot_role");
      return role === "admin";
    } catch {
      return false;
    }
  });

  return isAdmin;
}
