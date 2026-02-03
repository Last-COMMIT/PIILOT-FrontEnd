/** 9-1. 파일 PII 커넥션 한 건 */
export interface FilePiiConnection {
  id: number;
  connectionName: string;
  serverTypeName: string;
}

/** 9-2. 파일 PII 한 건 */
export interface FilePiiFile {
  fileId: number;
  connectionName: string;
  serverTypeName: string;
  fileName: string;
  filePath: string;
  fileCategory: "DOCUMENT" | "PHOTO" | "VIDEO" | "AUDIO";
  fileCategoryName: string;
  masked: boolean;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  lastScannedAt: string;
}

/** 9-2. 파일 목록 응답 stats */
export interface FilePiiFilesStats {
  totalFiles: number;
  highRiskCount: number;
  maskingRate: number;
  totalFileSize: number;
}

/** 9-2. Slice 페이지 content */
export interface FilePiiFilesContent {
  content: FilePiiFile[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 9-2. 파일 목록 응답 result */
export interface FilePiiFilesResult {
  stats: FilePiiFilesStats;
  content: FilePiiFilesContent;
}

/** 9-2. 쿼리 파라미터 */
export interface GetFilePiiFilesParams {
  connectionId?: number;
  category?: "DOCUMENT" | "PHOTO" | "VIDEO" | "AUDIO";
  masked?: boolean;
  riskLevel?: "HIGH" | "MEDIUM" | "LOW";
  keyword?: string;
  page?: number;
  size?: number;
}

// --- 10. 파일 개인정보 이슈 API ---

/** 10-1. 이슈 목록 한 건 (커넥션 그룹 내) */
export interface FilePiiIssueItem {
  issueId: number;
  fileName: string;
  filePath: string;
  totalPiiCount: number;
  piiTypes: string[];
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  userStatus: "ISSUE" | "RUNNING" | "DONE";
  detectedAt: string;
}

/** 10-1. 커넥션별 이슈 그룹 */
export interface FilePiiIssueConnectionGroup {
  connectionId: number;
  connectionName: string;
  serverTypeName: string;
  managerName: string;
  issueCount: number;
  issues: FilePiiIssueItem[];
}

/** 10-1. 이슈 목록 stats */
export interface FilePiiIssuesStats {
  totalIssues: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalPiiCount: number;
}

/** 10-1. 이슈 목록 content (Slice) */
export interface FilePiiIssuesContent {
  content: FilePiiIssueConnectionGroup[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 10-1. 이슈 목록 result */
export interface FilePiiIssuesResult {
  stats: FilePiiIssuesStats;
  content: FilePiiIssuesContent;
}

/** 10-2. PII 유형별 상세 */
export interface FilePiiPiiDetail {
  piiTypeName: string;
  piiTypeCode: string;
  count: number;
}

/** 10-2. 이슈 상세 */
export interface FilePiiIssueDetail {
  issueId: number;
  connectionName: string;
  serverTypeName: string;
  fileName: string;
  filePath: string;
  fileExtension: string;
  fileCategory: string;
  fileCategoryName: string;
  mimeType: string;
  previewAvailable: boolean;
  fileContent: string | null;
  previewMessage: string | null;
  totalPiiCount: number;
  maskedPiiCount: number;
  unmaskedPiiCount: number;
  riskLevel: string;
  userStatus: string;
  issueStatus: string;
  detectedAt: string;
  managerName: string;
  managerEmail: string;
  piiDetails: FilePiiPiiDetail[];
}

/** 10-3. 작업 상태 변경 요청 */
export interface FilePiiIssueStatusRequest {
  userStatus: "ISSUE" | "RUNNING" | "DONE";
}

/** 10-3. 작업 상태 변경 응답 */
export interface FilePiiIssueStatusResult {
  issueId: number;
  userStatus: string;
  updatedAt: string;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
