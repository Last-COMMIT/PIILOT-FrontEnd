"use client";

import { useState, useMemo } from "react";
import { Table as TableIcon, AlertTriangle, Lock, Database } from "lucide-react";
import {
  StatCard,
  Table,
} from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import FilterSection from "./FilterSection";

interface PrivacyItem extends Record<string, unknown> {
  id: string;
  dbConnection: string;
  table: string;
  column: string;
  type: string;
  encryption: "보안필요" | "양호";
  riskLevel: "높음" | "중간" | "낮음";
  scanDateTime: string;
}


const generatePrivacyItems = (): PrivacyItem[] => {
  const items: PrivacyItem[] = [];
  const connections = [
    "운영 DB (PostgreSQL)",
    "레거시 시스템 (Oracle)",
    "고객 DB (MySQL)",
  ];
  const tables = ["users", "payments", "customer_backup"];
  const columns = [
    "full_name",
    "phone_number",
    "ssn",
    "mobile",
    "email",
    "address",
  ];
  const types = ["이름", "전화번호", "주민등록번호", "이메일", "주소"];
  const encryptions: Array<"보안필요" | "양호"> = ["보안필요", "양호"];
  const riskLevels: Array<"높음" | "중간" | "낮음"> = ["높음", "중간", "낮음"];

  for (let i = 1; i <= 200; i++) {
    items.push({
      id: i.toString(),
      dbConnection: connections[(i - 1) % connections.length],
      table: tables[(i - 1) % tables.length],
      column: columns[(i - 1) % columns.length],
      type: types[(i - 1) % types.length],
      encryption: encryptions[(i - 1) % encryptions.length],
      riskLevel: riskLevels[(i - 1) % riskLevels.length],
      scanDateTime: `01/${18 + (i % 2)} ${String(10 + (i % 12)).padStart(2, "0")}:${String((i * 10) % 60).padStart(2, "0")}`,
    });
  }
  return items;
};

export default function DbPrivacyListPage() {
  const [privacyItems] = useState<PrivacyItem[]>(generatePrivacyItems());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [selectedTable, setSelectedTable] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEncryption, setSelectedEncryption] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");

  const connectionOptions = useMemo(() => {
    const unique = Array.from(
      new Set(privacyItems.map((i) => i.dbConnection).filter(Boolean)),
    );
    return [
      { value: "all", label: "모든 커넥션" },
      ...unique.map((v) => ({ value: v, label: v })),
    ];
  }, [privacyItems]);

  const tableOptions = useMemo(() => {
    const unique = Array.from(
      new Set(privacyItems.map((i) => i.table).filter(Boolean)),
    );
    return [
      { value: "all", label: "모든 테이블" },
      ...unique.map((v) => ({ value: v, label: v })),
    ];
  }, [privacyItems]);

  const typeOptions = useMemo(() => {
    const unique = Array.from(
      new Set(privacyItems.map((i) => i.type).filter(Boolean)),
    );
    return [
      { value: "all", label: "모든 유형" },
      ...unique.map((v) => ({ value: v, label: v })),
    ];
  }, [privacyItems]);

  const filteredItems = useMemo(() => {
    return privacyItems.filter((item) => {
      if (appliedSearchQuery) {
        const query = appliedSearchQuery.toLowerCase();
        if (
          !item.table.toLowerCase().includes(query) &&
          !item.column.toLowerCase().includes(query) &&
          !item.dbConnection.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (selectedConnection !== "all" && item.dbConnection !== selectedConnection) {
        return false;
      }
      if (selectedTable !== "all" && item.table !== selectedTable) {
        return false;
      }
      if (selectedType !== "all" && item.type !== selectedType) {
        return false;
      }
      if (selectedEncryption === "secure" && item.encryption !== "보안필요") {
        return false;
      }
      if (selectedEncryption === "good" && item.encryption !== "양호") {
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
    privacyItems,
    appliedSearchQuery,
    selectedConnection,
    selectedTable,
    selectedType,
    selectedEncryption,
    selectedRiskLevel,
  ]);

  const totalItems = filteredItems.length;
  const highRiskItems = filteredItems.filter((item) => item.riskLevel === "높음")
    .length;
  const encryptedItems = filteredItems.filter(
    (item) => item.encryption === "양호",
  ).length;
  const encryptionRate =
    totalItems === 0 ? 0 : Math.round((encryptedItems / totalItems) * 100);
  const totalRecords = 626500;


  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
  };

  const handleReset = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnection("all");
    setSelectedTable("all");
    setSelectedType("all");
    setSelectedEncryption("all");
    setSelectedRiskLevel("all");
  };

  const columns: TableColumn<PrivacyItem>[] = [
    {
      id: "dbConnection",
      label: "DB 연결",
      width: "2fr",
    },
    {
      id: "table",
      label: "테이블",
      width: "1.5fr",
    },
    {
      id: "column",
      label: "컬럼",
      width: "1.5fr",
    },
    {
      id: "type",
      label: "유형",
      width: "1.5fr",
    },
    {
      id: "encryption",
      label: "암호화",
      width: "1fr",
      render: (value) => {
        const encryption = value as "보안필요" | "양호";
        const isSecure = encryption === "보안필요";
        return (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              isSecure
                ? "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]"
                : "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
            )}
          >
            {encryption}
          </span>
        );
      },
    },
    {
      id: "riskLevel",
      label: "위험도",
      width: "1fr",
      render: (value) => {
        const riskLevel = value as "높음" | "중간" | "낮음";
        const riskColors = {
          높음: "bg-[var(--color-coral-bg)] text-[var(--color-coral-text)]",
          중간: "bg-[var(--color-yellow-bg)] text-[var(--color-yellow-text)]",
          낮음: "bg-[var(--color-green-bg)] text-[var(--color-green-text)]",
        };
        return (
          <span
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium",
              riskColors[riskLevel],
            )}
          >
            {riskLevel}
          </span>
        );
      },
    },
    {
      id: "scanDateTime",
      label: "스캔일시",
      width: "1.5fr",
      align: "left",
    },
  ];

  return (
    <div className="h-full flex flex-col p-6 gap-5 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        <StatCard
          title="총 항목"
          value={totalItems.toString()}
          icon={<TableIcon className="size-5" />}
          colorScheme="mint"
        />
        <StatCard
          title="고위험 항목"
          value={highRiskItems.toString()}
          icon={<AlertTriangle className="size-5" />}
          colorScheme="coral"
        />
        <StatCard
          title="암호화율"
          value={`${encryptionRate}%`}
          icon={<Lock className="size-5" />}
          colorScheme="purple"
        />
        <StatCard
          title="총 레코드 수"
          value={totalRecords.toLocaleString()}
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
          tableOptions={tableOptions}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          typeOptions={typeOptions}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedEncryption={selectedEncryption}
          onEncryptionChange={setSelectedEncryption}
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
