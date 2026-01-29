"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { deleteNotice, getNoticeById } from "../lib/storage";
import { useIsAdmin } from "../lib/useIsAdmin";

interface NoticeDetailPageProps {
  id: string;
}

export default function NoticeDetailPage({ id }: NoticeDetailPageProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const notice = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getNoticeById(id);
  }, [id]);

  if (!notice) {
    return (
      <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] p-6 text-sm text-[var(--color-text-light-gray)]">
          존재하지 않는 공지사항입니다.
        </div>
        <div className="mt-4">
          <Link href="/notice">
            <Button colorScheme="neutral" appearance="outline">
              목록
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    const ok = window.confirm("공지사항을 삭제할까요?");
    if (!ok) return;
    deleteNotice(notice.id);
    router.replace("/notice");
  };

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] h-full min-h-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[var(--color-content-border)]">
            <h2 className="text-lg font-semibold text-white break-words">
              {notice.title}
            </h2>
            <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-light-gray)]">
              <span>작성자: {notice.author}</span>
              <span>일자: {notice.createdAt}</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:auto] p-6">
            <div className="text-sm text-[var(--color-text-light-gray)] whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </div>
          </div>

          <div className="p-6 border-t border-[var(--color-content-border)] flex justify-end gap-2">
            <Link href="/notice">
              <Button colorScheme="neutral" appearance="outline">
                목록
              </Button>
            </Link>
            {isAdmin && (
              <Button
                colorScheme="destructive"
                appearance="outline"
                onClick={handleDelete}
              >
                삭제
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
