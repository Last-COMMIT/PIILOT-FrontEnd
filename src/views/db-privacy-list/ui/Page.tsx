"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Table as TableIcon, AlertTriangle, Lock, Database } from "lucide-react";
import {
  StatCard,
  Table,
  LoadingIndicator,
} from "@/shared/ui";
import type { TableColumn } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import FilterSection from "./FilterSection";
import {
  getDbPiiConnections,
  getDbPiiTables,
  getDbPiiColumns,
} from "@/features/db-pii";
import type { DbPiiConnection, DbPiiTable, DbPiiColumn } from "@/features/db-pii";
import { formatScanDateTime } from "../lib/format";

/** API riskLevel → UI 한글 */
const riskLevelToLabel: Record<string, "높음" | "중간" | "낮음"> = {
  HIGH: "높음",
  MEDIUM: "중간",
  LOW: "낮음",
};

/** API encrypted → UI 암호화 라벨 */
function encryptionLabel(encrypted: boolean): "보안필요" | "양호" {
  return encrypted ? "양호" : "보안필요";
}

/** 테이블 행용 (API 컬럼 → UI) */
interface TableRow extends Record<string, unknown> {
  id: string;
  dbConnection: string;
  table: string;
  column: string;
  type: string;
  encryption: "보안필요" | "양호";
  riskLevel: "높음" | "중간" | "낮음";
  scanDateTime: string;
}

function columnToRow(c: DbPiiColumn): TableRow {
  return {
    id: String(c.id),
    dbConnection: c.connectionName,
    table: c.tableName,
    column: c.columnName,
    type: c.piiTypeName,
    encryption: encryptionLabel(c.encrypted),
    riskLevel: riskLevelToLabel[c.riskLevel] ?? "낮음",
    scanDateTime: formatScanDateTime(c.lastScannedAt),
  };
}

/** PII 유형 필터 옵션 (API 코드 ↔ 한글) */
const PII_TYPE_OPTIONS = [
  { value: "all", label: "모든 유형" },
  { value: "NM", label: "이름" },
  { value: "EM", label: "이메일" },
  { value: "PH", label: "전화번호" },
  { value: "RRN", label: "주민등록번호" },
  { value: "ADD", label: "주소" },
  { value: "IP", label: "IP" },
  { value: "ACN", label: "계좌번호" },
  { value: "PP", label: "기타" },
];

const PAGE_SIZE = 20;

