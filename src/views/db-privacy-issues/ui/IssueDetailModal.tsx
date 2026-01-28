"use client";

import { useMemo } from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

type RiskLevel = "높음" | "중간" | "낮음";

interface UnencryptedData extends Record<string, unknown> {
  id: string;
  user_id: number;
  email: string;
}

interface IssueColumn {
  id: string;
  columnName: string;
  personalInfoType: string;
  recordCount: number;
  riskLevel: RiskLevel;
}

interface TableIssue {
  id: string;
  tableName: string;
  dbConnection: string;
  manager: string;
  issueCount: number;
  columns: IssueColumn[];
}

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issue: TableIssue;
  column: IssueColumn | null;
}

const generateUnencryptedData = (issue: TableIssue): UnencryptedData[] => {
  void issue;
  return [
    { id: "0", user_id: 0, email: "honggildong@naver.com" },
    { id: "1", user_id: 1, email: "minsu.kim@gmail.com" },
    { id: "2", user_id: 2, email: "jiyoon.lee@hanmail.net" },
    { id: "3", user_id: 3, email: "yuna.park@gmail.com" },
    { id: "4", user_id: 4, email: "seojun95@naver.com" },
    { id: "5", user_id: 5, email: "hyejin.k@daum.net" },
    { id: "6", user_id: 6, email: "chulsoo123@gmail.com" },
    { id: "7", user_id: 7, email: "bora_lee@naver.com" },
    { id: "8", user_id: 8, email: "junyoung.kim@gmail.com" },
    { id: "9", user_id: 9, email: "somin88@hanmail.net" },
  ];
};

const getRiskLevelColor = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case "높음":
      return "text-[var(--color-coral-text)]";
    case "중간":
      return "text-[var(--color-yellow-text)]";
    case "낮음":
      return "text-[var(--color-green-text)]";
    default:
      return "text-[var(--color-text-light-gray)]";
  }
};

export default function IssueDetailModal({
  open,
  onClose,
  issue,
  column,
}: IssueDetailModalProps) {
  const unencryptedData = useMemo(
    () => generateUnencryptedData(issue),
    [issue],
  );

  const selectedColumn = column ?? issue.columns[0];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="개인정보 이슈 상세"
      size="wide"
      className="max-w-5xl !max-h-[80vh]"
    >
      <div className="flex flex-col gap-5 px-4 py-2">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-coral-bg)]/15 border border-[var(--color-coral-border)]">
          <Lock className="size-5 shrink-0 text-[var(--color-coral-text)] mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-coral-text)] mb-1">
              암호화되지 않은 개인정보
            </p>
            <p className="text-sm text-[var(--color-text-light-gray)]">
              이 컬럼의 개인정보는 평문으로 저장되어 있어 보안 위험이 있습니다.
              즉시 암호화 조치가 필요합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-white text-center">
              암호화되지 않은 데이터 목록
            </h3>
            <div className="rounded-lg border border-[var(--color-content-border)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-sidebar-bg)]">
                  <tr className="text-[var(--color-text-light-gray)]">
                    <th className="px-4 py-3 text-left border-b border-r border-[var(--color-content-border)] w-[110px]">
                      user_id
                    </th>
                    <th className="px-4 py-3 text-left border-b border-[var(--color-content-border)]">
                      email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unencryptedData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-content-border)] last:border-b-0"
                    >
                      <td className="px-4 py-3 text-white border-r border-[var(--color-content-border)] tabular-nums">
                        {row.user_id}
                      </td>
                      <td className="px-4 py-3 text-white">{row.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col pt-[30px] pb-6">
            <div className="space-y-7">
              <div>
                <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                  DB 연결
                </p>
                <p className="text-white font-semibold text-sm">
                  {issue.dbConnection}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    테이블 명
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {issue.tableName}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    컬럼명
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {selectedColumn.columnName}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    개인정보 유형
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {selectedColumn.personalInfoType}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    위험도
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      getRiskLevelColor(selectedColumn.riskLevel),
                    )}
                  >
                    {selectedColumn.riskLevel}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    보안필요 레코드 수 / 총 레코드 수
                  </p>
                  <p className="text-white font-semibold text-sm tabular-nums">
                    100건 / {selectedColumn.recordCount.toLocaleString()}건
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    스캔 일시
                  </p>
                  <p className="text-white font-semibold text-sm">
                    2025.01.13 19:30
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    담당자
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {issue.manager}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                    담당자 이메일
                  </p>
                  <p className="text-white font-semibold text-sm">
                    honggildong@naver.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
