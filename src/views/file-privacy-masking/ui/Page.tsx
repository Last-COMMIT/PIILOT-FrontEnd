"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  FileImage,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Plane,
  Image,
  ImageOff,
  Loader2,
} from "lucide-react";
import { Button, Dropdown, Input, PasswordInput } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import {
  getFileMaskingConnections,
  getFileMaskingFiles,
  getFilePreview,
  maskFile,
  saveMaskingResult,
  type FileMaskingFileItem,
  type FileMaskingConnection,
  type FilePreviewResponse,
  type FileMaskingResponse,
  type RiskLevel,
  type FileCategory,
} from "@/features/file-privacy-masking";

const FILE_CATEGORY_OPTIONS = [
  { value: "all", label: "파일 형태" },
  { value: "DOCUMENT", label: "문서" },
  { value: "PHOTO", label: "이미지" },
  { value: "AUDIO", label: "음성" },
  { value: "VIDEO", label: "영상" },
];

const RISK_LEVEL_OPTIONS = [
  { value: "all", label: "위험도 수준" },
  { value: "HIGH", label: "높음" },
  { value: "MEDIUM", label: "중간" },
  { value: "LOW", label: "낮음" },
];

const RISK_LEVEL_MAP: Record<RiskLevel, string> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

const FILE_CATEGORY_MAP: Record<FileCategory, string> = {
  DOCUMENT: "문서",
  PHOTO: "이미지",
  AUDIO: "음성",
  VIDEO: "영상",
};