export default function DbPrivacyListPage() {
  const [connections, setConnections] = useState<DbPiiConnection[]>([]);
  const [tables, setTables] = useState<DbPiiTable[]>([]);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [stats, setStats] = useState<{
    totalItems: number;
    highRiskItems: number;
    encryptionRate: number;
    totalRecords: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("all");
  const [selectedTable, setSelectedTable] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedEncryption, setSelectedEncryption] = useState("all");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("all");
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const connectionOptions = [
    { value: "all", label: "모든 커넥션" },
    ...connections.map((c) => ({
      value: String(c.id),
      label: `${c.connectionName} (${c.dbmsTypeName})`,
    })),
  ];

  const tableOptions = [
    { value: "all", label: "모든 테이블" },
    ...tables.map((t) => ({ value: String(t.id), label: t.tableName })),
  ];

  const loadConnections = useCallback(async () => {
    const res = await getDbPiiConnections();
    if (res.success && res.result) {
      setConnections(res.result);
      setError(null);
    } else if (!res.success) {
      setError(res.message ?? "커넥션 목록을 불러오지 못했습니다.");
    }
  }, []);

  const loadTables = useCallback(async (connectionId: number) => {
    const res = await getDbPiiTables(connectionId);
    if (res.success && res.result) setTables(res.result);
    else setTables([]);
  }, []);

  const loadColumns = useCallback(
    async (pageNum: number, append: boolean) => {
      const connectionId =
        selectedConnection === "all" ? undefined : Number(selectedConnection);
      const tableId =
        selectedTable === "all" ? undefined : Number(selectedTable);
      const piiType = selectedType === "all" ? undefined : selectedType;
      const encrypted =
        selectedEncryption === "all"
          ? undefined
          : selectedEncryption === "good";
      const riskLevel =
        selectedRiskLevel === "all"
          ? undefined
          : (selectedRiskLevel.toUpperCase() as "HIGH" | "MEDIUM" | "LOW");
      const res = await getDbPiiColumns({
        connectionId,
        tableId,
        piiType,
        encrypted,
        riskLevel,
        keyword: appliedSearchQuery || undefined,
        page: pageNum,
        size: PAGE_SIZE,
      });
      if (!res.success) {
        setError(res.message ?? "컬럼 목록을 불러오지 못했습니다.");
        if (!append) setRows([]);
        setHasNext(false);
        return;
      }
      setError(null);
      if (res.result) {
        const rawContent = res.result.content;
        const contentArray = Array.isArray(rawContent)
          ? rawContent
          : (rawContent as { content?: DbPiiColumn[] } | undefined)?.content;
        const list = Array.isArray(contentArray)
          ? contentArray.map(columnToRow)
          : [];
        if (list.length > 0) {
          if (append) setRows((prev) => [...prev, ...list]);
          else setRows(list);
          setStats(res.result.stats ?? null);
          const slice = rawContent as { hasNext?: boolean } | undefined;
          setHasNext(Boolean(slice?.hasNext));
        } else {
          if (!append) setRows([]);
          setStats(res.result.stats ?? null);
          const slice = rawContent as { hasNext?: boolean } | undefined;
          setHasNext(Boolean(slice?.hasNext));
        }
      } else {
        if (!append) setRows([]);
        setStats(null);
        setHasNext(false);
      }
    },
    [
      selectedConnection,
      selectedTable,
      selectedType,
      selectedEncryption,
      selectedRiskLevel,
      appliedSearchQuery,
    ],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      loadConnections();
    }, 0);
    return () => clearTimeout(id);
  }, [loadConnections]);

  useEffect(() => {
    const id = setTimeout(() => {
      setSelectedTable("all");
      if (selectedConnection === "all") {
        setTables([]);
        return;
      }
      loadTables(Number(selectedConnection));
    }, 0);
    return () => clearTimeout(id);
  }, [selectedConnection, loadTables]);

  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      loadColumns(0, false).finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(id);
  }, [loadColumns]);

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery);
    setPage(0);
  };

  const handleReset = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    setSelectedConnection("all");
    setSelectedTable("all");
    setSelectedType("all");
    setSelectedEncryption("all");
    setSelectedRiskLevel("all");
    setPage(0);
  };

  const loadingRef = useRef(false);
  const hasNextRef = useRef(false);
  const pageRef = useRef(page);
  hasNextRef.current = hasNext;
  pageRef.current = page;

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(() => {
    if (loadingRef.current || !hasNextRef.current) return;
    loadingRef.current = true;
    const nextPage = pageRef.current + 1;
    setPage(nextPage);
    setLoading(true);
    loadColumns(nextPage, true).finally(() => {
      setLoading(false);
      loadingRef.current = false;
      // 로드 후 스크롤 없으면 추가 로드
      requestAnimationFrame(() => {
        const el = scrollContainerRef.current;
        if (el && el.scrollHeight <= el.clientHeight + 10 && hasNextRef.current) {
          loadingRef.current = false;
          // 다음 틱에서 다시 로드
          setTimeout(() => {
            if (!loadingRef.current && hasNextRef.current) {
              handleLoadMore();
            }
          }, 100);
        }
      });
    });
  }, [loadColumns]);

  // 스크롤 이벤트: 하단 200px 이내 도달 시 추가 로드
  const handleBodyScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
        handleLoadMore();
      }
    },
    [handleLoadMore],
  );

  // 최초 데이터 로드 후 스크롤 없으면 추가 로드
  useEffect(() => {
    if (loading || !hasNext || rows.length === 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    const timer = setTimeout(() => {
      if (el.scrollHeight <= el.clientHeight + 10 && hasNextRef.current && !loadingRef.current) {
        handleLoadMore();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [rows.length, loading, hasNext]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalItems = stats?.totalItems ?? 0;
  const highRiskItems = stats?.highRiskItems ?? 0;
  const encryptionRate = stats?.encryptionRate ?? 0;
  const totalRecords = stats?.totalRecords ?? 0;

  const columns: TableColumn<TableRow>[] = [
    { id: "dbConnection", label: "DB 연결", width: "2fr" },
    { id: "table", label: "테이블", width: "1.5fr" },
    { id: "column", label: "컬럼", width: "1.5fr" },
    { id: "type", label: "유형", width: "1.5fr" },
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
    { id: "scanDateTime", label: "스캔일시", width: "1.5fr", align: "left" },
  ];

  if (error && rows.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-white">
        <p className="text-[var(--color-coral-text)]">{error}</p>
      </div>
    );
  }

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
          value={`${typeof encryptionRate === "number" ? encryptionRate.toFixed(1) : encryptionRate}%`}
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
          searchPlaceholder="컬럼명·테이블명 검색"
          connectionOptions={connectionOptions}
          selectedConnection={selectedConnection}
          onConnectionChange={setSelectedConnection}
          tableOptions={tableOptions}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          typeOptions={PII_TYPE_OPTIONS}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedEncryption={selectedEncryption}
          onEncryptionChange={setSelectedEncryption}
          selectedRiskLevel={selectedRiskLevel}
          onRiskLevelChange={setSelectedRiskLevel}
        />

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading && rows.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-white">
              <LoadingIndicator size="lg" aria-label="로딩 중" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/70 text-center px-4">
              {selectedConnection !== "all"
                ? "선택한 연결에 스캔 결과가 없습니다."
                : "스캔된 PII 컬럼이 없습니다."}
              <span className="text-sm">
                DB 연결 관리에서 스캔을 실행한 뒤 다시 조회해 주세요.
              </span>
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={rows}
                scrollable
                maxBodyHeight="100%"
                className="h-full"
                scrollRef={scrollContainerRef}
                onBodyScroll={handleBodyScroll}
                footer={
                  loading && rows.length > 0 ? (
                    <div className="py-3 flex justify-center">
                      <LoadingIndicator size="sm" aria-label="추가 로딩 중" />
                    </div>
                  ) : null
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
