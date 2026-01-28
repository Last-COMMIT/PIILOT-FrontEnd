"use client";

import { Filter } from "lucide-react";
import { Input, Dropdown, Button } from "@/shared/ui";

interface FilterSectionProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  selectedConnection: string;
  onConnectionChange: (value: string) => void;
  selectedTable: string;
  onTableChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedEncryption: string;
  onEncryptionChange: (value: string) => void;
  selectedRiskLevel: string;
  onRiskLevelChange: (value: string) => void;
}

const CONNECTION_OPTIONS = [
  { value: "all", label: "모든 커넥션" },
  { value: "postgresql", label: "운영 DB (PostgreSQL)" },
  { value: "oracle", label: "레거시 시스템 (Oracle)" },
  { value: "mysql", label: "고객 DB (MySQL)" },
];

const TABLE_OPTIONS = [
  { value: "all", label: "모든 테이블" },
  { value: "users", label: "users" },
  { value: "payments", label: "payments" },
  { value: "customer_backup", label: "customer_backup" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "모든 유형" },
  { value: "이름", label: "이름" },
  { value: "전화번호", label: "전화번호" },
  { value: "주민등록번호", label: "주민등록번호" },
];

const ENCRYPTION_OPTIONS = [
  { value: "all", label: "암호화 여부" },
  { value: "secure", label: "보안필요" },
  { value: "good", label: "양호" },
];

const RISK_LEVEL_OPTIONS = [
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
  selectedConnection,
  onConnectionChange,
  selectedTable,
  onTableChange,
  selectedType,
  onTypeChange,
  selectedEncryption,
  onEncryptionChange,
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
          <Button
            type="button"
            colorScheme="main"
            appearance="solid"
            onClick={onSearch}
          >
            검색
          </Button>
          <Button
            type="button"
            colorScheme="main"
            appearance="outline"
            onClick={onReset}
          >
            초기화
          </Button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={CONNECTION_OPTIONS}
              value={selectedConnection}
              onChange={onConnectionChange}
              colorScheme="main"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={TABLE_OPTIONS}
              value={selectedTable}
              onChange={onTableChange}
              colorScheme="main"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={TYPE_OPTIONS}
              value={selectedType}
              onChange={onTypeChange}
              colorScheme="main"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <Dropdown
              options={ENCRYPTION_OPTIONS}
              value={selectedEncryption}
              onChange={onEncryptionChange}
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
