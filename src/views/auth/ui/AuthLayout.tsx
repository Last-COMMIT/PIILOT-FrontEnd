"use client";

import * as React from "react";

export interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[var(--color-bg-main)]">
      <div className="relative h-full w-full px-6 py-10">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center gap-10">
          {/* 좌측 텍스트 영역 */}
          <div className="hidden md:flex min-w-0 flex-1 flex-col gap-4">
            <div className="text-white">
              <h1 className="text-[3.4rem] font-bold tracking-wider">
                <span className="text-[var(--color-main-bg)]">PII</span>LOT
              </h1>
              <p className="mt-4 text-[1.125rem] leading-relaxed tracking-wide text-white/90">
                개인정보 유출을 사전에 방지하고 탐지하는
                <br />
                AI 기반 파일럿 관제 플랫폼입니다.
              </p>
            </div>
          </div>

          {/* 우측 폼 영역 */}
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)]/95 p-6 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
