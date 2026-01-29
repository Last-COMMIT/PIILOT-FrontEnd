"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, PasswordInput } from "@/shared/ui";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 10~16자, 영문/숫자/특수문자 각각 1개 이상
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[\s\S]{10,16}$/;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "이메일을 입력해주세요.";
    return EMAIL_REGEX.test(email.trim())
      ? ""
      : "이메일 형식이 올바르지 않습니다.";
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return "";
    if (!password.trim()) return "비밀번호를 입력해주세요.";
    return PASSWORD_REGEX.test(password)
      ? ""
      : "영문/숫자/특수문자 포함 10~16자로 입력해주세요.";
  }, [password, touched.password]);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (!EMAIL_REGEX.test(email.trim())) return false;
    if (!PASSWORD_REGEX.test(password)) return false;
    return true;
  }, [email, password]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    try {
      window.localStorage.setItem("piilot_authed", "1");
    } catch {
      // ignore
    }
    router.replace("/");
  };

  // 이미 로그인 상태면 로그인 페이지 진입 방지
  useEffect(() => {
    if (preview) return;
    try {
      const authed = window.localStorage.getItem("piilot_authed") === "1";
      if (authed) router.replace("/");
    } catch {
      // ignore
    }
  }, [router, preview]);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--color-text-light-gray)]">
          이메일
        </label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="email@company.com"
          colorScheme="main"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(emailError) || undefined}
        />
        {emailError ? (
          <p className="text-xs text-[var(--color-coral-text)]">{emailError}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-[var(--color-text-light-gray)]">
          비밀번호
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          placeholder="********"
          colorScheme="main"
          autoComplete="current-password"
          aria-invalid={Boolean(passwordError) || undefined}
        />
        {passwordError ? (
          <p className="text-xs text-[var(--color-coral-text)]">
            {passwordError}
          </p>
        ) : null}
      </div>

      <Button
        colorScheme="main"
        appearance="solid"
        className="w-full mt-2"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        로그인
      </Button>

      <div className="text-center text-xs text-[var(--color-text-light-gray)] pt-1">
        계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[var(--color-main-text)]"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
