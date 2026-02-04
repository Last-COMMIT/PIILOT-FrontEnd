"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Modal, LoadingIndicator } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { getFilePiiIssueDetail } from "@/features/file-pii";
import type { FilePiiIssueDetail } from "@/features/file-pii";

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

const formatDetectedAt = (isoString: string): string => {
  try {
    if (!isoString || typeof isoString !== "string") return "";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch {
    return isoString;
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
  const [detail, setDetail] = useState<FilePiiIssueDetail | null>(null);
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
    getFilePiiIssueDetail(issueId)
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
        { label: "파일명", value: detail.fileName },
        { label: "파일 유형", value: detail.fileCategoryName },
        {
          label: "검출된 개인정보 수",
          value: `${detail.totalPiiCount}건`,
          className: "tabular-nums",
        },
        {
          label: "위험도",
          value: riskLevelLabel,
          className: cn(
            "font-semibold text-sm",
            getRiskLevelColor(detail.riskLevel),
          ),
        },
        {
          label: "개인정보 유형",
          value: detail.piiDetails.map((p) => p.piiTypeName).join(", "),
          className: "break-words whitespace-normal",
        },
        {
          label: "스캔 일시",
          value: formatDetectedAt(detail.detectedAt),
        },
      ]
    : [];

  const secondGridFields = detail
    ? [
        {
          label: "마스킹된 개인정보 수",
          value: `${detail.maskedPiiCount.toLocaleString()}건`,
          className: "tabular-nums",
        },
        {
          label: "미마스킹 개인정보 수",
          value: `${detail.unmaskedPiiCount.toLocaleString()}건`,
          className: "tabular-nums",
        },
      ]
    : [];

  const thirdGridFields = detail
    ? [
        { label: "담당자", value: detail.managerName },
        { label: "담당자 이메일", value: detail.managerEmail },
      ]
    : [];

  const piiDetails = detail?.piiDetails ?? [];
  const previewAvailable = detail?.previewAvailable ?? false;
  const fileContent = detail?.fileContent;
  const previewMessage = detail?.previewMessage;
  const mimeType = detail?.mimeType ?? "";

  // 문서/미디어 타입 확인
  const isPdf = mimeType === "application/pdf";
  const isDocx =
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isAudio = mimeType.startsWith("audio/");

  const dataUrl =
    previewAvailable && fileContent
      ? `data:${mimeType};base64,${fileContent}`
      : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="개인정보 이슈 상세"
      size="wide"
      className="max-w-6xl !max-h-[98vh]"
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
                  마스킹되지 않은 개인정보
                </p>
                <p className="text-sm text-[var(--color-text-light-gray)]">
                  이 파일의 개인정보는 마스킹 처리되지 않아 보안 위험이 있습니다.
                  즉시 마스킹 조치가 필요합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* 왼쪽: 원본 파일 미리보기 */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-white text-center">
                  원본 파일
                </h3>
                <div className="rounded-lg border border-[var(--color-content-border)] overflow-hidden bg-[var(--color-sidebar-bg)]">
                  {previewAvailable && fileContent ? (
                    <div className="p-4 flex items-center justify-center min-h-[400px] max-h-[600px] overflow-auto">
                      {isPdf ? (
                        <iframe
                          src={dataUrl}
                          title={detail.fileName}
                          className="w-full min-h-[400px] h-[500px] rounded"
                        />
                      ) : isDocx ? (
                        <img
                          src={dataUrl}
                          alt={detail.fileName}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : isImage ? (
                        <img
                          src={dataUrl}
                          alt={detail.fileName}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : isVideo ? (
                        <video
                          src={dataUrl}
                          controls
                          className="max-w-full max-h-full"
                        />
                      ) : isAudio ? (
                        <audio
                          src={dataUrl}
                          controls
                          className="w-full"
                        />
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="text-6xl text-[var(--color-text-light-gray)]">
                            📄
                          </div>
                          <p className="text-sm text-[var(--color-text-light-gray)]">
                            파일 미리보기 영역
                          </p>
                          <p className="text-xs text-[var(--color-text-light-gray)]/60">
                            {detail.fileName}
                          </p>
                          <a
                            href={dataUrl}
                            download={detail.fileName}
                            className="text-xs text-[var(--color-main-text)] underline"
                          >
                            다운로드
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 flex items-center justify-center min-h-[400px]">
                      <div className="text-center space-y-4">
                        <div className="text-6xl text-[var(--color-text-light-gray)]">
                          📄
                        </div>
                        <p className="text-sm text-[var(--color-text-light-gray)]">
                          {previewMessage ||
                            "파일 미리보기를 사용할 수 없습니다."}
                        </p>
                        <p className="text-xs text-[var(--color-text-light-gray)]/60">
                          {detail.fileName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 이슈 상세 정보 */}
              <div className="flex flex-col pt-[45px] pb-6">
                <div className="space-y-7">
                  <div>
                    <p className="text-[var(--color-text-light-gray)] mb-1.5 text-xs font-medium">
                      파일 연결
                    </p>
                    <p className="text-white font-semibold text-sm">
                      {detail.connectionName} ({detail.serverTypeName})
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
                  {piiDetails.length > 0 && (
                    <div>
                      <p className="text-[var(--color-text-light-gray)] mb-3 text-xs font-medium">
                        개인정보 유형별 상세
                      </p>
                      <div className="rounded-lg border border-[var(--color-content-border)] overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-[var(--color-sidebar-bg)]">
                            <tr className="text-[var(--color-text-light-gray)]">
                              <th className="px-4 py-3 text-left border-b border-r border-[var(--color-content-border)]">
                                유형명
                              </th>
                              <th className="px-4 py-3 text-left border-b border-r border-[var(--color-content-border)]">
                                유형코드
                              </th>
                              <th className="px-4 py-3 text-left border-b border-[var(--color-content-border)]">
                                개수
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {piiDetails.map((pii, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-[var(--color-content-border)] last:border-b-0"
                              >
                                <td className="px-4 py-3 text-white border-r border-[var(--color-content-border)]">
                                  {pii.piiTypeName}
                                </td>
                                <td className="px-4 py-3 text-white border-r border-[var(--color-content-border)]">
                                  {pii.piiTypeCode}
                                </td>
                                <td className="px-4 py-3 text-white tabular-nums">
                                  {pii.count.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
