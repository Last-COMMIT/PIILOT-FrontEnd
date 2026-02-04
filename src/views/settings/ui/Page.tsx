"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Mail } from "lucide-react";
import { Button, Table, TableSection, Toggle } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import { useIsAdmin } from "@/views/notice/lib/useIsAdmin";

const STORAGE_KEY_NOTIFICATION = "settings_notification_level";
const STORAGE_KEY_EMAIL = "settings_email_level";

type SeverityLevel = "high" | "medium" | "low";

interface NotificationSettings {
  high: boolean;
  medium: boolean;
  low: boolean;
}

/** 업로드 시 선택 가능한 파일 유형 (PDF 전제) */
type FileKind = "db_manual" | "law_internal";

interface UploadedFile extends Record<string, unknown> {
  id: string;
  no: number;
  fileName: string;
  fileType: string;
  uploadedAt: string;
}

/** 테이블 표시용 (번호는 01, 02 형태 문자열) */
type UploadedFileRow = Omit<UploadedFile, "no"> & { no: string };

/** 관리자 파일 업로드 테이블용 임시 데이터 */
const MOCK_UPLOADED_FILES: UploadedFile[] = [
  {
    id: "mock-1",
    no: 0,
    fileName: "개인정보 보호법.pdf",
    fileType: "법령",
    uploadedAt: "01/19 02:00",
  },
  {
    id: "mock-2",
    no: 0,
    fileName: "AIVLE SCHOOL 내규",
    fileType: "내규",
    uploadedAt: "01/19 01:30",
  },
  {
    id: "mock-3",
    no: 0,
    fileName: "개인정보처리방침_내부규정.pdf",
    fileType: "법령",
    uploadedAt: "01/19 01:00",
  },
  {
    id: "mock-4",
    no: 0,
    fileName: "개인정보_수집·이용_보관_파기_기준.pdf",
    fileType: "법령",
    uploadedAt: "01/18 23:00",
  },
  {
    id: "mock-5",
    no: 0,
    fileName: "user_list.csv",
    fileType: "데이터",
    uploadedAt: "01/18 22:30",
  },
  {
    id: "mock-6",
    no: 0,
    fileName: "payment_capture.png",
    fileType: "DB 사진",
    uploadedAt: "01/18 22:00",
  },
  {
    id: "mock-7",
    no: 0,
    fileName: "KT DB 사전(1)",
    fileType: "DB 사진",
    uploadedAt: "01/18 02:00",
  },
  {
    id: "mock-8",
    no: 0,
    fileName: "KT DB 사전(2)",
    fileType: "DB 사진",
    uploadedAt: "01/18 02:00",
  },
  {
    id: "mock-9",
    no: 0,
    fileName: "KT DB 사전(3)",
    fileType: "DB 사진",
    uploadedAt: "01/18 02:00",
  },
];

const LEVEL_LABELS: Record<
  SeverityLevel,
  { label: string; desc: string; dotClass: string }
> = {
  high: {
    label: "높음 (High)",
    desc: "즉각적인 조치가 필요한 심각한 보안 위험",
    dotClass: "bg-[var(--color-coral-text)]",
  },
  medium: {
    label: "중간 (Medium)",
    desc: "모니터링이 필요한 일반적인 이슈",
    dotClass: "bg-[var(--color-yellow-text)]",
  },
  low: {
    label: "낮음 (Low)",
    desc: "참고용 정보성 알림",
    dotClass: "bg-[var(--color-green-text)]",
  },
};

const EMAIL_LEVEL_LABELS: Record<
  SeverityLevel,
  { label: string; desc: string; dotClass: string }
> = {
  high: {
    label: "높음 (High)",
    desc: "중요 이슈 이메일 알림",
    dotClass: "bg-[var(--color-coral-text)]",
  },
  medium: {
    label: "중간 (Medium)",
    desc: "중간 수준 이슈 이메일 알림",
    dotClass: "bg-[var(--color-yellow-text)]",
  },
  low: {
    label: "낮음 (Low)",
    desc: "낮은 수준 이슈 이메일 알림",
    dotClass: "bg-[var(--color-green-text)]",
  },
};

function LevelRow({
  level,
  labels,
  checked,
  onToggle,
}: {
  level: SeverityLevel;
  labels: Record<
    SeverityLevel,
    { label: string; desc: string; dotClass: string }
  >;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const { label, desc, dotClass } = labels[level];
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-content-border)] last:border-b-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={cn("size-3 rounded-full shrink-0", dotClass)}
          aria-hidden
        />
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-[var(--color-text-light-gray)]">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onToggle} />
    </div>
  );
}

function loadNotificationSettings(
  key: string,
  fallback: NotificationSettings
): NotificationSettings {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as NotificationSettings;
    return {
      high: !!parsed.high,
      medium: !!parsed.medium,
      low: !!parsed.low,
    };
  } catch {
    return fallback;
  }
}

