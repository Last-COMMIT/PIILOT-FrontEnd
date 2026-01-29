"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { createNotice } from "../lib/storage";
import { useIsAdmin } from "../lib/useIsAdmin";

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export default function NoticeCreatePage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [createdAt] = useState(() => formatDate(new Date()));

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    const created = createNotice({
      title: title.trim(),
      content: content.trim(),
      author: isAdmin ? "관리자" : "사용자",
      createdAt: createdAt || formatDate(new Date()),
    });
    router.replace(`/notice/${created.id}`);
  };

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] h-full min-h-0 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[var(--color-content-border)]">
            <div className="flex flex-col gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요."
                colorScheme="main"
                className="text-white text-lg font-semibold placeholder:text-[var(--color-text-light-gray)] px-4 py-4 h-10"
              />
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-light-gray)]">
                <span>작성자: {isAdmin ? "관리자" : "사용자"}</span>
                <span>일자: {createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden p-6 pb-0">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요."
              className="w-full h-full min-h-0 resize-none rounded-lg border border-[var(--color-content-border)] bg-[var(--color-bg-main)]/20 p-4 text-sm text-white placeholder:text-[var(--color-text-light-gray)] focus:outline-none focus:border-[var(--color-main-bg)] focus:ring-0"
            />
          </div>

          <div className="pt-6 px-6 pb-6 flex justify-end gap-2">
            <Button
              colorScheme="neutral"
              appearance="outline"
              onClick={() => router.push("/notice")}
            >
              취소
            </Button>
            <Button
              colorScheme="main"
              appearance="solid"
              onClick={handleSave}
              disabled={!canSubmit}
            >
              저장
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
