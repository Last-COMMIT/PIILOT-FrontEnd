// --- 11. 대시보드 API ---

/** 11-1. 대시보드 통계 */
export interface DashboardStats {
  totalConnections: number;
  dbConnectionCount: number;
  fileConnectionCount: number;
  piiColumnCount: number;
  columnEncryptionRate: number;
  piiFileCount: number;
  fileEncryptionRate: number;
  totalIssueCount: number;
  dbIssueCount: number;
  fileIssueCount: number;
}

/** 11-1. 개인정보 유형별 분포 */
export interface PiiDistribution {
  piiType: string;
  piiTypeName: string;
  count: number;
  percentage: number;
}

/** 11-1. 최근 DB 이슈 */
export interface RecentDbIssue {
  issueId: number;
  detectedAt: string;
  tableName: string;
  columnName: string;
  connectionName: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  piiCount: number;
  piiTypes: string[];
}

/** 11-1. 최근 파일 이슈 */
export interface RecentFileIssue {
  issueId: number;
  detectedAt: string;
  fileName: string;
  connectionName: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  piiCount: number;
  piiTypes: string[];
}

/** 11-1. 대시보드 요약 결과 */
export interface DashboardSummary {
  stats: DashboardStats;
  piiDistribution: PiiDistribution[];
  recentDbIssues: RecentDbIssue[];
  recentFileIssues: RecentFileIssue[];
}

/** 11-2. 추세 아이템 */
export interface TrendItem {
  yearMonth: string;
  issueCount: number;
}

/** 11-2. 대시보드 추세 결과 */
export interface DashboardTrends {
  dbTrend: TrendItem[];
  fileTrend: TrendItem[];
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
