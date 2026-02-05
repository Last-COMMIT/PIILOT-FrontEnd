/** DBMS 유형 ID: 1 MySQL, 2 PostgreSQL, 3 Oracle */
export type DbmsTypeId = 1 | 2 | 3;

export type DbConnectionStatus = "CONNECTED" | "DISCONNECTED";

/** 생성 요청 */
export interface CreateDbConnectionRequest {
  dbmsTypeId: DbmsTypeId;
  connectionName: string;
  host: string;
  port: number;
  dbName: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
}

/** 수정 요청 (password 빈 값이면 기존 유지) */
export interface UpdateDbConnectionRequest {
  dbmsTypeId: DbmsTypeId;
  connectionName: string;
  host: string;
  port: number;
  dbName: string;
  username: string;
  password?: string;
  managerName: string;
  managerEmail: string;
}

/** 생성/수정 응답 공통 항목 */
export interface DbConnectionItem {
  id: number;
  connectionName: string;
  dbmsTypeName?: string;
  status: DbConnectionStatus;
  host: string;
  port?: number;
  dbName: string;
  username?: string;
  managerName?: string;
  managerEmail?: string;
  createdAt?: string;
}

/** 목록 한 건 (host에 "host:port" 형태로 올 수 있음) */
export interface DbConnectionListItem {
  id: number;
  connectionName: string;
  dbmsTypeName: string;
  status: DbConnectionStatus;
  host: string;
  dbName: string;
  totalTables: number;
  totalColumns: number;
  isScanning: boolean;
}

/** 상세 조회 응답 */
export interface DbConnectionDetailItem extends DbConnectionItem {
  totalTables: number;
  totalColumns: number;
}

/** 목록 조회 응답 (Slice 페이지네이션) */
export interface DbConnectionListResponse {
  content: DbConnectionListItem[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 통계 조회 응답 */
export interface DbConnectionStatsResponse {
  totalConnections: number;
  activeConnections: number;
  totalTables: number;
  totalColumns: number;
}

/** 3-1. DB 수동 스캔 응답 */
export interface DbConnectionScanResult {
  scanHistoryId: number;
  connectionId: number;
  status: "COMPLETED" | "IN_PROGRESS";
  scanStartTime: string;
  scanEndTime: string;
  totalTablesCount: number;
  totalColumnsCount: number;
  scannedColumnsCount: number;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
