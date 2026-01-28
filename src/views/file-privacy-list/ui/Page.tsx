"use client";

import { useMemo, useState } from "react";
import { Database, AlertTriangle, Lock, FileText } from "lucide-react";
import { StatCard, Table } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import FilterSection from "./FilterSection";

type MaskingStatus = "원본" | "마스킹됨";
type RiskLevel = "높음" | "중간" | "낮음";

interface FilePrivacyItem extends Record<string, unknown> {
  id: string;
  fileServerConnection: string;
  fileName: string;
  filePath: string;
  fileType: string;
  maskingStatus: MaskingStatus;
  riskLevel: RiskLevel;
  scanDateTime: string;
  fileSizeGb: number;
}

function formatFileSizeFromGb(sizeGb: number): string {
  if (sizeGb >= 1000) return `${(sizeGb / 1000).toFixed(1)} TB`;
  if (sizeGb >= 1) return `${sizeGb.toFixed(1)} GB`;
  return `${Math.round(sizeGb * 1024)} MB`;
}

function generateMockItems(): FilePrivacyItem[] {
  const items: FilePrivacyItem[] = [];
  const connections = ["S3 Document Storage", "Legacy NAS Share", "NFS Backup"];
  const fileTypes = ["문서", "사진", "영상", "음성"];
  const riskLevels: RiskLevel[] = ["낮음", "중간", "높음"];
  const maskingStatuses: MaskingStatus[] = ["원본", "마스킹됨"];
  const fileNames = [
    "user_guide.txt",
    "reservation_info.txt",
    "profile_photo.png",
    "user_list.csv",
    "payment_capture.png",
    "reservation_ticket.pdf",
    "facility_manual.pdf",
    "id_scan.png",
    "ticket_image.png",
    "facility_notice.wav",
    "notice_content.docs",
    "reservation.mp4",
  ];
  const paths = [
    "desktop/user/add",
    "desktop/reservation/detail",
    "desktop/user/list",
    "desktop/payment/add",
    "desktop/facility/manage",
    "desktop/notice/list",
    "desktop/reservation/list",
    "desktop/user/detail",
  ];

  for (let i = 1; i <= 120; i++) {
    const fileName = fileNames[(i - 1) % fileNames.length];
    const fileType = fileTypes[(i - 1) % fileTypes.length];
    const riskLevel = riskLevels[(i * 7) % riskLevels.length];
    const maskingStatus = maskingStatuses[(i * 5) % maskingStatuses.length];
    const connection = connections[(i - 1) % connections.length];
    const filePath = paths[(i * 3) % paths.length];

    const hour = String((i * 2) % 24).padStart(2, "0");
    const minute = String((i * 7) % 60).padStart(2, "0");
    const day = String(17 + (i % 3)).padStart(2, "0");

    // 대략적인 파일 용량(GB) - deterministic
    const sizeGb = ((i * 13) % 820) / 10 + 0.2; // 0.2GB ~ 82.1GB

    items.push({
      id: String(i),
      fileServerConnection: connection,
      fileName,
      filePath,
      fileType,
      maskingStatus,
      riskLevel,
      scanDateTime: `01/${day} ${hour}:${minute}`,
      fileSizeGb: sizeGb,
    });
  }

  return items;
}