function saveNotificationSettings(
  key: string,
  value: NotificationSettings
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const DEFAULT_NOTIFICATION: NotificationSettings = {
  high: true,
  medium: true,
  low: true,
};

export default function SettingsPage() {
  const isAdmin = useIsAdmin();
  const [notificationLevel, setNotificationLevel] =
    useState<NotificationSettings>(() =>
      loadNotificationSettings(STORAGE_KEY_NOTIFICATION, DEFAULT_NOTIFICATION)
    );
  const [emailLevel, setEmailLevel] = useState<NotificationSettings>(() =>
    loadNotificationSettings(STORAGE_KEY_EMAIL, DEFAULT_NOTIFICATION)
  );
  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFile[]>(MOCK_UPLOADED_FILES);
  const [fileKindForUpload, setFileKindForUpload] =
    useState<FileKind>("law_internal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 알림/이메일 토글: UI만 localStorage에 저장 (백엔드 미연동)
  useEffect(() => {
    saveNotificationSettings(STORAGE_KEY_NOTIFICATION, notificationLevel);
  }, [notificationLevel]);

  useEffect(() => {
    saveNotificationSettings(STORAGE_KEY_EMAIL, emailLevel);
  }, [emailLevel]);

  const handleNotificationChange = (level: SeverityLevel, checked: boolean) => {
    setNotificationLevel((prev) => ({ ...prev, [level]: checked }));
  };

  const handleEmailChange = (level: SeverityLevel, checked: boolean) => {
    setEmailLevel((prev) => ({ ...prev, [level]: checked }));
  };

  const fileTypeLabel =
    fileKindForUpload === "db_manual" ? "DB 사전" : "법령/내규";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fileList = Array.from(files);
    const newEntries: UploadedFile[] = fileList.map((file, i) => ({
      id: `file-${Date.now()}-${i}`,
      no: 0,
      fileName: file.name,
      fileType: fileTypeLabel,
      uploadedAt: formatUploadDate(new Date()),
    }));
    setUploadedFiles((prev) => [...newEntries, ...prev]);
    e.target.value = "";
  };

  /** 최신순 정렬, 번호는 01~09 형태(맨 위가 가장 큰 번호) */
  const fileTableData = useMemo((): UploadedFileRow[] => {
    return uploadedFiles.map((row, i) => ({
      ...row,
      no: String(uploadedFiles.length - i).padStart(2, "0"),
    }));
  }, [uploadedFiles]);

  const handleSave = () => {
    // TODO: API 연동 시 저장 로직
    alert("설정이 저장되었습니다.");
  };

  const fileColumns = useMemo(
    (): TableColumn<UploadedFileRow>[] => [
      { id: "no", label: "번호", width: 0.6, align: "left" },
      {
        id: "fileName",
        label: "파일명",
        width: 2.4,
        align: "left",
        render: (value: unknown, row: UploadedFileRow) => (
          <span className="text-white truncate">
            {String(value ?? row.fileName)}
          </span>
        ),
      },
      { id: "fileType", label: "파일 유형", width: 1.2, align: "left" },
      { id: "uploadedAt", label: "업로드 일시", width: 1.4, align: "left" },
    ],
    []
  );

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0">
        <TableSection
          icon={<Bell className="size-6 text-[var(--color-main-text)]" />}
          title="알림 수준 설정"
          meta="시스템에서 알림을 받을 심각도 수준을 선택합니다"
        >
          <div className="p-4">
            {(Object.keys(LEVEL_LABELS) as SeverityLevel[]).map((level) => (
              <LevelRow
                key={level}
                level={level}
                labels={LEVEL_LABELS}
                checked={notificationLevel[level]}
                onToggle={(checked) => handleNotificationChange(level, checked)}
              />
            ))}
          </div>
        </TableSection>

        <TableSection
          icon={<Mail className="size-6 text-[var(--color-main-text)]" />}
          title="이메일 알림 수준 설정"
          meta="이메일로 알림을 받을 심각도 수준을 선택합니다"
        >
          <div className="p-4">
            {(Object.keys(EMAIL_LEVEL_LABELS) as SeverityLevel[]).map(
              (level) => (
                <LevelRow
                  key={level}
                  level={level}
                  labels={EMAIL_LEVEL_LABELS}
                  checked={emailLevel[level]}
                  onToggle={(checked) => handleEmailChange(level, checked)}
                />
              )
            )}
          </div>
        </TableSection>
      </div>

      {isAdmin && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div className="flex flex-col gap-4 shrink-0 pb-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-white">
                관리자 파일 업로드
              </h3>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <span className="text-sm text-[var(--color-text-light-gray)]">
                파일 유형
              </span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer rounded-full has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-main-bg)]/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--color-sidebar-bg)]">
                  <input
                    type="radio"
                    name="fileKind"
                    checked={fileKindForUpload === "db_manual"}
                    onChange={() => setFileKindForUpload("db_manual")}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "relative flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      "focus-visible:outline-none",
                      fileKindForUpload === "db_manual"
                        ? "border-[var(--color-main-bg)] bg-[var(--color-main-bg)] shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                        : "border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] hover:border-[var(--color-main-bg)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.1)]"
                    )}
                  >
                    {fileKindForUpload === "db_manual" && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-sm text-white">DB 사전</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer rounded-full has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--color-main-bg)]/50 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--color-sidebar-bg)]">
                  <input
                    type="radio"
                    name="fileKind"
                    checked={fileKindForUpload === "law_internal"}
                    onChange={() => setFileKindForUpload("law_internal")}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "relative flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                      "focus-visible:outline-none",
                      fileKindForUpload === "law_internal"
                        ? "border-[var(--color-main-bg)] bg-[var(--color-main-bg)] shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                        : "border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] hover:border-[var(--color-main-bg)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.1)]"
                    )}
                  >
                    {fileKindForUpload === "law_internal" && (
                      <span className="size-2 rounded-full bg-white" />
                    )}
                  </span>
                  <span className="text-sm text-white">법령/내규</span>
                </label>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="sr-only"
                onChange={handleFileUpload}
                aria-label="PDF 파일 선택"
              />
              <Button
                colorScheme="main"
                appearance="outline"
                size="sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                파일 업로드 (PDF)
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <Table<UploadedFileRow>
              columns={fileColumns}
              data={fileTableData}
              maxBodyHeight="100%"
              rowSelectionEnabled={false}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end shrink-0">
        <Button colorScheme="main" appearance="solid" onClick={handleSave}>
          저장
        </Button>
      </div>
    </div>
  );
}

function formatUploadDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${h}:${min}`;
}
