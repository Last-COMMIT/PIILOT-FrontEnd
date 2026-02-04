"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Table, LoadingIndicator } from "@/shared/ui";
import { useIsAdmin } from "../lib/useIsAdmin";
import { getNoticeList } from "@/features/notice";
import type { NoticeListItem } from "@/features/notice";
import { formatNoticeDateShort } from "../lib/format";

/** API 목록 한 건 → 테이블 행 (authorName → author) */
interface NoticeRow {
  id: number;
  title: string;
  author: string;
  createdAt: string;
}

function mapListItem(row: NoticeListItem): NoticeRow {
  return {
    id: row.id,
    title: row.title,
    author: row.authorName ?? "",
    createdAt: row.createdAt ?? "",
  };
}

export default function NoticeListPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>(
    undefined,
  );
  const [data, setData] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await getNoticeList({ page: 0, size: 100 });
    setLoading(false);
    if (res.success && res.result) {
      setData(res.result.content.map(mapListItem));
    } else {
      const msg =
        res.message && res.message.includes("404")
          ? "공지사항 API를 찾을 수 없습니다. (404) 백엔드에 GET /api/notices 가 구현·등록되어 있는지 확인해 주세요."
          : res.message;
      setError(msg);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const columns = useMemo(
    () => [
      { id: "id", label: "번호", width: 0.6, align: "center" as const },
      {
        id: "title",
        label: "제목",
        width: 3.4,
        align: "left" as const,
        render: (value: unknown, row: NoticeRow) => (
          <span className="text-white">{String(value ?? row.title)}</span>
        ),
      },
      { id: "author", label: "작성자", width: 1.2, align: "center" as const },
      {
        id: "createdAt",
        label: "작성일자",
        width: 1.2,
        align: "center" as const,
        render: (_value: unknown, row: NoticeRow) => (
          <span>{formatNoticeDateShort(row.createdAt)}</span>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-white">
        <LoadingIndicator message="로딩 중…" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-white">
        <p>{error}</p>
        <Button
          type="button"
          colorScheme="main"
          appearance="outline"
          onClick={() => loadList()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="flex items-center justify-end gap-2 shrink-0">
        {isAdmin && (
          <Link href="/notice/new">
            <Button colorScheme="main" appearance="solid">
              글 작성
            </Button>
          </Link>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Table<NoticeRow>
          columns={columns}
          data={data}
          selectedRowIndex={selectedRowIndex}
          onRowClick={(row, index) => {
            setSelectedRowIndex(index);
            router.push(`/notice/${String(row.id)}`);
          }}
          maxBodyHeight="100%"
        />
      </div>
    </div>
  );
}