export default function FilePrivacyListPage() {
  const [items] = useState<FilePrivacyItem[]>(generateMockItems());

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [selectedMaskingStatus, setSelectedMaskingStatus] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");

  const connectionOptions = useMemo(() => {
    const unique = Array.from(
      new Set(items.map((i) => i.fileServerConnection).filter(Boolean)),
    );
    return [
      { value: "all", label: "모든 커넥션" },
      ...unique.map((v) => ({ value: v, label: v })),
    ];
  }, [items]);

  const fileTypeOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.fileType).filter(Boolean)));
    return [
      { value: "all", label: "파일 형식" },
      ...unique.map((v) => ({ value: v, label: v })),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = appliedSearchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (q) {
        if (
          !item.fileName.toLowerCase().includes(q) &&
          !item.filePath.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (selectedConnection !== "all" && item.fileServerConnection !== selectedConnection) {
        return false;
      }
      if (selectedFileType !== "all" && item.fileType !== selectedFileType) {
        return false;
      }
      if (selectedMaskingStatus === "original" && item.maskingStatus !== "원본") {
        return false;
      }
      if (selectedMaskingStatus === "masked" && item.maskingStatus !== "마스킹됨") {
        return false;
      }
      if (selectedRiskLevel === "high" && item.riskLevel !== "높음") {
        return false;
      }
      if (selectedRiskLevel === "medium" && item.riskLevel !== "중간") {
        return false;
      }
      if (selectedRiskLevel === "low" && item.riskLevel !== "낮음") {
        return false;
      }
      return true;
    });
  }, [
    items,
    appliedSearchQuery,
    selectedConnection,
    selectedFileType,
    selectedMaskingStatus,
    selectedRiskLevel,
  ]);

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnection("all");
    setSelectedFileType("all");
    setSelectedMaskingStatus("all");
    setSelectedRiskLevel("all");
  };

  // 통계(전체 기준)
  const totalFiles = items.length;
  const highRiskItems = items.filter((i) => i.riskLevel === "높음").length;
  const maskedItems = items.filter((i) => i.maskingStatus === "마스킹됨").length;
  const maskingRate = totalFiles === 0 ? 0 : Math.round((maskedItems / totalFiles) * 100);
  const totalSizeGb = items.reduce((sum, i) => sum + i.fileSizeGb, 0);

  const columns: TableColumn<FilePrivacyItem>[] = [
    { id: "fileServerConnection", label: "파일 서버 연결", width: "2fr" },
    { id: "fileName", label: "파일명", width: "1.5fr" },
    { id: "filePath", label: "파일 경로", width: "2fr" },
    { id: "fileType", label: "파일 형식", width: "1fr" },
    {
      id: "maskingStatus",
      label: "마스킹 상태",
      width: "1fr",
      render: (value) => {
        const status = value as MaskingStatus;
        const isOriginal = status === "원본";
        return (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              isOriginal
                ? "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]"
                : "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
            )}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "1fr",
      render: (value) => {
        const risk = value as RiskLevel;
        const riskColors: Record<RiskLevel, string> = {
          높음: "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]",
          중간: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]",
          낮음: "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
        };
        return (
          <span className={cn("rounded-md px-2 py-1 text-xs font-medium", riskColors[risk])}>
            {risk}
          </span>
        );
      },
    },
    { id: "scanDateTime", label: "스캔일시", width: "1.2fr", align: "left" },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="총 파일"
          value={totalFiles.toLocaleString()}
          icon={<FileText className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="고위험 항목"
          value={highRiskItems.toLocaleString()}
          icon={<AlertTriangle className="size-5" />}
          colorScheme="coral"
        />
        <StatCard
          title="암호화율"
          value={`${maskingRate}%`}
          icon={<Lock className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="개인정보 파일 용량"
          value={formatFileSizeFromGb(totalSizeGb)}
          icon={<Database className="size-5" />}
          colorScheme="green"
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        <FilterSection
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onReset={handleReset}
          connectionOptions={connectionOptions}
          selectedConnection={selectedConnection}
          onConnectionChange={setSelectedConnection}
          fileTypeOptions={fileTypeOptions}
          selectedFileType={selectedFileType}
          onFileTypeChange={setSelectedFileType}
          selectedMaskingStatus={selectedMaskingStatus}
          onMaskingStatusChange={setSelectedMaskingStatus}
          selectedRiskLevel={selectedRiskLevel}
          onRiskLevelChange={setSelectedRiskLevel}
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Table
            columns={columns}
            data={filteredItems}
            scrollable
            maxBodyHeight="100%"
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