export default function FilePrivacyMaskingPage() {
  const [connections, setConnections] = useState<FileMaskingConnection[]>([]);
  const [files, setFiles] = useState<FileMaskingFileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<number>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | "all">("all");
  const [selectedFileCategory, setSelectedFileCategory] = useState<string>("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all");
  const [password, setPassword] = useState("");
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState(0);
  const [currentMaskedIndex, setCurrentMaskedIndex] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [showLongLoadingIndicator, setShowLongLoadingIndicator] =
    useState(false);
  const [maskedFileIds, setMaskedFileIds] = useState<Set<number>>(new Set());
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [originalPreview, setOriginalPreview] =
    useState<FilePreviewResponse | null>(null);
  const [maskedPreviews, setMaskedPreviews] = useState<
    Map<number, FileMaskingResponse>
  >(new Map());
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const conversionTokenRef = useRef(0);
  const selectedFileIdsRef = useRef<Set<number>>(new Set());

  // 선택 파일이 바뀌면 마스킹 결과 초기화 (다른 파일 선택 시 결과 미리보기 제거)
  useEffect(() => {
    selectedFileIdsRef.current = new Set(selectedFileIds);
    setMaskedFileIds(new Set());
    setMaskedPreviews(new Map());
  }, [selectedFileIds]);

  // 커넥션 목록 로드
  useEffect(() => {
    const loadConnections = async () => {
      setIsLoadingConnections(true);
      try {
        const response = await getFileMaskingConnections();
        if (response.success && response.result) {
          setConnections(response.result);
        }
      } catch (error) {
        console.error("커넥션 목록 로드 실패:", error);
      } finally {
        setIsLoadingConnections(false);
      }
    };
    loadConnections();
  }, []);

  // 파일 목록 로드
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoadingFiles(true);
      try {
        const params: {
          connectionId?: number;
          fileCategory?: string;
          riskLevel?: string;
          fileName?: string;
        } = {};
        if (selectedConnectionId !== "all") {
          params.connectionId = selectedConnectionId;
        }
        if (selectedFileCategory !== "all") {
          params.fileCategory = selectedFileCategory;
        }
        if (selectedRiskLevel !== "all") {
          params.riskLevel = selectedRiskLevel;
        }
        if (appliedSearchQuery) {
          params.fileName = appliedSearchQuery;
        }
        const response = await getFileMaskingFiles(params);
        if (response.success && response.result) {
          setFiles(response.result);
        }
      } catch (error) {
        console.error("파일 목록 로드 실패:", error);
      } finally {
        setIsLoadingFiles(false);
      }
    };
    loadFiles();
  }, [selectedConnectionId, selectedFileCategory, selectedRiskLevel, appliedSearchQuery]);

  // 파일 클릭 시 미리보기 로드
  useEffect(() => {
    if (selectedFileId === null) {
      setOriginalPreview(null);
      return;
    }

    const loadPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const response = await getFilePreview(selectedFileId);
        if (response.success && response.result) {
          setOriginalPreview(response.result);
        } else {
          setOriginalPreview(null);
        }
      } catch (error) {
        console.error("미리보기 로드 실패:", error);
        setOriginalPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };
    loadPreview();
  }, [selectedFileId]);

  useEffect(() => {
    if (!isConverting) {
      setShowLongLoadingIndicator(false);
      return;
    }
    const timer = setTimeout(() => setShowLongLoadingIndicator(true), 1000);
    return () => clearTimeout(timer);
  }, [isConverting]);

  const connectionOptions = useMemo(() => {
    const options = [{ value: "all", label: "모든 커넥션" }];
    connections.forEach((conn) => {
      options.push({
        value: String(conn.connectionId),
        label: conn.connectionName,
      });
    });
    return options;
  }, [connections]);

  const filteredFiles = useMemo(() => {
    return files;
  }, [files]);

  const selectedFilesArray = useMemo(() => {
    return Array.from(selectedFileIds)
      .map((id) => files.find((f) => f.fileId === id))
      .filter((f): f is FileMaskingFileItem => f !== undefined);
  }, [selectedFileIds, files]);

  const maskedFilesArray = useMemo(() => {
    return Array.from(maskedFileIds)
      .map((id) => {
        const file = files.find((f) => f.fileId === id);
        const preview = maskedPreviews.get(id);
        return file && preview ? { file, preview } : null;
      })
      .filter(
        (item): item is { file: FileMaskingFileItem; preview: FileMaskingResponse } =>
          item !== null,
      );
  }, [maskedFileIds, files, maskedPreviews]);

  useEffect(() => {
    setCurrentOriginalIndex((prev) =>
      selectedFilesArray.length === 0
        ? 0
        : Math.min(prev, selectedFilesArray.length - 1),
    );
  }, [selectedFilesArray.length]);

  useEffect(() => {
    setCurrentMaskedIndex((prev) =>
      maskedFilesArray.length === 0
        ? 0
        : Math.min(prev, maskedFilesArray.length - 1),
    );
  }, [maskedFilesArray.length]);

  const handleFileToggle = (fileId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedFileIds((prev) => {
      if (prev.has(fileId)) {
        if (selectedFileId === fileId) {
          setSelectedFileId(null);
        }
        return new Set<number>();
      }
      return new Set([fileId]);
    });
    if (!selectedFileIds.has(fileId)) {
      setSelectedFileId(fileId);
    }
  };

  const handleFileRowClick = (fileId: number) => {
    setSelectedFileIds(new Set([fileId]));
    setSelectedFileId(fileId);
  };

  const handleConvert = async () => {
    if (selectedFileIds.size === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    const token = ++conversionTokenRef.current;
    setIsConverting(true);
    setMaskedFileIds(new Set());
    setMaskedPreviews(new Map());

    const selectedIdsArray = Array.from(selectedFileIds);
    for (let i = 0; i < selectedIdsArray.length; i++) {
      if (conversionTokenRef.current !== token) return;
      try {
        const response = await maskFile(selectedIdsArray[i]);
        if (response.success && response.result) {
          const fileId = selectedIdsArray[i];
          if (!selectedFileIdsRef.current.has(fileId)) continue;
          setMaskedPreviews((prev) => {
            const newMap = new Map(prev);
            newMap.set(fileId, response.result!);
            return newMap;
          });
          setMaskedFileIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(fileId);
            return newSet;
          });
        } else {
          alert(`파일 마스킹 실패: ${response.message}`);
        }
      } catch (error) {
        console.error("마스킹 실패:", error);
        alert("마스킹 처리 중 오류가 발생했습니다.");
      }
    }

    if (conversionTokenRef.current === token) {
      setIsConverting(false);
    }
  };

  const handleSave = async () => {
    if (!password || password.length < 4 || password.length > 50) {
      alert("암호화 비밀번호를 4~50자로 입력해주세요.");
      return;
    }

    if (maskedFileIds.size === 0) {
      alert("저장할 마스킹 결과가 없습니다.");
      return;
    }

    setIsSaving(true);
    const selectedIdsArray = Array.from(maskedFileIds);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedIdsArray.length; i++) {
      try {
        const response = await saveMaskingResult(selectedIdsArray[i], {
          encryptionPassword: password,
        });
        if (response.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`저장 실패 (fileId: ${selectedIdsArray[i]}):`, response.message);
        }
      } catch (error) {
        failCount++;
        console.error("저장 실패:", error);
      }
    }

    setIsSaving(false);

    if (successCount > 0) {
      alert(`${successCount}개 파일이 저장되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ""}`);
      // 상태 초기화 및 목록 새로고침
      handleCancel();
      const params: {
        connectionId?: number;
        fileCategory?: string;
        riskLevel?: string;
        fileName?: string;
      } = {};
      if (selectedConnectionId !== "all") {
        params.connectionId = selectedConnectionId;
      }
      if (selectedFileCategory !== "all") {
        params.fileCategory = selectedFileCategory;
      }
      if (selectedRiskLevel !== "all") {
        params.riskLevel = selectedRiskLevel;
      }
      if (appliedSearchQuery) {
        params.fileName = appliedSearchQuery;
      }
      const response = await getFileMaskingFiles(params);
      if (response.success && response.result) {
        setFiles(response.result);
      }
    } else {
      alert(`저장에 실패했습니다. (${failCount}개 실패)`);
    }
  };

  const handleCancel = () => {
    conversionTokenRef.current += 1;
    setSelectedFileIds(new Set());
    setMaskedFileIds(new Set());
    setMaskedPreviews(new Map());
    setCurrentOriginalIndex(0);
    setCurrentMaskedIndex(0);
    setIsConverting(false);
    setPassword("");
    setSelectedFileId(null);
    setOriginalPreview(null);
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleReset = () => {
    conversionTokenRef.current += 1;
    setSelectedFileIds(new Set());
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnectionId("all");
    setSelectedFileCategory("all");
    setSelectedRiskLevel("all");
    setMaskedFileIds(new Set());
    setMaskedPreviews(new Map());
    setCurrentOriginalIndex(0);
    setCurrentMaskedIndex(0);
    setIsConverting(false);
    setPassword("");
    setSelectedFileId(null);
    setOriginalPreview(null);
  };

  const currentOriginalFile = selectedFilesArray[currentOriginalIndex] || null;
  const currentMaskedFileData = maskedFilesArray[currentMaskedIndex] || null;

  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]";
      case "MEDIUM":
        return "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]";
      case "LOW":
        return "bg-[var(--color-green-bg)] text-[var(--color-green-text)]";
      default:
        return "";
    }
  };

  const renderPreview = (
    preview: FilePreviewResponse | FileMaskingResponse | null,
    isLoading: boolean,
    isMasked: boolean,
  ) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-[var(--color-main-bg)]" />
          <p className="text-sm text-[var(--color-text-light-gray)]">
            로딩 중...
          </p>
        </div>
      );
    }

    if (!preview) {
      return (
        <>
          <FileImage className="size-16 text-[var(--color-text-light-gray)]" />
          <p className="text-sm text-[var(--color-text-light-gray)]">
            {isMasked
              ? "변환된 결과가 여기에 표시됩니다"
              : "상단에서 파일을 선택하세요"}
          </p>
        </>
      );
    }

    if (!preview.previewAvailable) {
      return (
        <>
          <ImageOff className="size-20 text-[var(--color-text-light-gray)]" />
          <p className="text-sm text-[var(--color-text-light-gray)]">
            {preview.previewMessage || "미리보기를 사용할 수 없습니다"}
          </p>
        </>
      );
    }

    const content = isMasked
      ? (preview as FileMaskingResponse).maskedContent
      : (preview as FilePreviewResponse).content;

    if (!content) {
      return (
        <>
          <ImageOff className="size-20 text-[var(--color-text-light-gray)]" />
          <p className="text-sm text-[var(--color-text-light-gray)]">
            미리보기 데이터가 없습니다
          </p>
        </>
      );
    }

    const dataUrl = `data:${preview.mimeType};base64,${content}`;

    // 이미지
    if (preview.fileCategory === "PHOTO") {
      return (
        <img
          src={dataUrl}
          alt={preview.fileName}
          className="max-w-full max-h-[350px] object-contain rounded"
        />
      );
    }

    // 문서 (PDF는 iframe, 이미지는 img)
    if (preview.fileCategory === "DOCUMENT") {
      if (preview.mimeType === "application/pdf") {
        return (
          <iframe
            src={dataUrl}
            className="w-full h-[350px] rounded"
            title={preview.fileName}
          />
        );
      } else if (
        preview.mimeType.startsWith("image/") ||
        preview.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return (
          <img
            src={dataUrl}
            alt={preview.fileName}
            className="max-w-full max-h-[350px] object-contain rounded"
          />
        );
      } else {
        return (
          <>
            <FileImage className="size-16 text-[var(--color-text-light-gray)]" />
            <p className="text-sm text-[var(--color-text-light-gray)]">
              {preview.fileName}
            </p>
            <a
              href={dataUrl}
              download={preview.fileName}
              className="text-xs text-[var(--color-main-text)] underline"
            >
              다운로드
            </a>
          </>
        );
      }
    }

    // 음성
    if (preview.fileCategory === "AUDIO") {
      return (
        <div className="w-full">
          <audio controls className="w-full">
            <source src={dataUrl} type={preview.mimeType} />
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        </div>
      );
    }

    // 영상 (이슈 상세보기와 동일하게 video 태그로 미리보기)
    if (preview.fileCategory === "VIDEO") {
      return (
        <video
          src={dataUrl}
          controls
          className="max-w-full max-h-[350px] object-contain rounded"
        />
      );
    }

    return (
      <>
        <FileImage className="size-16 text-[var(--color-text-light-gray)]" />
        <p className="text-sm text-[var(--color-text-light-gray)]">
          {preview.fileName}
        </p>
      </>
    );
  };

  const fileColumns: TableColumn<FileMaskingFileItem>[] = [
    {
      id: "checkbox",
      label: "",
      width: "40px",
      align: "center",
      render: (_, row) => {
        const isSelected = selectedFileIds.has(row.fileId);
        return (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => handleFileToggle(row.fileId, e)}
              className={cn(
                "relative size-4 flex items-center justify-center transition-all duration-200 rounded",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-main-bg)]/50 focus-visible:ring-offset-0",
                "border-2 shrink-0",
                isSelected
                  ? "bg-[var(--color-main-bg)] border-[var(--color-main-bg)] shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  : "bg-[var(--color-sidebar-bg)] border-[var(--color-content-border)] hover:border-[var(--color-main-bg)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.1)]",
              )}
            >
              {isSelected && (
                <Check
                  className="size-3 text-white animate-in fade-in zoom-in-50 duration-200"
                  strokeWidth={2.5}
                />
              )}
            </button>
          </div>
        );
      },
    },
    {
      id: "connectionName",
      label: "파일 서버",
      width: "1fr",
      align: "left",
      render: (value) => <span>{value as string}</span>,
    },
    {
      id: "fileName",
      label: "파일 명",
      width: "1fr",
      align: "left",
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      id: "filePath",
      label: "경로",
      width: "2fr",
      align: "left",
      render: (value) => <span>{value as string}</span>,
    },
    {
      id: "fileCategory",
      label: "파일 형태",
      width: "0.7fr",
      align: "left",
      render: (value) => (
        <span>{FILE_CATEGORY_MAP[value as FileCategory] || value}</span>
      ),
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "0.7fr",
      align: "left",
      render: (value) => {
        const riskLevel = value as RiskLevel;
        return (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              getRiskLevelColor(riskLevel),
            )}
          >
            {RISK_LEVEL_MAP[riskLevel] || riskLevel}
          </span>
        );
      },
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      {/* 파일 선택 섹션 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
          파일 선택
        </h2>
        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* 필터 및 검색 */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex-[0.8] min-w-[180px]">
              <Dropdown
                options={connectionOptions}
                value={
                  selectedConnectionId === "all"
                    ? "all"
                    : String(selectedConnectionId)
                }
                onChange={(value) => {
                  setSelectedConnectionId(
                    value === "all" ? "all" : Number(value),
                  );
                }}
                colorScheme="main"
                disabled={isLoadingConnections}
              />
            </div>
            <div className="flex-[0.8] min-w-[180px]">
              <Dropdown
                options={FILE_CATEGORY_OPTIONS}
                value={selectedFileCategory}
                onChange={setSelectedFileCategory}
                colorScheme="main"
              />
            </div>
            <div className="flex-[0.8] min-w-[180px]">
              <Dropdown
                options={RISK_LEVEL_OPTIONS}
                value={selectedRiskLevel}
                onChange={setSelectedRiskLevel}
                colorScheme="main"
              />
            </div>
            <div className="flex-[1.6] min-w-[200px]">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="파일명 검색..."
                colorScheme="main"
              />
            </div>
            <Button
              colorScheme="main"
              appearance="solid"
              onClick={handleSearch}
              className="shrink-0"
            >
              검색
            </Button>
            <Button
              colorScheme="neutral"
              appearance="outline"
              onClick={handleReset}
              className="shrink-0"
            >
              초기화
            </Button>
          </div>

          {/* 파일 목록 테이블 */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden flex flex-col text-sm h-full">
              <div className="flex-1 overflow-y-auto [scrollbar-gutter:auto] min-h-0">
                {/* 테이블 헤더 - sticky */}
                <div className="shrink-0 sticky top-0 z-10">
                  <div
                    className="grid border-b border-[var(--color-text-light-gray)] bg-[var(--color-sidebar-bg)] font-medium text-white shrink-0 text-sm"
                    style={{
                      gridTemplateColumns: "40px 1fr 1fr 2fr 0.7fr 0.7fr",
                    }}
                  >
                    {fileColumns.map((col) => (
                      <div
                        key={col.id}
                        className={cn(
                          "flex min-w-0 items-center overflow-hidden px-4 py-3",
                          col.align === "center"
                            ? "text-center justify-center"
                            : col.align === "right"
                              ? "text-right justify-end"
                              : "text-left justify-start",
                        )}
                      >
                        <span className="w-full min-w-0 truncate">
                          {col.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 테이블 바디 */}
                {isLoadingFiles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="size-6 animate-spin text-[var(--color-main-bg)]" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-[var(--color-text-light-gray)]">
                    파일이 없습니다
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const isSelected = selectedFileIds.has(file.fileId);
                    const isSelectedForPreview = selectedFileId === file.fileId;
                    return (
                      <div
                        key={file.fileId}
                        className={cn(
                          "grid border-b border-[var(--color-content-border)] last:border-b-0 text-[var(--color-text-muted)] text-xs",
                          isSelected && "bg-[var(--color-main-bg)]/15",
                          isSelectedForPreview && "ring-2 ring-[var(--color-main-bg)]",
                          "hover:bg-[var(--color-main-bg)]/10 transition-colors cursor-pointer",
                        )}
                        style={{
                          gridTemplateColumns: "40px 1fr 1fr 2fr 0.7fr 0.7fr",
                          minHeight: "36px",
                        }}
                        onClick={() => handleFileRowClick(file.fileId)}
                      >
                        {fileColumns.map((col) => {
                          const content =
                            col.render?.(file[col.id as keyof FileMaskingFileItem], file) ??
                            (file[col.id as keyof FileMaskingFileItem] as React.ReactNode);
                          return (
                            <div
                              key={col.id}
                              className={cn(
                                "flex min-w-0 items-center overflow-visible px-4 py-3",
                                col.align === "center"
                                  ? "text-center justify-center"
                                  : col.align === "right"
                                    ? "text-right justify-end"
                                    : "text-left justify-start",
                              )}
                            >
                              <div className="w-full min-w-0">{content}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 파일 변환 섹션 */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
            파일 변환
          </h2>
          {!isConverting && maskedFilesArray.length > 0 ? (
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="text-sm text-white whitespace-nowrap">
                암호화 비밀번호:
              </span>
              <div className="w-[320px] min-w-[220px]">
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요 (4~50자)"
                  colorScheme="main"
                />
              </div>
              <Button
                colorScheme="main"
                appearance="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                colorScheme="main"
                appearance="solid"
                onClick={handleSave}
                disabled={
                  !password ||
                  password.length < 4 ||
                  password.length > 50 ||
                  isSaving
                }
              >
                {isSaving ? "저장 중..." : "저장"}
              </Button>
            </div>
          ) : (
            <Button
              colorScheme="main"
              appearance="solid"
              onClick={handleConvert}
              disabled={selectedFileIds.size === 0 || isConverting}
            >
              {isConverting ? "변환 중..." : "변환하기"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 원본 파일 미리보기 */}
          <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden">
            <div className="p-[10px] flex flex-col items-center justify-center min-h-[400px] gap-4 relative">
              {currentOriginalFile ? (
                <>
                  {renderPreview(
                    originalPreview,
                    isLoadingPreview,
                    false,
                  )}
                  {selectedFilesArray.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentOriginalIndex(
                            (prev) =>
                              (prev - 1 + selectedFilesArray.length) %
                              selectedFilesArray.length,
                          )
                        }
                        className="p-1.5 rounded-md bg-[var(--color-content-border)]/50 hover:bg-[var(--color-content-border)] text-white transition-colors"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="text-xs text-[var(--color-text-light-gray)]">
                        {currentOriginalIndex + 1} / {selectedFilesArray.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentOriginalIndex(
                            (prev) => (prev + 1) % selectedFilesArray.length,
                          )
                        }
                        className="p-1.5 rounded-md bg-[var(--color-content-border)]/50 hover:bg-[var(--color-content-border)] text-white transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <FileImage className="size-16 text-[var(--color-text-light-gray)]" />
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    상단에서 파일을 선택하세요
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 마스킹된 파일 미리보기 */}
          <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden">
            <div className="p-[10px] flex flex-col items-center justify-center min-h-[400px] gap-4 relative">
              {isConverting ? (
                <>
                  {showLongLoadingIndicator ? (
                    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden">
                      <style>{`
                        @keyframes fly-straight {
                          0% {
                            transform: translateX(-100%) rotate(30deg);
                            opacity: 0;
                          }
                          50% {
                            transform: translateX(0%) rotate(30deg);
                            opacity: 1;
                          }
                          100% {
                            transform: translateX(120%) rotate(30deg);
                            opacity: 0;
                          }
                        }
                        .flying-plane {
                          animation: fly-straight 2s linear infinite;
                        }
                      `}</style>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plane className="size-16 text-[var(--color-main-bg)] flying-plane" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <div className="size-8 rounded-full border-2 border-[var(--color-main-bg)] border-t-transparent animate-spin" />
                    </div>
                  )}
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    {showLongLoadingIndicator
                      ? "AI 마스킹 처리 중..."
                      : "처리 중..."}
                  </p>
                  <p className="text-xs text-[var(--color-text-light-gray)]/60">
                    {maskedFileIds.size} / {selectedFileIds.size} 파일 변환 완료
                  </p>
                </>
              ) : currentMaskedFileData ? (
                <>
                  {renderPreview(currentMaskedFileData.preview, false, true)}
                  {maskedFilesArray.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMaskedIndex(
                            (prev) =>
                              (prev - 1 + maskedFilesArray.length) %
                              maskedFilesArray.length,
                          )
                        }
                        className="p-1.5 rounded-md bg-[var(--color-content-border)]/50 hover:bg-[var(--color-content-border)] text-white transition-colors"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span className="text-xs text-[var(--color-text-light-gray)]">
                        {currentMaskedIndex + 1} / {maskedFilesArray.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentMaskedIndex(
                            (prev) => (prev + 1) % maskedFilesArray.length,
                          )
                        }
                        className="p-1.5 rounded-md bg-[var(--color-content-border)]/50 hover:bg-[var(--color-content-border)] text-white transition-colors"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Shield className="size-16 text-[var(--color-text-light-gray)]" />
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    변환된 결과가 여기에 표시됩니다
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
