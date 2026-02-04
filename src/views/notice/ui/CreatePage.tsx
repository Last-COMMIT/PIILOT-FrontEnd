"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { createNotice } from "@/features/notice";
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
  const [saveLoading, setSaveLoading] = useState(false);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    if (title.trim().length > 100) {
      alert("제목은 최대 100자까지 입력 가능합니다.");
      return;
    }
    setSaveLoading(true);
    const res = await createNotice({
      title: title.trim(),
      content: content.trim(),
    });
    setSaveLoading(false);
    if (res.success && res.result) {
      router.replace(`/notice/${res.result.id}`);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6">
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="rounded-xl border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] h-full min-h-0 flex flex-col overflow-hidden">
          {/* 제목 영역 */}
          <div className="p-6 pb-5 border-b border-[var(--color-text-content-boarder)]">
            <div className="rounded-xl flex flex-col gap-3 border border-[var(--color-text-light-gray)] bg-[var(--color-bg-main)]/10 p-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요."
                colorScheme="main"
                className="text-white text-xl font-semibold placeholder:text-[var(--color-text-content-boarder)] border-0 border-b border-[var(--color-text-content-boarder)] rounded-none px-0 py-2 h-auto min-h-10 bg-transparent focus-visible:ring-0 focus-visible:border-[var(--color-main-bg)]"
              />
              <div className="flex items-center gap-6 text-sm text-[var(--color-text-light-gray)]">
                <span>작성자: 관리자</span>
                <span>일자: {createdAt}</span>
              </div>
            </div>
          </div>

          {/* 본문 영역 */}
          <div className="flex-1 min-h-0 overflow-hidden p-6 pt-0 pb-0 flex flex-col">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요."
              className="w-full flex-1 min-h-[200px] resize-none rounded-xl border border-[var(--color-text-light-gray)] bg-[var(--color-bg-main)]/20 p-5 text-base leading-relaxed text-white placeholder:text-[var(--color-text-light-gray)] focus:outline-none focus:border-[var(--color-main-bg)] focus:ring-0"
            />
          </div>
          <div className="pt-6 px-6 pb-6 flex justify-center gap-2">
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
              disabled={!canSubmit || saveLoading}
            >
              {saveLoading ? "저장 중…" : "저장"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
