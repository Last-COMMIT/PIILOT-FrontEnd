"use client";

import { useState, useMemo } from "react";
import { AlertTriangle, Lock, FileText, Folder } from "lucide-react";
import { StatCard, Table, Button, TableSection } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import IssueDetailModal from "./IssueDetailModal";

type RiskLevel = "높음" | "중간" | "낮음";
type WorkStatus = "진행중" | "해결완료" | "진행시작";

interface FileIssue extends Record<string, unknown> {
  id: string;
  fileName: string;
  filePath: string;
  personalInfoCount: number;
  personalInfoType: string;
  riskLevel: RiskLevel;
  workStatus: WorkStatus;
}

interface FileServerIssue {
  id: string;
  serverName: string;
  serverType: string;
  manager: string;
  issueCount: number;
  files: FileIssue[];
}

const generateMockIssues = (): FileServerIssue[] => {
  return [
    {
      id: "s3-doc-1",
      serverName: "S3 Document Storage",
      serverType: "Amazon S3",
      manager: "홍길동 대리",
      issueCount: 1,
      files: [
        {
          id: "s3-doc-1-payment",
          fileName: "payment_capture.png",
          filePath: "desktop/payment/add",
          personalInfoCount: 5,
          personalInfoType: "이름, 전화번호",
          riskLevel: "낮음",
          workStatus: "진행중",
        },
      ],
    },
    {
      id: "s3-doc-2",
      serverName: "S3 Document Storage",
      serverType: "Amazon S3",
      manager: "김철수 대리",
      issueCount: 2,
      files: [
        {
          id: "s3-doc-2-profile",
          fileName: "profile_photo.png",
          filePath: "desktop/user/add",
          personalInfoCount: 9,
          personalInfoType:
            "이름, 주민번호, 주소, IP주소, 전화번호, 계좌번호, 이메일",
          riskLevel: "높음",
          workStatus: "진행중",
        },
        {
          id: "s3-doc-2-guide",
          fileName: "user_guide.txt",
          filePath: "desktop/user/add",
          personalInfoCount: 3,
          personalInfoType: "이름, 전화번호",
          riskLevel: "중간",
          workStatus: "해결완료",
        },
      ],
    },
    {
      id: "nas-legacy",
      serverName: "Legacy NAS Share",
      serverType: "Legacy NAS Share",
      manager: "이순신 과장",
      issueCount: 1,
      files: [
        {
          id: "nas-legacy-notice",
          fileName: "notice_content.docs",
          filePath: "desktop/notice/list",
          personalInfoCount: 2,
          personalInfoType: "이름, 전화번호",
          riskLevel: "낮음",
          workStatus: "진행중",
        },
      ],
    },
    {
      id: "azure-storage",
      serverName: "Azure Blob Storage",
      serverType: "Azure Blob Storage",
      manager: "박영희 대리",
      issueCount: 2,
      files: [
        {
          id: "azure-storage-contract",
          fileName: "contract_2024.pdf",
          filePath: "documents/legal/contracts",
          personalInfoCount: 12,
          personalInfoType: "이름, 주민번호, 주소, 계좌번호, 이메일, 전화번호",
          riskLevel: "높음",
          workStatus: "진행시작",
        },
        {
          id: "azure-storage-invoice",
          fileName: "invoice_january.xlsx",
          filePath: "documents/finance/invoices",
          personalInfoCount: 7,
          personalInfoType: "이름, 이메일, 전화번호, 계좌번호",
          riskLevel: "중간",
          workStatus: "진행중",
        },
      ],
    },
    {
      id: "gcp-storage",
      serverName: "Google Cloud Storage",
      serverType: "Google Cloud Storage",
      manager: "최민수 과장",
      issueCount: 3,
      files: [
        {
          id: "gcp-storage-resume",
          fileName: "employee_resume_2024.docx",
          filePath: "hr/recruitment/resumes",
          personalInfoCount: 15,
          personalInfoType: "이름, 주민번호, 주소, 전화번호, 이메일, 학력, 경력",
          riskLevel: "높음",
          workStatus: "진행중",
        },
        {
          id: "gcp-storage-medical",
          fileName: "medical_record_backup.dat",
          filePath: "healthcare/records/backup",
          personalInfoCount: 8,
          personalInfoType: "이름, 주민번호, 진단정보, 처방전",
          riskLevel: "높음",
          workStatus: "해결완료",
        },
        {
          id: "gcp-storage-log",
          fileName: "access_log_2024.csv",
          filePath: "logs/security/access",
          personalInfoCount: 4,
          personalInfoType: "IP주소, 쿠키정보",
          riskLevel: "낮음",
          workStatus: "진행시작",
        },
      ],
    },
    {
      id: "local-nas",
      serverName: "Local NAS Server",
      serverType: "Local NAS Server",
      manager: "정수진 대리",
      issueCount: 1,
      files: [
        {
          id: "local-nas-backup",
          fileName: "customer_database_backup.sql",
          filePath: "backup/database/daily",
          personalInfoCount: 25,
          personalInfoType: "이름, 주민번호, 주소, 전화번호, 이메일, 계좌번호, 신용카드번호",
          riskLevel: "높음",
          workStatus: "진행중",
        },
      ],
    },
  ];
};

