"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, Lock, FileText, Folder } from "lucide-react";
import { StatCard, Table, Button, TableSection } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import IssueDetailModal from "./IssueDetailModal";
import {
  getFilePiiIssues,
  patchFilePiiIssueStatus,
} from "@/features/file-pii";
import type {
  FilePiiIssueConnectionGroup,
  FilePiiIssueItem,
  FilePiiIssuesStats,
} from "@/features/file-pii";

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
  fileName: string;
  filePath: string;
  personalInfoType: string;
  personalInfoCount: number;
  riskLevel: RiskLevel;
  workStatus: WorkStatus;
}

interface ConnectionIssue {
  id: string;
  connectionId: number;
  connectionName: string;
  serverType: string;
  manager: string;
  issueCount: number;
  files: IssueColumn[];
}

function apiGroupToConnectionIssue(g: FilePiiIssueConnectionGroup): ConnectionIssue {
  return {
    id: String(g.connectionId),
    connectionId: g.connectionId,
    connectionName: g.connectionName,
    serverType: g.serverTypeName,
    manager: g.managerName,
    issueCount: g.issueCount,
    files: g.issues.map((item: FilePiiIssueItem) => ({
      id: String(item.issueId),
      issueId: item.issueId,
      fileName: item.fileName,
      filePath: item.filePath,
      personalInfoType: item.piiTypes.join(", "),
      personalInfoCount: item.totalPiiCount,
      riskLevel: riskLevelToLabel[item.riskLevel] ?? "높음",
      workStatus: userStatusToLabel[item.userStatus] ?? "진행시작",
    })),
  };
}

const PAGE_SIZE = 10;

/** 백엔드에 10-1 API 미구현 시 반환하는 메시지. 이 경우 빈 목록으로 처리 */
const NOT_IMPLEMENTED_PATTERN = /no static resource|api\/file-pii\/issues/i;

