"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
  title?: string;
  pathname?: string;
}

const pageTitles: Record<string, string> = {
  "/": "대시보드",
  "/connection/db": "DB 서버 연결 관리",
  "/connection/file": "파일 서버 연결 관리",
  "/privacy/db/list": "DB 개인정보 목록",
  "/privacy/db/issues": "DB 개인정보 이슈",
  "/privacy/file/list": "파일 개인정보 목록",
  "/privacy/file/issues": "파일정보 이슈",
  "/privacy/file/masking": "AI 자동 마스킹",
  "/law/search": "법령/내규 검색",
  "/notice": "공지사항",
  "/settings": "설정",
};

function resolvePageTitle(pathname: string | null): string {
  if (!pathname) return "대시보드";
  if (pageTitles[pathname]) return pageTitles[pathname];

  // dynamic routes / nested paths
  const prefixes: Array<[string, string]> = [
    ["/notice", "공지사항"],
    ["/law/search", "법령/내규 검색"],
    ["/privacy/file", "파일 서버 개인정보 관리"],
    ["/privacy/db", "DB 서버 개인정보 관리"],
    ["/connection", "연결관리"],
  ];
  for (const [prefix, title] of prefixes) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "대시보드";
}

export function Header({
  className,
  title,
  pathname: pathnameProp,
}: HeaderProps) {
  const fromRouter = usePathname();
  const pathname =
    pathnameProp !== undefined ? pathnameProp : (fromRouter ?? null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);

  const pageTitle = title || resolvePageTitle(pathname);

  const handleNotificationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleClickOutside = () => {
    setIsNotificationOpen(false);
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between",
        "h-[76px] px-6",
        "bg-[var(--color-bg-main)] border-b border-[var(--color-content-border)]",
        className,
      )}
    >
      <div className="flex items-center">
        <h1 className="text-[24px] font-semibold text-white">{pageTitle}</h1>
      </div>
      <div className="relative">
        <button
          onClick={handleNotificationClick}
          className={cn(
            "relative",
            "p-2",
            "rounded-md",
            "text-[var(--color-sidebar-text)]",
            "hover:bg-[var(--color-sidebar-hover-bg)] hover:text-[var(--color-sidebar-hover-text)]",
            "transition-colors",
          )}
          aria-label="알림"
          aria-expanded={isNotificationOpen}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-coral-text)] rounded-full" />
        </button>

        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
            <div
              className={cn(
                "absolute right-0 top-full mt-2",
                "w-80 max-h-96",
                "rounded-md border border-[var(--color-content-border)] bg-[var(--color-bg-main)] shadow-lg overflow-y-auto z-20",
              )}
            >
              <div className="p-4 border-b border-[var(--color-content-border)]">
                <h3 className="text-sm font-semibold text-white">알림</h3>
              </div>

              <div className="p-2">
                <div className="p-3 text-sm text-[#94A3B8] text-center">
                  새로운 알림이 없습니다
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