export default function FilePrivacyIssuesPage() {
  const [issues, setIssues] = useState<FileServerIssue[]>(generateMockIssues());
  const [selected, setSelected] = useState<{
    issueId: string;
    fileId: string;
  } | null>(null);

  const stats = useMemo(() => {
    let totalFiles = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;
    let totalPersonalInfo = 0;

    issues.forEach((issue) => {
      totalFiles += issue.files.length;
      issue.files.forEach((file) => {
        totalPersonalInfo += file.personalInfoCount;
        if (file.riskLevel === "높음") highRisk++;
        else if (file.riskLevel === "중간") mediumRisk++;
        else if (file.riskLevel === "낮음") lowRisk++;
      });
    });

    return {
      totalFiles,
      highRisk,
      mediumRisk,
      lowRisk,
      totalPersonalInfo,
    };
  }, [issues]);

  const handleCloseModal = () => {
    setSelected(null);
  };

  const selectedIssue = useMemo(() => {
    if (!selected) return null;
    return issues.find((i) => i.id === selected.issueId) ?? null;
  }, [issues, selected]);

  const selectedFile = useMemo(() => {
    if (!selected || !selectedIssue) return null;
    return selectedIssue.files.find((f) => f.id === selected.fileId) ?? null;
  }, [selected, selectedIssue]);

  const handleRowDetailClick = (issueId: string, fileId: string) => {
    setSelected({ issueId, fileId });
  };

  const handleWorkStatusClick = (issueId: string, fileId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        return {
          ...issue,
          files: issue.files.map((file) => {
            if (file.id !== fileId) return file;
            const next: WorkStatus =
              file.workStatus === "진행시작"
                ? "진행중"
                : file.workStatus === "진행중"
                  ? "해결완료"
                  : "해결완료";
            return { ...file, workStatus: next };
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

  const getFileColumns = (issue: FileServerIssue): TableColumn<FileIssue>[] => [
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
          {(value as number).toLocaleString()}
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
          title="총 이슈 파일"
          value={stats.totalFiles}
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
          파일서버별 암호화 이슈
        </h2>
        <div className="flex-1 min-h-0 overflow-y-auto pr-0">
          <div className="flex flex-col gap-3 pb-2">
            {issues.map((issue) => (
              <TableSection
                key={issue.id}
                icon={<Folder className="size-5" />}
                title={issue.serverName}
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
          </div>
        </div>
      </div>

      {selectedIssue && (
        <IssueDetailModal
          open={selected != null}
          onClose={handleCloseModal}
          issue={selectedIssue}
          file={selectedFile}
        />
      )}
    </div>
  );
}
