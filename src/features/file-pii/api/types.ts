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

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
