"use client";

import { Lock } from "lucide-react";
import { Modal } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

type RiskLevel = "높음" | "중간" | "낮음";

interface FileIssue {
  id: string;
  fileName: string;
  filePath: string;
  personalInfoCount: number;
  personalInfoType: string;
  riskLevel: RiskLevel;
}

interface FileServerIssue {
  id: string;
  serverName: string;
  serverType: string;
  manager: string;
  issueCount: number;
  files: FileIssue[];
}

interface IssueDetailModalProps {
  open: boolean;
  onClose: () => void;
  issue: FileServerIssue;
  file: FileIssue | null;
}

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
  file,
}: IssueDetailModalProps) {
  const selectedFile = file ?? issue.files[0];

  // 담당자 이메일 매핑 (실제로는 API에서 가져올 데이터)
  const managerEmailMap: Record<string, string> = {
    "홍길동 대리": "honggildong@naver.com",
    "김철수 대리": "chulsoo123@gmail.com",
    "이순신 과장": "sunsin.lee@naver.com",
    "박영희 대리": "younghee.park@example.com",
    "최민수 과장": "minsu.choi@example.com",
    "정수진 대리": "sujin.jung@example.com",
  };

  const managerEmail = managerEmailMap[issue.manager] || "unknown@example.com";

  // 파일 확장자에서 파일 유형 추출
  const getFileType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toUpperCase() || "UNKNOWN";
    return ext;
  };

  // 첫 번째 그리드 필드 정의
  const firstGridFields = [
    {
      label: "파일명",
      value: selectedFile.fileName,
    },
    {
      label: "파일 유형",
      value: getFileType(selectedFile.fileName),
    },
    {
      label: "검출된 개인정보 수",
      value: `${selectedFile.personalInfoCount}건`,
      className: "tabular-nums",
    },
    {
      label: "위험도",
      value: selectedFile.riskLevel,
      className: cn("font-semibold text-sm", getRiskLevelColor(selectedFile.riskLevel)),
    },
    {
      label: "개인정보 유형",
      value: selectedFile.personalInfoType,
      className: "break-words whitespace-normal",
    },
    {
      label: "스캔 일시",
      value: "2025.01.13 04:00",
    },
  ];

  // 두 번째 그리드 필드 정의
  const secondGridFields = [
    {
      label: "담당자",
      value: issue.manager,
    },
    {
      label: "담당자 이메일",
      value: managerEmail,
    },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="개인정보 이슈 상세"
      size="wide"
      className="max-w-6xl !max-h-[98vh]"
    >
      <div className="flex flex-col gap-5 px-4 py-2">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-coral-bg)]/15 border border-[var(--color-coral-border)]">
          <Lock className="size-5 shrink-0 text-[var(--color-coral-text)] mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-coral-text)] mb-1">
              암호화되지 않은 개인정보
            </p>
            <p className="text-sm text-[var(--color-text-light-gray)]">
              이 파일의 개인정보는 마스킹 처리되지 않아 보안 위험이 있습니다.
              즉시 암호화 조치가 필요합니다.
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
              <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="text-6xl text-[var(--color-text-light-gray)]">
                    📄
                  </div>
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    파일 미리보기 영역
                  </p>
                  <p className="text-xs text-[var(--color-text-light-gray)]/60">
                    {selectedFile.fileName}
                  </p>
                </div>
              </div>
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
                  {issue.serverType}
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
                    <p className="text-white font-semibold text-sm">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

