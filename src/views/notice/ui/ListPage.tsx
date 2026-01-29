"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Table } from "@/shared/ui";
import { useIsAdmin } from "../lib/useIsAdmin";
import { getNotices, type NoticeItem } from "../lib/storage";
import { useEffect, useMemo, useState } from "react";

export default function NoticeListPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | undefined>(
    undefined,
  );

  const [data, setData] = useState<NoticeItem[]>([]);
  useEffect(() => {
    setData(getNotices());
  }, []);

  const columns = useMemo(
    () => [
      { id: "id", label: "번호", width: 0.6, align: "center" as const },
      {
        id: "title",
        label: "제목",
        width: 3.4,
        align: "left" as const,
        render: (value: unknown, row: NoticeItem) => (
          <span className="text-white">{String(value ?? row.title)}</span>
        ),
      },
      { id: "author", label: "작성자", width: 1.2, align: "center" as const },
      {
        id: "createdAt",
        label: "작성일자",
        width: 1.2,
        align: "center" as const,
      },
    ],
    [],
  );

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="flex items-center justify-end gap-2 shrink-0">
        <Link href="/notice/new">
          <Button colorScheme="main" appearance="solid">
            글 작성
          </Button>
        </Link>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Table<NoticeItem>
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
