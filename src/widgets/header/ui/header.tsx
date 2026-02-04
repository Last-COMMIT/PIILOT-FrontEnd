"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  getRecentUnreadNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/features/notification";

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
  "/terms": "서비스 이용약관",
  "/privacy-policy": "개인정보 처리방침",
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
  const router = useRouter();
  const fromRouter = usePathname();
  const pathname =
    pathnameProp !== undefined ? pathnameProp : (fromRouter ?? null);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    [],
  );
  const [hasUnread, setHasUnread] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const pageTitle = title || resolvePageTitle(pathname);

  // 드롭다운 열릴 때 데이터 fetch
  React.useEffect(() => {
    if (isNotificationOpen && !loading) {
      fetchNotificationData();
    }
  }, [isNotificationOpen]);

  const fetchNotificationData = async () => {
    setLoading(true);
    try {
      const response = await getRecentUnreadNotifications();
      if (response.success && response.result) {
        setNotifications(response.result);
        setHasUnread(response.result.some((n) => !n.isRead));
      } else {
        // API 실패 시 상태 초기화
        setNotifications([]);
        setHasUnread(false);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // 에러 발생 시 상태 초기화
      setNotifications([]);
      setHasUnread(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleClickOutside = () => {
    setIsNotificationOpen(false);
  };

  const handleNotificationItemClick = async (notification: NotificationItem) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      // 데이터 재조회
      fetchNotificationData();
    }

    // entityType에 따라 이동
    if (notification.entityType === "DB_PII_ISSUE") {
      router.push("/privacy/db/issues");
    } else if (notification.entityType === "FILE_PII_ISSUE") {
      router.push("/privacy/file/issues");
    } else if (notification.entityType === "DB_SCAN_HISTORY") {
      router.push("/privacy/db/list");
    } else if (notification.entityType === "FILE_SCAN_HISTORY") {
      router.push("/privacy/file/list");
    } else if (notification.entityType === "MASKING_LOG") {
      router.push("/privacy/file/masking");
    }

    setIsNotificationOpen(false);
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString("ko-KR");
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
          {hasUnread && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-coral-text)] rounded-full" />
          )}
        </button>

        {isNotificationOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={handleClickOutside} />
            <div
              className={cn(
                "absolute right-0 top-full mt-2",
                "w-96 max-h-[500px]",
                "rounded-md border border-[var(--color-content-border)] bg-[var(--color-bg-main)] shadow-lg overflow-y-auto z-20",
              )}
            >
              <div className="p-4 border-b border-[var(--color-content-border)]">
                <h3 className="text-sm font-semibold text-white">알림</h3>
              </div>

              <div className="p-2">
                {loading ? (
                  <div className="p-3 text-sm text-[#94A3B8] text-center">
                    로딩 중...
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationItemClick(notification)}
                        className={cn(
                          "p-3 rounded-md cursor-pointer",
                          "hover:bg-[var(--color-sidebar-hover-bg)]",
                          "transition-colors",
                          !notification.isRead &&
                            "bg-[var(--color-sidebar-hover-bg)]/50",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.isRead && (
                            <span className="w-2 h-2 mt-1.5 bg-[var(--color-coral-text)] rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm text-white truncate",
                                !notification.isRead && "font-semibold",
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-[#64748B] mt-2">
                              {formatTimestamp(notification.issuedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-[#94A3B8] text-center">
                    새로운 알림이 없습니다
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
