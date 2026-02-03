"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, Lock, FileText, Database } from "lucide-react";
import { StatCard, Table, Button, TableSection } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import IssueDetailModal from "./IssueDetailModal";
import {
  getDbPiiIssues,
  patchDbPiiIssueStatus,
} from "@/features/db-pii";
import type {
  DbPiiIssueTableGroup,
  DbPiiIssueItem,
  DbPiiIssuesStats,
} from "@/features/db-pii";

type RiskLevel = "높음" | "중간" | "낮음";
type WorkStatus = "진행중" | "해결완료" | "진행시작";

const riskLevelToLabel: Record<string, RiskLevel> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

const userStatusToLabel: Record<string, WorkStatus> = {
  ISSUE: "진행시작",
  RUNNING: "진행중",
  DONE: "해결완료",
};

const workStatusToApi: Record<WorkStatus, "ISSUE" | "RUNNING" | "DONE"> = {
  진행시작: "ISSUE",
  진행중: "RUNNING",
  해결완료: "DONE",
};

interface IssueColumn extends Record<string, unknown> {
  id: string;
  issueId: number;
  columnName: string;
  personalInfoType: string;
  recordCount: number;
  riskLevel: RiskLevel;
  workStatus: WorkStatus;
}

interface TableIssue {
  id: string;
  tableId: number;
  tableName: string;
  dbConnection: string;
  issueCount: number;
  columns: IssueColumn[];
}

function apiGroupToTableIssue(g: DbPiiIssueTableGroup): TableIssue {
  return {
    id: String(g.tableId),
    tableId: g.tableId,
    tableName: g.tableName,
    dbConnection: `${g.connectionName} (${g.dbmsTypeName})`,
    issueCount: g.issueCount,
    columns: g.issues.map((item: DbPiiIssueItem) => ({
      id: String(item.issueId),
      issueId: item.issueId,
      columnName: item.columnName,
      personalInfoType: item.piiTypeName,
      recordCount: item.totalRecordsCount,
      riskLevel: riskLevelToLabel[item.riskLevel] ?? "낮음",
      workStatus: userStatusToLabel[item.userStatus] ?? "진행시작",
    })),
  };
}

const PAGE_SIZE = 10;

/** 백엔드에 6-1 API 미구현 시 반환하는 메시지. 이 경우 빈 목록으로 처리 */
const NOT_IMPLEMENTED_PATTERN = /no static resource|api\/db-pii\/issues/i;

