"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Lock, FileText, Database } from "lucide-react";
import { StatCard, Table, Button, TableSection } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import IssueDetailModal from "./IssueDetailModal";

type RiskLevel = "높음" | "중간" | "낮음";
type WorkStatus = "진행중" | "해결완료" | "진행시작";

interface IssueColumn extends Record<string, unknown> {
  id: string;
  columnName: string;
  personalInfoType: string;
  recordCount: number;
  riskLevel: RiskLevel;
  workStatus: WorkStatus;
}

interface TableIssue {
  id: string;
  tableName: string;
  dbConnection: string;
  manager: string;
  issueCount: number;
  columns: IssueColumn[];
}

const generateMockIssues = (): TableIssue[] => {
  return [
    {
      id: "users",
      tableName: "users",
      dbConnection: "운영 DB (PostgreSQL)",
      manager: "홍길동 대리",
      issueCount: 1,
      columns: [
        {
          id: "users-email",
          columnName: "email",
          personalInfoType: "이메일",
          recordCount: 125_000,
          riskLevel: "낮음",
          workStatus: "진행중",
        },
      ],
    },
    {
      id: "orders",
      tableName: "orders",
      dbConnection: "운영 DB (PostgreSQL)",
      manager: "김철수 대리",
      issueCount: 2,
      columns: [
        {
          id: "orders-delivery_address",
          columnName: "delivery_address",
          personalInfoType: "주소",
          recordCount: 89_000,
          riskLevel: "높음",
          workStatus: "진행중",
        },
        {
          id: "orders-phone_number",
          columnName: "phone_number",
          personalInfoType: "전화번호",
          recordCount: 125_000,
          riskLevel: "중간",
          workStatus: "해결완료",
        },
      ],
    },
    {
      id: "customer_backup",
      tableName: "customer_backup",
      dbConnection: "운영 DB (PostgreSQL)",
      manager: "이순신 과장",
      issueCount: 1,
      columns: [
        {
          id: "customer_backup-email",
          columnName: "email",
          personalInfoType: "이메일",
          recordCount: 7_000,
          riskLevel: "낮음",
          workStatus: "진행시작",
        },
      ],
    },
    {
      id: "payments",
      tableName: "payments",
      dbConnection: "레거시 시스템 (Oracle)",
      manager: "박영희 대리",
      issueCount: 3,
      columns: [
        {
          id: "payments-card_number",
          columnName: "card_number",
          personalInfoType: "계좌번호",
          recordCount: 45_000,
          riskLevel: "높음",
          workStatus: "진행시작",
        },
        {
          id: "payments-ssn",
          columnName: "ssn",
          personalInfoType: "주민등록번호",
          recordCount: 32_000,
          riskLevel: "높음",
          workStatus: "진행중",
        },
        {
          id: "payments-name",
          columnName: "name",
          personalInfoType: "이름",
          recordCount: 78_000,
          riskLevel: "중간",
          workStatus: "해결완료",
        },
      ],
    },
    {
      id: "employees",
      tableName: "employees",
      dbConnection: "고객 DB (MySQL)",
      manager: "최민수 과장",
      issueCount: 2,
      columns: [
        {
          id: "employees-phone",
          columnName: "phone",
          personalInfoType: "전화번호",
          recordCount: 156_000,
          riskLevel: "중간",
          workStatus: "진행중",
        },
        {
          id: "employees-address",
          columnName: "address",
          personalInfoType: "주소",
          recordCount: 98_000,
          riskLevel: "낮음",
          workStatus: "진행시작",
        },
      ],
    },
  ];
};

export default function DbPrivacyIssuesPage() {
  const [issues, setIssues] = useState<TableIssue[]>(generateMockIssues());
  const [selected, setSelected] = useState<{
    issueId: string;
    columnId: string;
  } | null>(null);

  const stats = useMemo(() => {
    let totalColumns = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    issues.forEach((issue) => {
      totalColumns += issue.columns.length;
      issue.columns.forEach((col) => {
        if (col.riskLevel === "높음") highRisk++;
        else if (col.riskLevel === "중간") mediumRisk++;
        else if (col.riskLevel === "낮음") lowRisk++;
      });
    });

    return {
      totalColumns,
      highRisk,
      mediumRisk,
      lowRisk,
      totalPersonalInfo: 3630,
    };
  }, [issues]);

  const handleCloseModal = () => {
    setSelected(null);
  };

  const selectedIssue = useMemo(() => {
    if (!selected) return null;
    return issues.find((i) => i.id === selected.issueId) ?? null;
  }, [issues, selected]);

  const selectedColumn = useMemo(() => {
    if (!selected || !selectedIssue) return null;
    return (
      selectedIssue.columns.find((c) => c.id === selected.columnId) ?? null
    );
  }, [selected, selectedIssue]);

  const handleRowDetailClick = (issueId: string, columnId: string) => {
    setSelected({ issueId, columnId });
  };

  const handleWorkStatusClick = (issueId: string, columnId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        return {
          ...issue,
          columns: issue.columns.map((col) => {
            if (col.id !== columnId) return col;
            const next: WorkStatus =
              col.workStatus === "진행시작"
                ? "진행중"
                : col.workStatus === "진행중"
                  ? "해결완료"
                  : "해결완료";
            return { ...col, workStatus: next };
          }),
        };
      }),
    );
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
      render: (value) => <span>{value as string}</span>,
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
        return (
          <Button
            size="sm"
            colorScheme={btn.colorScheme}
            appearance={btn.appearance}
            className={cn("min-w-[84px]", extraClass)}
            onClick={() => handleWorkStatusClick(issue.id, row.id)}
          >
            {status}
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
          onClick={() => handleRowDetailClick(issue.id, row.id)}
        >
          상세보기
        </button>
      ),
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="grid grid-cols-5 gap-4 shrink-0">
        <StatCard
          title="총 이슈 컬럼"
          value={stats.totalColumns}
          icon={<AlertTriangle className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="위험도 높음"
          value={stats.highRisk}
          icon={<Lock className="size-5" />}
          colorScheme="coral"
        />
        <StatCard
          title="위험도 중간"
          value={stats.mediumRisk}
          icon={<Lock className="size-5" />}
          colorScheme="warning"
        />
        <StatCard
          title="위험도 낮음"
          value={stats.lowRisk}
          icon={<Lock className="size-5" />}
          colorScheme="green"
        />
        <StatCard
          title="총 개인정보 수"
          value={stats.totalPersonalInfo.toLocaleString()}
          icon={<FileText className="size-5" />}
          colorScheme="mint"
        />
      </div>

      {/* Only contents scroll; title stays fixed */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
          테이블별 암호화 이슈
        </h2>
        <div className="flex-1 min-h-0 overflow-y-auto pr-0">
          <div className="flex flex-col gap-3 pb-2">
            {issues.map((issue) => (
              <TableSection
                key={issue.id}
                icon={<Database className="size-5" />}
                title={issue.tableName}
                meta={`${issue.dbConnection}`}
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
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailModal
          open={selected != null}
          onClose={handleCloseModal}
          issue={selectedIssue}
          column={selectedColumn}
        />
      )}
    </div>
  );
}