export default function FilePrivacyIssuesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [connectionIssues, setConnectionIssues] = useState<ConnectionIssue[]>([]);
  const [stats, setStats] = useState<FilePiiIssuesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiNotReady, setApiNotReady] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<number | null>(null);

  // URL 쿼리 파라미터에서 issueId 읽기
  useEffect(() => {
    const id = setTimeout(() => {
      const issueIdParam = searchParams.get("issueId");
      if (issueIdParam) {
        const issueId = parseInt(issueIdParam, 10);
        if (!Number.isNaN(issueId)) {
          setSelectedIssueId(issueId);
          return;
        }
      }
      setSelectedIssueId(null);
    }, 0);
    return () => clearTimeout(id);
  }, [searchParams]);

  const loadIssues = useCallback(
    async (pageNum: number, append: boolean): Promise<boolean> => {
      const res = await getFilePiiIssues({ page: pageNum, size: PAGE_SIZE });
      if (!res.success) {
        const msg = res.message ?? "";
        if (NOT_IMPLEMENTED_PATTERN.test(msg)) {
          setApiNotReady(true);
          setError(null);
          if (!append) setConnectionIssues([]);
          setStats(null);
          setHasNext(false);
          return false;
        }
        setApiNotReady(false);
        setError(msg || "이슈 목록을 불러오지 못했습니다.");
        if (!append) setConnectionIssues([]);
        setHasNext(false);
        return false;
      }
      setApiNotReady(false);
      setError(null);
      if (res.result) {
        const rawContent = res.result.content;
        // 명세: result.content = { content: [], hasNext, ... }. 일부 백엔드는 result.content = [] 로 보낼 수 있음
        const contentArray: FilePiiIssueConnectionGroup[] = Array.isArray(rawContent)
          ? rawContent
          : Array.isArray((rawContent as { content?: FilePiiIssueConnectionGroup[] })?.content)
            ? (rawContent as { content: FilePiiIssueConnectionGroup[] }).content
            : [];
        const list = contentArray
          .filter(
            (g): g is FilePiiIssueConnectionGroup =>
              g != null &&
              typeof g.connectionId === "number" &&
              Array.isArray(g.issues),
          )
          .map(apiGroupToConnectionIssue);
        if (append) {
          setConnectionIssues((prev) => [...prev, ...list]);
        } else {
          setConnectionIssues(list);
        }
        setStats(res.result.stats ?? null);
        const slice =
          rawContent && !Array.isArray(rawContent)
            ? (rawContent as { hasNext?: boolean })
            : null;
        setHasNext(Boolean(slice?.hasNext));
        return true;
      }
      if (!append) setConnectionIssues([]);
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

  const handleLoadMore = async () => {
    if (loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const success = await loadIssues(nextPage, true);
      if (success) setPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkStatusClick = async (
    connectionId: number,
    issueId: number,
    currentStatus: WorkStatus,
  ) => {
    if (statusChangingId === issueId) return;
    if (currentStatus === "해결완료") return; // 이미 완료된 상태
    const nextStatus: WorkStatus =
      currentStatus === "진행시작" ? "진행중" : "해결완료";
    const apiStatus = workStatusToApi[nextStatus];
    setStatusChangingId(issueId);
    try {
      const res = await patchFilePiiIssueStatus(issueId, {
        userStatus: apiStatus,
      });
      if (res.success && res.result) {
        setConnectionIssues((prev) =>
          prev.map((conn) => {
            if (conn.connectionId !== connectionId) return conn;
            return {
              ...conn,
              files: conn.files.map((file) => {
                if (file.issueId !== issueId) return file;
                return { ...file, workStatus: nextStatus };
              }),
            };
          }),
        );
      } else {
        alert(res.message || "작업 상태 변경에 실패했습니다.");
      }
    } catch (e) {
      alert("작업 상태 변경 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setStatusChangingId(null);
    }
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

  const getFileColumns = (issue: ConnectionIssue): TableColumn<IssueColumn>[] => [
    {
      id: "fileName",
      label: "파일명",
      width: "1fr",
      align: "left",
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      id: "filePath",
      label: "파일 경로",
      width: "1.5fr",
      align: "left",
      render: (value) => <span>{value as string}</span>,
    },
    {
      id: "personalInfoType",
      label: "개인정보 유형",
      width: "1.5fr",
      align: "left",
      render: (value) => (
        <span className="truncate block" title={value as string}>
          {value as string}
        </span>
      ),
    },
    {
      id: "personalInfoCount",
      label: "총 개인정보 수",
      width: "0.7fr",
      align: "left",
      render: (value) => (
        <span className="tabular-nums">
          {((value as number) ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "0.7fr",
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
        const isChanging = statusChangingId === row.issueId;
        return (
          <Button
            size="sm"
            colorScheme={btn.colorScheme}
            appearance={btn.appearance}
            className={cn("min-w-[84px]", extraClass)}
            onClick={() =>
              handleWorkStatusClick(issue.connectionId, row.issueId, status)
            }
            disabled={isChanging}
          >
            {isChanging ? "변경 중..." : status}
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
          onClick={() => setSelectedIssueId(row.issueId)}
        >
          상세보기
        </button>
      ),
    },
  ];

  if (loading && connectionIssues.length === 0) {
    return (
      <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
        <div className="flex items-center justify-center h-full">
          <p className="text-[var(--color-text-light-gray)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (apiNotReady) {
    return (
      <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
        <div className="flex items-center justify-center h-full">
          <p className="text-[var(--color-text-light-gray)]">
            이슈 API가 준비되면 데이터가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
        <div className="flex items-center justify-center h-full">
          <p className="text-[var(--color-text-light-gray)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="grid grid-cols-5 gap-4 shrink-0">
        <StatCard
          title="총 이슈 파일"
          value={stats?.totalIssues ?? 0}
          icon={<AlertTriangle className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="위험도 높음"
          value={stats?.highRiskCount ?? 0}
          icon={<Lock className="size-5" />}
          colorScheme="coral"
        />
        <StatCard
          title="위험도 중간"
          value={stats?.mediumRiskCount ?? 0}
          icon={<Lock className="size-5" />}
          colorScheme="warning"
        />
        <StatCard
          title="위험도 낮음"
          value={stats?.lowRiskCount ?? 0}
          icon={<Lock className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 개인정보 수"
          value={(stats?.totalPiiCount ?? 0).toLocaleString()}
          icon={<FileText className="size-5" />}
          colorScheme="mint"
        />
      </div>

      {/* Only contents scroll; title stays fixed */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
          파일서버별 암호화 이슈
        </h2>
        <div className="flex-1 min-h-0 overflow-y-auto pr-0">
          <div className="flex flex-col gap-3 pb-2">
            {connectionIssues.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[var(--color-text-light-gray)]">
                  이슈가 없습니다.
                </p>
              </div>
            ) : (
              <>
                {connectionIssues.map((issue) => (
                  <TableSection
                    key={issue.id}
                    icon={<Folder className="size-5" />}
                    title={issue.connectionName}
                    meta={issue.serverType}
                    badge={`${issue.issueCount}개 이슈`}
                    badgeVariant="plain"
                  >
                    <Table
                      columns={getFileColumns(issue)}
                      data={issue.files}
                      scrollable={false}
                      className="border-0 rounded-t-none"
                    />
                  </TableSection>
                ))}
                {hasNext && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loading}
                      colorScheme="main"
                      appearance="solid"
                    >
                      {loading ? "로딩 중..." : "더보기"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedIssueId != null && (
        <IssueDetailModal
          open={selectedIssueId != null}
          onClose={() => {
            setSelectedIssueId(null);
            // URL 쿼리 파라미터 제거
            router.push("/privacy/file/issues");
          }}
          issueId={selectedIssueId}
        />
      )}
    </div>
  );
}
