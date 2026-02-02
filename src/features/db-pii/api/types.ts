/** 5-1. DB PII 커넥션 한 건 */
export interface DbPiiConnection {
  id: number;
  connectionName: string;
  dbmsTypeName: string;
}

/** 5-2. DB PII 테이블 한 건 */
export interface DbPiiTable {
  id: number;
  tableName: string;
}

/** 5-3. PII 컬럼 한 건 */
export interface DbPiiColumn {
  id: number;
  connectionName: string;
  dbmsTypeName: string;
  tableName: string;
  columnName: string;
  piiTypeName: string;
  piiTypeCode: string;
  encrypted: boolean;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  lastScannedAt: string;
}

/** 5-3. 컬럼 목록 응답 stats */
export interface DbPiiColumnsStats {
  totalItems: number;
  highRiskItems: number;
  encryptionRate: number;
  totalRecords: number;
}

/** 5-3. Slice 페이지 content */
export interface DbPiiColumnsContent {
  content: DbPiiColumn[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 5-3. 컬럼 목록 응답 result */
export interface DbPiiColumnsResult {
  stats: DbPiiColumnsStats;
  content: DbPiiColumnsContent;
}

/** 5-3. 쿼리 파라미터 */
export interface GetDbPiiColumnsParams {
  connectionId?: number;
  tableId?: number;
  piiType?: string;
  encrypted?: boolean;
  riskLevel?: "HIGH" | "MEDIUM" | "LOW";
  keyword?: string;
  page?: number;
  size?: number;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
