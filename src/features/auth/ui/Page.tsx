"use client";

import { Suspense } from "react";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export type AuthMode = "login" | "signup";

export interface AuthPageProps {
  mode: AuthMode;
}

export default function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === "signup";
  return (
    <AuthLayout title={isSignup ? "회원가입" : "로그인"}>
      <Suspense fallback={<div>로딩 중...</div>}>
        {isSignup ? <SignupForm /> : <LoginForm />}
      </Suspense>
    </AuthLayout>
  );
}
