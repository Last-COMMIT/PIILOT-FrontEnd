/** 서버 유형 ID: 4 FTP, 5 SFTP */
export type FileServerTypeId = 4 | 5;

export type FileConnectionStatus = "CONNECTED" | "DISCONNECTED";

/** 생성 요청 */
export interface CreateFileConnectionRequest {
  serverTypeId: FileServerTypeId;
  connectionName: string;
  host: string;
  port: number;
  defaultPath: string;
  username: string;
  password: string;
  managerName: string;
  managerEmail: string;
  retentionPeriodMonths: number;
}

/** 수정 요청 (password 빈 값이면 기존 유지) */
export interface UpdateFileConnectionRequest {
  serverTypeId: FileServerTypeId;
  connectionName: string;
  host: string;
  port: number;
  defaultPath: string;
  username: string;
  password?: string;
  managerName: string;
  managerEmail: string;
  retentionPeriodMonths: number;
}

/** 생성/수정 응답 공통 항목 */
export interface FileConnectionItem {
  id: number;
  connectionName: string;
  status: FileConnectionStatus;
  createdAt?: string;
}

/** 목록 한 건 (host에 "host:port" 형태로 올 수 있음) */
export interface FileConnectionListItem {
  id: number;
  connectionName: string;
  status: FileConnectionStatus;
  serverTypeName: string;
  host: string;
  totalFiles: number;
  totalFileSize: number;
  createdAt?: string;
}

/** 상세 조회 응답 (비밀번호 미포함) */
export interface FileConnectionDetailItem {
  id: number;
  connectionName: string;
  status: FileConnectionStatus;
  serverTypeName: string;
  host: string;
  port: number;
  defaultPath: string;
  username: string;
  managerName: string;
  managerEmail: string;
  retentionPeriodMonths: number;
  totalFiles: number;
  totalFileSize: number;
}

/** 목록 조회 응답 (Slice 페이지네이션) */
export interface FileConnectionListResponse {
  content: FileConnectionListItem[];
  pageable: { pageNumber: number; pageSize: number };
  first: boolean;
  last: boolean;
  hasNext: boolean;
  numberOfElements: number;
}

/** 통계 조회 응답 */
export interface FileConnectionStatsResponse {
  totalConnections: number;
  activeConnections: number;
  totalFiles: number;
  totalFileSize: number;
}

/** API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  result: T | null;
  timestamp: string;
}
