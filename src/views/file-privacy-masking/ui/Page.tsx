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
} from "lucide-react";
import { Button, Dropdown, Input, PasswordInput } from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";

type RiskLevel = "높음" | "중간" | "낮음";
type FileType = "PNG" | "JPEG";

interface FileItem extends Record<string, unknown> {
  id: string;
  fileServer: string;
  fileName: string;
  filePath: string;
  fileType: FileType;
  riskLevel: RiskLevel;
}

const generateMockFiles = (): FileItem[] => {
  const servers = ["Legacy NAS Share", "Official S3 Bucket", "My NAS Public"];
  const fileTypes: FileType[] = ["PNG", "JPEG"];
  const riskLevels: RiskLevel[] = ["높음", "중간", "낮음"];
  const fileNames = [
    "document_001.png",
    "image_photo.jpg",
    "screenshot_2024.png",
    "profile_picture.jpg",
    "invoice_2024.png",
    "contract_doc.jpg",
    "receipt_001.png",
    "id_card.jpg",
    "license_plate.png",
    "medical_record.jpg",
    "bank_statement.png",
    "tax_form.jpg",
    "passport_scan.png",
    "driver_license.jpg",
    "certificate.png",
    "diploma.jpg",
    "transcript.png",
    "payroll.jpg",
    "insurance_card.png",
    "membership.jpg",
    "voucher.png",
    "ticket.jpg",
    "boarding_pass.png",
    "reservation.jpg",
    "confirmation.png",
  ];
  const paths = [
    "documents/personal",
    "images/photos",
    "screenshots/2024",
    "profiles/users",
    "invoices/business",
    "contracts/legal",
    "receipts/2024",
    "ids/verification",
    "vehicles/plates",
    "medical/records",
    "banking/statements",
    "tax/forms",
    "travel/passports",
    "licenses/drivers",
    "education/certificates",
    "academic/diplomas",
    "school/transcripts",
    "employment/payroll",
    "insurance/cards",
    "memberships/cards",
    "vouchers/coupons",
    "tickets/events",
    "travel/boarding",
    "bookings/reservations",
    "confirmations/orders",
  ];

  return fileNames.map((fileName, index) => ({
    id: `file-${index + 1}`,
    fileServer: servers[index % servers.length],
    fileName,
    filePath: paths[index % paths.length],
    fileType: fileTypes[index % fileTypes.length],
    riskLevel: riskLevels[index % riskLevels.length],
  }));
};

const CONNECTION_OPTIONS = [
  { value: "all", label: "모든 커넥션" },
  { value: "legacy-nas", label: "Legacy NAS Share" },
  { value: "s3", label: "Official S3 Bucket" },
  { value: "nas-public", label: "My NAS Public" },
];

const FILE_TYPE_OPTIONS = [
  { value: "all", label: "PNG / JPEG" },
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
];

const RISK_LEVEL_OPTIONS = [
  { value: "all", label: "위험도 수준" },
  { value: "high", label: "높음" },
  { value: "medium", label: "중간" },
  { value: "low", label: "낮음" },
];

const MAX_SELECTION = 5;

