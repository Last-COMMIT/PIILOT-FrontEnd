"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Modal, LoadingIndicator } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { getDbPiiIssueDetail } from "@/features/db-pii";
import type { DbPiiIssueDetail } from "@/features/db-pii";
import { formatDetectedAt } from "../lib/format";

type RiskLevel = "높음" | "중간" | "낮음";

const riskLevelToLabel: Record<string, RiskLevel> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

const getRiskLevelColor = (riskLevel: string): string => {
  const label = riskLevelToLabel[riskLevel] ?? riskLevel;
  switch (label) {
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

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issueId: number | null;
}

export default function IssueDetailModal({
  open,
  onClose,
  issueId,
}: IssueDetailModalProps) {
  const [detail, setDetail] = useState<DbPiiIssueDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!open || issueId == null) {
      const id = setTimeout(() => {
        if (cancelled) return;
        setDetail(null);
        setError(null);
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(id);
      };
    }
    const id = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    }, 0);
    getDbPiiIssueDetail(issueId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.result) {
          setDetail(res.result);
          setError(null);
        } else {
          setDetail(null);
          setError(res.message ?? "상세 정보를 불러오지 못했습니다.");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setDetail(null);
        setError("상세 정보를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [open, issueId]);

  const riskLevelLabel = detail
    ? riskLevelToLabel[detail.riskLevel] ?? detail.riskLevel
    : "";

  const firstGridFields = detail
    ? [
        { label: "테이블 명", value: detail.tableName },
        { label: "컬럼명", value: detail.columnName },
        { label: "개인정보 유형", value: detail.piiTypeName },
        {
          label: "위험도",
          value: riskLevelLabel,
          className: cn(
            "font-semibold text-sm",
            getRiskLevelColor(detail.riskLevel),
          ),
        },
      ]
    : [];

  const secondGridFields = detail
    ? [
        {
          label: "보안필요 레코드 수 / 총 레코드 수",
          value: `${detail.unencryptedCount.toLocaleString()}건 / ${detail.totalRecordsCount.toLocaleString()}건`,
          className: "tabular-nums",
        },
        {
          label: "스캔 일시",
          value: formatDetectedAt(detail.detectedAt),
        },
      ]
    : [];

  const thirdGridFields = detail
    ? [
        { label: "담당자", value: detail.managerName },
        { label: "담당자 이메일", value: detail.managerEmail },
      ]
    : [];

  const records = (detail?.unencryptedRecords ?? []).slice().sort((a, b) =>
    a.primaryKey.localeCompare(b.primaryKey, undefined, { numeric: true }),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="개인정보 이슈 상세"
      size="wide"
      className="max-w-5xl !max-h-[80vh]"
    >
      <div className="flex flex-col gap-5 px-4 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-white">
            <LoadingIndicator size="lg" aria-label="로딩 중" />
          </div>
        ) : error ? (
          <p className="py-6 text-center text-[var(--color-coral-text)]">
            {error}
          </p>
        ) : detail ? (
          <>
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
                          primaryKey
                        </th>
                        <th className="px-4 py-3 text-left border-b border-[var(--color-content-border)]">
                          value
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-6 text-center text-[var(--color-text-light-gray)]"
                          >
                            비암호화 데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        records.map((row, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-[var(--color-content-border)] last:border-b-0"
                          >
                            <td className="px-4 py-3 text-white border-r border-[var(--color-content-border)] tabular-nums">
                              {row.primaryKey}
                            </td>
                            <td className="px-4 py-3 text-white">{row.value}</td>
                          </tr>
                        ))
                      )}
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
                      {detail.connectionName} ({detail.dbmsTypeName})
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                    {firstGridFields.map((field, index) => (
                      <div key={index}>
                        <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                          {field.label}
                        </p>
                        <p
                          className={cn(
                            "text-white font-semibold text-sm",
                            field.className,
                          )}
                        >
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                    {secondGridFields.map((field, index) => (
                      <div key={index}>
                        <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                          {field.label}
                        </p>
                        <p
                          className={cn(
                            "text-white font-semibold text-sm",
                            field.className,
                          )}
                        >
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                    {thirdGridFields.map((field, index) => (
                      <div key={index}>
                        <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                          {field.label}
                        </p>
                        <p className="text-white font-semibold text-sm">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
