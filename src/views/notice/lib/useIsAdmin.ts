"use client";

import { useEffect, useState } from "react";

/**
 * 임시 권한 훅
 * - localStorage `piilot_role` 값이 "admin"이면 관리자
 * - 값이 없으면 기본 "user"
 */
export function useIsAdmin() {
  // 지금 단계에서는 기능 확인을 위해 항상 true로 처리
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    setIsAdmin(true);
  }, []);

  return isAdmin;
}
