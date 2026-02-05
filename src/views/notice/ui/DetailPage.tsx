"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, LoadingIndicator } from "@/shared/ui";
import { useIsAdmin } from "../lib/useIsAdmin";
import {
  getNoticeDetail,
  deleteNotice,
  type NoticeDetailItem,
} from "@/features/notice";
import { formatNoticeDate } from "../lib/format";

interface NoticeDetailPageProps {
  id: string;
}

export default function NoticeDetailPage({ id }: NoticeDetailPageProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [notice, setNotice] = useState<NoticeDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const idTimer = setTimeout(() => {
      const numId = Number(id);
      if (Number.isNaN(numId) || numId < 1) {
        setLoading(false);
        setError("잘못된 공지사항 ID입니다.");
        return;
      }
      setLoading(true);
      setError(null);
      getNoticeDetail(numId).then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (res.success && res.result) {
          setNotice(res.result);
        } else {
          setError(res.message ?? "공지사항을 찾을 수 없습니다.");
        }
      });
    }, 0);
    return () => {
      clearTimeout(idTimer);
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!notice) return;
    const ok = window.confirm("공지사항을 삭제할까요?");
    if (!ok) return;
    setDeleteLoading(true);
    const res = await deleteNotice(notice.id);
    setDeleteLoading(false);
    if (res.success) {
      router.replace("/notice");
    } else {
      alert(res.message);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-white">
        <LoadingIndicator message="로딩 중…" size="lg" />
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] p-6 text-sm text-[var(--color-text-light-gray)]">
          {error ?? "존재하지 않는 공지사항입니다."}
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

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] h-full min-h-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[var(--color-content-border)]">
            <h2 className="text-lg font-semibold text-white break-words">
              {notice.title}
            </h2>
            <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-light-gray)]">
              <span>작성자: {notice.authorName}</span>
              <span>일자: {formatNoticeDate(notice.createdAt)}</span>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:auto] p-6">
            <div className="text-sm text-[var(--color-text-light-gray)] whitespace-pre-wrap leading-relaxed">
              {notice.content}
            </div>
          </div>

          <div className="p-6 border-t border-[var(--color-content-border)] flex justify-center gap-2">
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
                disabled={deleteLoading}
              >
                {deleteLoading ? "처리 중…" : "삭제"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