export default function DbPrivacyIssuesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tableIssues, setTableIssues] = useState<TableIssue[]>([]);
  const [stats, setStats] = useState<DbPiiIssuesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiNotReady, setApiNotReady] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<number | null>(null);

  // URL 쿼리 파라미터에서 issueId 읽기
  useEffect(() => {
    const issueIdParam = searchParams.get("issueId");
    if (issueIdParam) {
      const issueId = parseInt(issueIdParam, 10);
      if (!Number.isNaN(issueId)) {
        setSelectedIssueId(issueId);
      }
    }
  }, [searchParams]);

  const loadIssues = useCallback(
    async (pageNum: number, append: boolean): Promise<boolean> => {
      const res = await getDbPiiIssues({ page: pageNum, size: PAGE_SIZE });
      if (!res.success) {
        const msg = res.message ?? "";
        if (NOT_IMPLEMENTED_PATTERN.test(msg)) {
          setApiNotReady(true);
          setError(null);
          if (!append) setTableIssues([]);
          setStats(null);
          setHasNext(false);
          return false;
        }
        setApiNotReady(false);
        setError(msg || "이슈 목록을 불러오지 못했습니다.");
        if (!append) setTableIssues([]);
        setHasNext(false);
        return false;
      }
      setApiNotReady(false);
      setError(null);
      if (res.result) {
        const rawContent = res.result.content;
        // 명세: result.content = { content: [], hasNext, ... }. 일부 백엔드는 result.content = [] 로 보낼 수 있음
        const contentArray: DbPiiIssueTableGroup[] = Array.isArray(rawContent)
          ? rawContent
          : Array.isArray((rawContent as { content?: DbPiiIssueTableGroup[] })?.content)
            ? (rawContent as { content: DbPiiIssueTableGroup[] }).content
            : [];
        const list = contentArray
          .filter(
            (g): g is DbPiiIssueTableGroup =>
              g != null &&
              typeof g.tableId === "number" &&
              Array.isArray(g.issues),
          )
          .map(apiGroupToTableIssue);
        if (append) {
          setTableIssues((prev) => [...prev, ...list]);
        } else {
          setTableIssues(list);
        }
        setStats(res.result.stats ?? null);
        const slice =
          rawContent && !Array.isArray(rawContent)
            ? (rawContent as { hasNext?: boolean })
            : null;
        setHasNext(Boolean(slice?.hasNext));
        return true;
      }
      if (!append) setTableIssues([]);
      setStats(null);
      setHasNext(false);
      return false;
    },
    [],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      loadIssues(0, false).finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(id);
  }, [loadIssues]);

  const handleCloseModal = () => {
    setSelectedIssueId(null);
    // URL 쿼리 파라미터 제거
    router.push("/privacy/db/issues");
  };

  const handleRowDetailClick = (issueId: number) => {
    setSelectedIssueId(issueId);
  };

  const getNextUserStatus = (
    current: WorkStatus,
  ): "RUNNING" | "DONE" => {
    if (current === "진행시작") return "RUNNING";
    return "DONE";
  };

  const handleWorkStatusClick = async (issueId: number) => {
    const col = tableIssues
      .flatMap((t) => t.columns)
      .find((c) => c.issueId === issueId);
    if (!col || col.workStatus === "해결완료") return;
    const nextStatus = getNextUserStatus(col.workStatus);
    setStatusChangingId(issueId);
    const res = await patchDbPiiIssueStatus(issueId, {
      userStatus: nextStatus,
    });
    setStatusChangingId(null);
    if (res.success) {
      setTableIssues((prev) =>
        prev.map((t) => ({
          ...t,
          columns: t.columns.map((c) =>
            c.issueId === issueId
              ? {
                  ...c,
                  workStatus:
                    nextStatus === "RUNNING" ? "진행중" : "해결완료",
                }
              : c,
          ),
        })),
      );
    } else {
      alert(res.message ?? "상태 변경에 실패했습니다.");
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoading(true);
    loadIssues(nextPage, true)
      .then((ok) => {
        if (ok) setPage(nextPage);
      })
      .finally(() => setLoading(false));
  };

  const getWorkStatusButtonProps = (status: WorkStatus) => {
    switch (status) {
      case "진행중":
        return { colorScheme: "main" as const, appearance: "solid" as const };
      case "해결완료":
        return {
          colorScheme: "neutral" as const,
          appearance: "solid" as const,
        };
      case "진행시작":
        return { colorScheme: "green" as const, appearance: "solid" as const };
      default:
        return { colorScheme: "main" as const, appearance: "solid" as const };
    }
  };

  const totalIssues = stats?.totalIssues ?? 0;
  const highRisk = stats?.highRiskCount ?? 0;
  const mediumRisk = stats?.mediumRiskCount ?? 0;
  const lowRisk = stats?.lowRiskCount ?? 0;
  const totalRecords = stats?.totalRecords ?? 0;

  const getIssueColumns = (issue: TableIssue): TableColumn<IssueColumn>[] => [
    {
      id: "columnName",
      label: "컬럼명",
      width: "1fr",
      align: "left",
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      id: "personalInfoType",
      label: "개인정보 유형",
      width: "1fr",
      align: "left",
      render: (value) => (
        <span className="truncate block" title={value as string}>
          {value as string}
        </span>
      ),
    },
    {
      id: "recordCount",
      label: "레코드 수",
      width: "1fr",
      align: "left",
      render: (value) => (
        <span className="tabular-nums">
          {(value as number).toLocaleString()}
        </span>
      ),
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "1fr",
      align: "left",
      render: (value) => {
        const riskLevel = value as RiskLevel;
        const riskColors: Record<RiskLevel, string> = {
          높음: "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]",
          중간: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]",
          낮음: "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
        };
        return (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              riskColors[riskLevel],
            )}
          >
            {riskLevel}
          </span>
        );
      },
    },
    {
      id: "workStatus",
      label: "작업 상태",
      width: "1fr",
      align: "left",
      render: (value, row) => {
        const status = value as WorkStatus;
        const btn = getWorkStatusButtonProps(status);
        const extraClass =
          status === "진행시작"
            ? "bg-[var(--color-green-text)] text-black hover:opacity-90"
            : "";
        const isLoading = statusChangingId === row.issueId;
        return (
          <Button
            size="sm"
            colorScheme={btn.colorScheme}
            appearance={btn.appearance}
            className={cn("min-w-[84px]", extraClass)}
            disabled={isLoading || status === "해결완료"}
            onClick={() => handleWorkStatusClick(row.issueId)}
          >
            {isLoading ? "처리 중..." : status}
          </Button>
        );
      },
    },
    {
      id: "detail",
      label: "",
      align: "right",
      width: "90px",
      render: (_, row) => (
        <button
          type="button"
          className="cursor-pointer text-sm font-semibold text-white/90 hover:text-white hover:underline underline-offset-4"
          onClick={() => handleRowDetailClick(row.issueId)}
        >
          상세보기
        </button>
      ),
    },
  ];

  if (error && tableIssues.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-white">
        <p className="text-[var(--color-coral-text)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="grid grid-cols-5 gap-4 shrink-0">
        <StatCard
          title="총 이슈 컬럼"
          value={String(totalIssues)}
          icon={<AlertTriangle className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="위험도 높음"
          value={String(highRisk)}
          icon={<Lock className="size-5" />}
          colorScheme="coral"
        />
        <StatCard
          title="위험도 중간"
          value={String(mediumRisk)}
          icon={<Lock className="size-5" />}
          colorScheme="warning"
        />
        <StatCard
          title="위험도 낮음"
          value={String(lowRisk)}
          icon={<Lock className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 개인정보 수"
          value={totalRecords.toLocaleString()}
          icon={<FileText className="size-5" />}
          colorScheme="mint"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
          테이블별 암호화 이슈
        </h2>
        {loading && tableIssues.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white">
            <div
              className="size-10 rounded-full border-2 border-[var(--color-main-bg)] border-t-transparent animate-spin"
              aria-label="로딩 중"
            />
          </div>
        ) : tableIssues.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-white/70">
            {apiNotReady
              ? "이슈 API가 준비되면 데이터가 표시됩니다. (백엔드 6-1 API 구현 필요)"
              : "이슈가 없습니다."}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pr-0">
            <div className="flex flex-col gap-3 pb-2">
              {tableIssues.map((issue) => (
                <TableSection
                  key={issue.id}
                  icon={<Database className="size-5" />}
                  title={issue.tableName}
                  meta={issue.dbConnection}
                  badge={`${issue.issueCount}개 이슈`}
                  badgeVariant="plain"
                >
                  <Table
                    columns={getIssueColumns(issue)}
                    data={issue.columns}
                    className="border-0 rounded-t-none"
                  />
                </TableSection>
              ))}
            </div>
            {hasNext && (
              <div className="shrink-0 pt-3 flex justify-center pb-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-4 py-2 rounded-md border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] text-white text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "로딩 중..." : "더보기"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <IssueDetailModal
        open={selectedIssueId != null}
        onClose={handleCloseModal}
        issueId={selectedIssueId}
      />
    </div>
  );
}
