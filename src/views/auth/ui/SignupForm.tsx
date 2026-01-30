"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, PasswordInput } from "@/shared/ui";
import { signup as authSignup } from "@/shared/api/auth";
import { TermsModal, type ModalKind } from "./TermsModal";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 10~16자, 영문/숫자/특수문자 각각 1개 이상
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[\s\S]{10,16}$/;

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview") === "1";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [agree, setAgree] = useState(false);
  const [modalKind, setModalKind] = useState<ModalKind | null>(null);
  const [policyViewed, setPolicyViewed] = useState({
    terms: false,
    privacy: false,
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    passwordConfirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nameError = useMemo(() => {
    if (!touched.name) return "";
    return name.trim() ? "" : "성명을 입력해주세요.";
  }, [name, touched.name]);

  const emailError = useMemo(() => {
    if (!touched.email) return "";
    if (!email.trim()) return "이메일을 입력해주세요.";
    return EMAIL_REGEX.test(email.trim())
      ? ""
      : "이메일 형식이 올바르지 않습니다.";
  }, [email, touched.email]);

  const passwordRuleError = useMemo(() => {
    if (!touched.password) return "";
    if (!password.trim()) return "비밀번호를 입력해주세요.";
    return PASSWORD_REGEX.test(password)
      ? ""
      : "영문/숫자/특수문자 포함 10~16자로 입력해주세요.";
  }, [password, touched.password]);

  const passwordError = useMemo(() => {
    if (password.length === 0 || passwordConfirm.length === 0) return "";
    return password === passwordConfirm ? "" : "비밀번호가 일치하지 않습니다.";
  }, [password, passwordConfirm]);

  const canSubmit = useMemo(() => {
    if (!agree) return false;
    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirm.trim()
    )
      return false;
    if (!EMAIL_REGEX.test(email.trim())) return false;
    if (!PASSWORD_REGEX.test(password)) return false;
    if (passwordError) return false; // confirmation mismatch
    return true;
  }, [agree, name, email, password, passwordConfirm, passwordError]);

  const canAgree = policyViewed.terms && policyViewed.privacy;

  const openPolicy = (kind: ModalKind) => {
    setModalKind(kind);
    setPolicyViewed((prev) => ({ ...prev, [kind]: true }));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMessage("");
    setIsLoading(true);
    try {
      const data = await authSignup({
        email: email.trim(),
        password,
        passwordConfirm,
        name: name.trim(),
      });
      if (data.success) {
        router.replace("/login");
      } else {
        setErrorMessage(data.message ?? "회원가입에 실패했습니다.");
      }
    } catch {
      setErrorMessage(
        "서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 이미 로그인 상태면 회원가입 페이지 진입 방지
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
    <>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-text-light-gray)]">
            성명
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="이름"
            colorScheme="main"
            aria-invalid={Boolean(nameError) || undefined}
          />
          {nameError ? (
            <p className="text-xs text-[var(--color-coral-text)]">
              {nameError}
            </p>
          ) : null}
        </div>

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
            <p className="text-xs text-[var(--color-coral-text)]">
              {emailError}
            </p>
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
            autoComplete="new-password"
            aria-invalid={Boolean(passwordRuleError) || undefined}
          />
          {passwordRuleError ? (
            <p className="text-xs text-[var(--color-coral-text)]">
              {passwordRuleError}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--color-text-light-gray)]">
            비밀번호 확인
          </label>
          <PasswordInput
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, passwordConfirm: true }))}
            placeholder="********"
            colorScheme="main"
            autoComplete="new-password"
            aria-invalid={Boolean(passwordError) || undefined}
          />
          {touched.passwordConfirm && passwordError ? (
            <p className="text-xs text-[var(--color-coral-text)]">
              {passwordError}
            </p>
          ) : null}
        </div>

        {/* 약관 동의 */}
        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs text-[var(--color-text-light-gray)]">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              disabled={!canAgree}
              className="size-4 accent-[var(--color-main-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-main-bg)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="leading-relaxed">
              <Button
                type="button"
                colorScheme="main"
                appearance="link"
                size="sm"
                className="h-auto px-0 py-0 text-xs font-semibold align-baseline"
                onClick={() => openPolicy("terms")}
              >
                약관
              </Button>
              <span className="text-[var(--color-text-light-gray)]"> / </span>
              <Button
                type="button"
                colorScheme="main"
                appearance="link"
                size="sm"
                className="h-auto px-0 py-0 text-xs font-semibold align-baseline"
                onClick={() => openPolicy("privacy")}
              >
                개인정보 처리방침
              </Button>
              에 동의합니다.{" "}
            </span>
          </label>
          {!canAgree ? (
            <p className="mt-1 text-xs text-[var(--color-text-dark-gray)]">
              체크하려면 약관/개인정보 처리방침을 각각 한 번씩 확인해주세요.
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="text-xs text-[var(--color-coral-text)]">
            {errorMessage}
          </p>
        ) : null}

        <Button
          colorScheme="main"
          appearance="solid"
          className="w-full mt-2"
          disabled={!canSubmit || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "회원가입 중..." : "회원가입"}
        </Button>

        <div className="text-center text-xs text-[var(--color-text-light-gray)] pt-1">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-main-text)]"
          >
            로그인
          </Link>
        </div>
      </div>

      <TermsModal kind={modalKind} onClose={() => setModalKind(null)} />
    </>
  );
}