export default function FilePrivacyMaskingPage() {
  const [files] = useState<FileItem[]>(generateMockFiles());
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [password, setPassword] = useState("");
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState(0);
  const [currentMaskedIndex, setCurrentMaskedIndex] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [showLongLoadingIndicator, setShowLongLoadingIndicator] =
    useState(false);
  const [maskedFileIds, setMaskedFileIds] = useState<Set<string>>(new Set());
  const conversionTokenRef = useRef(0);

  useEffect(() => {
    if (!isConverting) {
      setShowLongLoadingIndicator(false);
      return;
    }
    const timer = setTimeout(() => setShowLongLoadingIndicator(true), 1000);
    return () => clearTimeout(timer);
  }, [isConverting]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      if (
        appliedSearchQuery &&
        !file.fileName.toLowerCase().includes(appliedSearchQuery.toLowerCase())
      ) {
        return false;
      }
      if (selectedConnection !== "all") {
        const connectionMap: Record<string, string> = {
          "legacy-nas": "Legacy NAS Share",
          s3: "Official S3 Bucket",
          "nas-public": "My NAS Public",
        };
        if (file.fileServer !== connectionMap[selectedConnection]) {
          return false;
        }
      }
      if (selectedFileType !== "all") {
        const fileTypeMap: Record<string, FileType> = {
          png: "PNG",
          jpeg: "JPEG",
        };
        if (file.fileType !== fileTypeMap[selectedFileType]) {
          return false;
        }
      }
      if (selectedRiskLevel !== "all") {
        const riskMap: Record<string, RiskLevel> = {
          high: "높음",
          medium: "중간",
          low: "낮음",
        };
        if (file.riskLevel !== riskMap[selectedRiskLevel]) {
          return false;
        }
      }
      return true;
    });
  }, [
    files,
    appliedSearchQuery,
    selectedConnection,
    selectedFileType,
    selectedRiskLevel,
  ]);

  const selectedFilesArray = useMemo(() => {
    return Array.from(selectedFileIds)
      .map((id) => files.find((f) => f.id === id))
      .filter((f): f is FileItem => f !== undefined);
  }, [selectedFileIds, files]);

  const maskedFilesArray = useMemo(() => {
    return Array.from(maskedFileIds)
      .map((id) => files.find((f) => f.id === id))
      .filter((f): f is FileItem => f !== undefined);
  }, [maskedFileIds, files]);

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

  const handleFileToggle = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        if (newSet.size < MAX_SELECTION) {
          newSet.add(fileId);
        }
      }
      return newSet;
    });
  };

  const handleConvert = async () => {
    if (selectedFileIds.size === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    const token = ++conversionTokenRef.current;
    setIsConverting(true);
    setMaskedFileIds(new Set());

    // 각 파일을 순차적으로 변환 (시뮬레이션)
    const selectedIdsArray = Array.from(selectedFileIds);
    for (let i = 0; i < selectedIdsArray.length; i++) {
      // 각 파일 변환에 2초씩 소요되는 것으로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (conversionTokenRef.current !== token) return;
      setMaskedFileIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedIdsArray[i]);
        return newSet;
      });
    }

    if (conversionTokenRef.current === token) {
      setIsConverting(false);
    }
  };

  const handleSave = () => {
    if (!password) {
      alert("암호화 비밀번호를 입력해주세요.");
      return;
    }
    // TODO: 저장 API 호출
    alert("저장되었습니다.");
  };

  const handleCancel = () => {
    conversionTokenRef.current += 1;
    setSelectedFileIds(new Set());
    setMaskedFileIds(new Set());
    setCurrentOriginalIndex(0);
    setCurrentMaskedIndex(0);
    setIsConverting(false);
    setPassword("");
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleReset = () => {
    conversionTokenRef.current += 1;
    setSelectedFileIds(new Set());
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnection("all");
    setSelectedFileType("all");
    setSelectedRiskLevel("all");
    setMaskedFileIds(new Set());
    setCurrentOriginalIndex(0);
    setCurrentMaskedIndex(0);
    setIsConverting(false);
    setPassword("");
  };

  const currentOriginalFile = selectedFilesArray[currentOriginalIndex] || null;
  const currentMaskedFile = maskedFilesArray[currentMaskedIndex] || null;

  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case "높음":
        return "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]";
      case "중간":
        return "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]";
      case "낮음":
        return "bg-[var(--color-green-bg)] text-[var(--color-green-text)]";
      default:
        return "";
    }
  };

  const fileColumns: TableColumn<FileItem>[] = [
    {
      id: "checkbox",
      label: "",
      width: "40px",
      align: "center",
      render: (_, row) => {
        const isSelected = selectedFileIds.has(row.id);
        const isDisabled = !isSelected && selectedFileIds.size >= MAX_SELECTION;
        return (
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileToggle(row.id);
              }}
              disabled={isDisabled}
              className={cn(
                "relative size-4 flex items-center justify-center transition-all duration-200 rounded",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-main-bg)]/50 focus-visible:ring-offset-0",
                "border-2 shrink-0",
                isSelected
                  ? "bg-[var(--color-main-bg)] border-[var(--color-main-bg)] shadow-[0_0_0_2px_rgba(34,211,238,0.2)]"
                  : "bg-[var(--color-sidebar-bg)] border-[var(--color-content-border)] hover:border-[var(--color-main-bg)] hover:shadow-[0_0_0_2px_rgba(34,211,238,0.1)]",
                isDisabled && "opacity-50 cursor-not-allowed",
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
      id: "fileServer",
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
      width: "1fr",
      align: "left",
      render: (value) => <span>{value as string}</span>,
    },
    {
      id: "fileType",
      label: "파일 형식",
      width: "1fr",
      align: "left",
      render: (value) => <span>{value as string}</span>,
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "1fr",
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
            {riskLevel}
          </span>
        );
      },
    },
  ];

  return (
    <div className="h-full min-h-0 overflow-hidden flex flex-col p-6 gap-5">
      {/* 파일 선택 섹션 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <h2 className="shrink-0 text-base font-semibold text-white px-1 pb-2">
          파일 선택 ({selectedFileIds.size}/{MAX_SELECTION})
        </h2>
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          {/* 필터 및 검색 */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex-[0.8] min-w-[180px]">
              <Dropdown
                options={CONNECTION_OPTIONS}
                value={selectedConnection}
                onChange={setSelectedConnection}
                colorScheme="main"
              />
            </div>
            <div className="flex-[0.8] min-w-[180px]">
              <Dropdown
                options={FILE_TYPE_OPTIONS}
                value={selectedFileType}
                onChange={setSelectedFileType}
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
              {/* 헤더와 바디가 같은 스크롤 컨테이너를 공유하여 컬럼 정렬이 정확히 맞도록 함 */}
              <div className="flex-1 overflow-y-auto [scrollbar-gutter:auto] min-h-0">
                {/* 테이블 헤더 - sticky */}
                <div className="shrink-0 sticky top-0 z-10">
                  <div
                    className="grid border-b border-[var(--color-text-light-gray)] bg-[var(--color-sidebar-bg)] font-medium text-white shrink-0 text-sm"
                    style={{
                      gridTemplateColumns: "40px 1fr 1fr 2fr 0.7fr 0.7fr",
                    }}
                  >
                    {(() => {
                      const headerCells = [];
                      for (let i = 0; i < fileColumns.length; i++) {
                        const col = fileColumns[i];
                        headerCells.push(
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
                          </div>,
                        );
                      }
                      return headerCells;
                    })()}
                  </div>
                </div>
                {/* 테이블 바디 */}
                {filteredFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);
                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "grid border-b border-[var(--color-content-border)] last:border-b-0 text-[var(--color-text-muted)] text-xs",
                        isSelected && "bg-[var(--color-main-bg)]/15",
                        "hover:bg-[var(--color-main-bg)]/10 transition-colors cursor-pointer",
                      )}
                      style={{
                        gridTemplateColumns: "40px 1fr 1fr 2fr 0.7fr 0.7fr",
                        minHeight: "36px",
                      }}
                      onClick={() => handleFileToggle(file.id)}
                    >
                      {(() => {
                        const bodyCells = [];
                        for (let i = 0; i < fileColumns.length; i++) {
                          const col = fileColumns[i];
                          const content =
                            col.render?.(file[col.id], file) ??
                            (file[col.id] as React.ReactNode);
                          bodyCells.push(
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
                            </div>,
                          );
                        }
                        return bodyCells;
                      })()}
                    </div>
                  );
                })}
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
          <Button
            colorScheme="main"
            appearance="solid"
            onClick={handleConvert}
            disabled={selectedFileIds.size === 0 || isConverting}
          >
            {isConverting ? "변환 중..." : "변환하기"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 원본 이미지 미리보기 */}
          <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4 relative">
              {currentOriginalFile ? (
                <>
                  {/* eslint-disable-next-line */}
                  <Image
                    className="size-20 text-[var(--color-text-light-gray)]"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    원본 이미지 미리보기
                  </p>
                  <p className="text-xs text-[var(--color-text-light-gray)]/60">
                    {currentOriginalFile.fileName}
                  </p>
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

          {/* 마스킹된 이미지 미리보기 */}
          <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-4 relative">
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
              ) : currentMaskedFile ? (
                <>
                  <ImageOff className="size-20 text-[var(--color-text-light-gray)]" />
                  <p className="text-sm text-[var(--color-text-light-gray)]">
                    마스킹된 이미지 미리보기
                  </p>
                  <p className="text-xs text-[var(--color-text-light-gray)]/60">
                    {currentMaskedFile.fileName}
                  </p>
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

        {/* 암호화 비밀번호 입력 */}
        <div className="flex items-center gap-3" style={{ minHeight: "48px" }}>
          {!isConverting && maskedFilesArray.length > 0 ? (
            <>
              <span className="text-sm text-white whitespace-nowrap">
                암호화 비밀번호:
              </span>
              <div className="flex-1">
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  colorScheme="main"
                />
              </div>
              <Button
                colorScheme="main"
                appearance="outline"
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button
                colorScheme="main"
                appearance="solid"
                onClick={handleSave}
                disabled={!password}
              >
                저장
              </Button>
            </>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      </div>
    </div>
  );
}
