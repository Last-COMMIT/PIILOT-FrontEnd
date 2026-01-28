"use client";

import { Filter } from "lucide-react";
import { Input, Dropdown, Button } from "@/shared/ui";

interface Option {
  value: string;
  label: string;
}

interface FilterSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;

  connectionOptions: Option[];
  selectedConnection: string;
  onConnectionChange: (value: string) => void;

  fileTypeOptions: Option[];
  selectedFileType: string;
  onFileTypeChange: (value: string) => void;

  selectedMaskingStatus: string;
  onMaskingStatusChange: (value: string) => void;

  selectedRiskLevel: string;
  onRiskLevelChange: (value: string) => void;
}

const MASKING_STATUS_OPTIONS: Option[] = [
  { value: "all", label: "마스킹 여부" },
  { value: "original", label: "원본" },
  { value: "masked", label: "마스킹됨" },
];

const RISK_LEVEL_OPTIONS: Option[] = [
  { value: "all", label: "위험도 수준" },
  { value: "high", label: "높음" },
  { value: "medium", label: "중간" },
  { value: "low", label: "낮음" },
];

export default function FilterSection({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onReset,
  connectionOptions,
  selectedConnection,
  onConnectionChange,
  fileTypeOptions,
  selectedFileType,
  onFileTypeChange,
  selectedMaskingStatus,
  onMaskingStatusChange,
  selectedRiskLevel,
  onRiskLevelChange,
}: FilterSectionProps) {
  return (
    <div className="rounded-lg border border-[var(--color-content-border)] bg-[var(--color-sidebar-bg)] p-4 shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="size-5 text-white" />
        <h3 className="text-white font-medium">필터 및 검색</h3>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="파일명 또는 경로 검색..."
            colorScheme="main"
            className="flex-1"
          />
          <Button type="button" colorScheme="main" appearance="solid" onClick={onSearch}>
            검색
          </Button>
          <Button type="button" colorScheme="main" appearance="outline" onClick={onReset}>
            초기화
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={connectionOptions}
              value={selectedConnection}
              onChange={onConnectionChange}
              colorScheme="main"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={fileTypeOptions}
              value={selectedFileType}
              onChange={onFileTypeChange}
              colorScheme="main"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={MASKING_STATUS_OPTIONS}
              value={selectedMaskingStatus}
              onChange={onMaskingStatusChange}
              colorScheme="main"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={RISK_LEVEL_OPTIONS}
              value={selectedRiskLevel}
              onChange={onRiskLevelChange}
              colorScheme="main"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

