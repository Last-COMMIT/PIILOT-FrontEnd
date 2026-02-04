"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, AlertTriangle, Lock, FileText } from "lucide-react";
import { StatCard, Table, Button, LoadingIndicator } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import FilterSection from "./FilterSection";
import {
  getFilePiiConnections,
  getFilePiiFiles,
} from "@/features/file-pii";
import type { FilePiiConnection, FilePiiFile } from "@/features/file-pii";
import { formatScanDateTime, formatFileSize } from "../lib/format";

type MaskingStatus = "원본" | "마스킹됨";
type RiskLevel = "높음" | "중간" | "낮음";

/** API riskLevel → UI 한글 */
const riskLevelToLabel: Record<string, RiskLevel> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

/** API fileCategory → UI 한글 */
const categoryToLabel: Record<string, string> = {
  DOCUMENT: "문서",
  PHOTO: "사진",
  VIDEO: "영상",
  AUDIO: "음성",
};

/** 테이블 행용 (API 파일 → UI) */
interface TableRow extends Record<string, unknown> {
  id: string;
  fileServerConnection: string;
  fileName: string;
  filePath: string;
  fileType: string;
  maskingStatus: MaskingStatus;
  riskLevel: RiskLevel;
  scanDateTime: string;
}

function fileToRow(f: FilePiiFile): TableRow {
  return {
    id: String(f.fileId),
    fileServerConnection: `${f.connectionName} (${f.serverTypeName})`,
    fileName: f.fileName,
    filePath: f.filePath,
    fileType: categoryToLabel[f.fileCategory] ?? f.fileCategoryName,
    maskingStatus: f.masked ? "마스킹됨" : "원본",
    riskLevel: riskLevelToLabel[f.riskLevel] ?? "높음",
    scanDateTime: formatScanDateTime(f.lastScannedAt),
  };
}

/** 파일 카테고리 필터 옵션 */
const FILE_CATEGORY_OPTIONS = [
  { value: "all", label: "파일 형식" },
  { value: "DOCUMENT", label: "문서" },
  { value: "PHOTO", label: "사진" },
  { value: "VIDEO", label: "영상" },
  { value: "AUDIO", label: "음성" },
];

const PAGE_SIZE = 20;

export default function FilePrivacyListPage() {
  const [connections, setConnections] = useState<FilePiiConnection[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [stats, setStats] = useState<{
    totalFiles: number;
    highRiskCount: number;
    maskingRate: number;
    totalFileSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [selectedMaskingStatus, setSelectedMaskingStatus] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const connectionOptions = [
    { value: "all", label: "모든 커넥션" },
    ...connections.map((c) => ({
      value: String(c.id),
      label: `${c.connectionName} (${c.serverTypeName})`,
    })),
  ];

  const fileTypeOptions = FILE_CATEGORY_OPTIONS;

  const loadConnections = useCallback(async () => {
    try {
      const res = await getFilePiiConnections();
      if (res.success && res.result) {
        setConnections(res.result);
      } else {
        console.error("커넥션 목록 로드 실패:", res.message);
      }
    } catch (err) {
      console.error("커넥션 API 호출 오류:", err);
    }
  }, []);

  const loadFiles = useCallback(
    async (pageNum: number, append: boolean): Promise<boolean> => {
      const params: {
        connectionId?: number;
        category?: "DOCUMENT" | "PHOTO" | "VIDEO" | "AUDIO";
        masked?: boolean;
        riskLevel?: "HIGH" | "MEDIUM" | "LOW";
        keyword?: string;
        page?: number;
        size?: number;
      } = {
        page: pageNum,
        size: PAGE_SIZE,
      };
      if (selectedConnection !== "all") {
        params.connectionId = Number(selectedConnection);
      }
      if (selectedFileType !== "all") {
        params.category = selectedFileType as "DOCUMENT" | "PHOTO" | "VIDEO" | "AUDIO";
      }
      if (selectedMaskingStatus === "original") {
        params.masked = false;
      } else if (selectedMaskingStatus === "masked") {
        params.masked = true;
      }
      if (selectedRiskLevel === "high") {
        params.riskLevel = "HIGH";
      } else if (selectedRiskLevel === "medium") {
        params.riskLevel = "MEDIUM";
      } else if (selectedRiskLevel === "low") {
        params.riskLevel = "LOW";
      }
      if (appliedSearchQuery.trim()) {
        params.keyword = appliedSearchQuery.trim();
      }
      const res = await getFilePiiFiles(params);
      if (!res.success) {
        setError(res.message ?? "파일 목록을 불러오지 못했습니다.");
        if (!append) setRows([]);
        setHasNext(false);
        return false;
      }
      setError(null);
      if (res.result) {
        const rawContent = res.result.content;
        const contentArray: FilePiiFile[] = Array.isArray(rawContent)
          ? rawContent
          : Array.isArray((rawContent as { content?: FilePiiFile[] })?.content)
            ? (rawContent as { content: FilePiiFile[] }).content
            : [];
        const list = contentArray
          .filter(
            (f): f is FilePiiFile =>
              f != null &&
              typeof f.fileId === "number" &&
              typeof f.fileName === "string",
          )
          .map(fileToRow);
        if (append) {
          setRows((prev) => [...prev, ...list]);
        } else {
          setRows(list);
        }
        setStats(res.result.stats ?? null);
        const slice =
          rawContent && !Array.isArray(rawContent)
            ? (rawContent as { hasNext?: boolean })
            : null;
        setHasNext(Boolean(slice?.hasNext));
        return true;
      }
      if (!append) setRows([]);
      setStats(null);
      setHasNext(false);
      return false;
    },
    [selectedConnection, selectedFileType, selectedMaskingStatus, selectedRiskLevel, appliedSearchQuery],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      loadConnections();
    }, 0);
    return () => clearTimeout(id);
  }, [loadConnections]);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0);
      setLoading(true);
      loadFiles(0, false).finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(id);
  }, [loadFiles]);

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setPage(0);
  };

  const handleReset = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnection("all");
    setSelectedFileType("all");
    setSelectedMaskingStatus("all");
    setSelectedRiskLevel("all");
    setPage(0);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setLoading(true);
    loadFiles(nextPage, true)
      .then((ok) => {
        if (ok) setPage(nextPage);
      })
      .finally(() => setLoading(false));
  };

  const totalFiles = stats?.totalFiles ?? 0;
  const highRiskItems = stats?.highRiskCount ?? 0;
  const maskingRate = stats?.maskingRate ?? 0;
  const totalFileSize = stats?.totalFileSize ?? 0;

  const columns: TableColumn<TableRow>[] = [
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
          title="마스킹율"
          value={`${maskingRate.toFixed(1)}%`}
          icon={<Lock className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="개인정보 파일 용량"
          value={formatFileSize(totalFileSize)}
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
          {loading && rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white">
              <LoadingIndicator size="lg" aria-label="로딩 중" />
            </div>
          ) : error && rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white">
              <p className="text-[var(--color-coral-text)]">{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white/70">
              파일이 없습니다.
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={rows}
                scrollable
                maxBodyHeight="100%"
                className="h-full"
              />
              {hasNext && (
                <div className="shrink-0 pt-3 flex justify-center pb-2">
                  <Button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loading}
                    colorScheme="main"
                    appearance="outline"
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
  );
}

