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

// --- 6. DB 개인정보 이슈 API ---

/** 6-1. 이슈 목록 한 건 (테이블 그룹 내) */
export interface DbPiiIssueItem {
  issueId: number;
  columnName: string;
  piiTypeName: string;
  piiTypeCode: string;
  totalRecordsCount: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  userStatus: "ISSUE" | "RUNNING" | "DONE";
  detectedAt: string;
}

/** 6-1. 테이블별 이슈 그룹 */
export interface DbPiiIssueTableGroup {
  tableId: number;
  tableName: string;
  connectionName: string;
  dbmsTypeName: string;
  issueCount: number;
  issues: DbPiiIssueItem[];
}

/** 6-1. 이슈 목록 stats */
export interface DbPiiIssuesStats {
  totalIssues: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRecords: number;
}

/** 6-1. 이슈 목록 content (Slice) */
export interface DbPiiIssuesContent {
  content: DbPiiIssueTableGroup[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 6-1. 이슈 목록 result */
export interface DbPiiIssuesResult {
  stats: DbPiiIssuesStats;
  content: DbPiiIssuesContent;
}

/** 6-2. 이슈 상세 (비암호화 데이터 포함) */
export interface DbPiiUnencryptedRecord {
  primaryKey: string;
  value: string;
}

export interface DbPiiIssueDetail {
  issueId: number;
  connectionName: string;
  dbmsTypeName: string;
  tableName: string;
  columnName: string;
  piiTypeName: string;
  piiTypeCode: string;
  totalRecordsCount: number;
  encRecordsCount: number;
  unencryptedCount: number;
  riskLevel: string;
  userStatus: string;
  issueStatus: string;
  detectedAt: string;
  managerName: string;
  managerEmail: string;
  unencryptedRecords: DbPiiUnencryptedRecord[];
}

/** 6-3. 작업 상태 변경 요청 */
export interface DbPiiIssueStatusRequest {
  userStatus: "ISSUE" | "RUNNING" | "DONE";
}

/** 6-3. 작업 상태 변경 응답 */
export interface DbPiiIssueStatusResult {
  issueId: number;
  userStatus: string;
  updatedAt: string;
}
