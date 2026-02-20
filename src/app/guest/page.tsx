"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/features/auth/api/auth-api";
import { isAuthed, saveTokens } from "@/features/auth/model/auth-storage";

const GUEST_EMAIL = "admin@gmail.com";
const GUEST_PASSWORD = "chanu1234!";

export default function GuestPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed()) {
      router.replace("/");
      return;
    }

    const autoLogin = async () => {
      try {
        const response = await login({
          email: GUEST_EMAIL,
          password: GUEST_PASSWORD,
        });
        if (response.success && response.result) {
          const { accessToken, refreshToken, role } = response.result;
          saveTokens(accessToken, refreshToken, role);
          router.replace("/");
        } else {
          setError(response.message || "로그인에 실패했습니다.");
        }
      } catch {
        setError("서버 연결에 실패했습니다.");
      }
    };

    autoLogin();
  }, [router]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <p>접속 중...</p>
    </div>
  );
}
