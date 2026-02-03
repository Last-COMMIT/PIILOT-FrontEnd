import type { ApiResponse } from "@/shared/api";

/** 파일 카테고리 */
export type FileCategory = "DOCUMENT" | "PHOTO" | "AUDIO" | "VIDEO";

/** 위험도 */
export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

/** 파일 마스킹 커넥션 목록 항목 */
export interface FileMaskingConnection {
  connectionId: number;
  connectionName: string;
}

/** 파일 마스킹 파일 목록 항목 */
export interface FileMaskingFileItem {
  fileId: number;
  connectionId: number;
  connectionName: string;
  fileName: string;
  filePath: string;
  fileCategory: FileCategory;
  extension: string;
  riskLevel: RiskLevel;
}

/** 파일 미리보기 응답 */
export interface FilePreviewResponse {
  fileId: number;
  fileName: string;
  fileCategory: FileCategory;
  mimeType: string;
  fileSize: number;
  previewAvailable: boolean;
  content: string | null;
  previewMessage: string | null;
}

/** 파일 마스킹 변환 응답 */
export interface FileMaskingResponse {
  fileId: number;
  originalFileName: string;
  maskedFileName: string;
  fileCategory: FileCategory;
  mimeType: string;
  previewAvailable: boolean;
  maskedContent: string | null;
  previewMessage: string | null;
}

/** 마스킹 결과 저장 요청 */
export interface SaveMaskingRequest {
  encryptionPassword: string;
}

/** 마스킹 결과 저장 응답 */
export interface SaveMaskingResponse {
  fileId: number;
  originalZipPath: string;
  maskedFilePath: string;
  message: string;
}

/** 파일 마스킹 커넥션 목록 API 응답 */
export type FileMaskingConnectionsResponse = ApiResponse<
  FileMaskingConnection[]
>;

/** 파일 마스킹 파일 목록 API 응답 */
export type FileMaskingFilesResponse = ApiResponse<FileMaskingFileItem[]>;

/** 파일 미리보기 API 응답 */
export type FilePreviewApiResponse = ApiResponse<FilePreviewResponse>;

/** 파일 마스킹 변환 API 응답 */
export type FileMaskingApiResponse = ApiResponse<FileMaskingResponse>;

/** 마스킹 결과 저장 API 응답 */
export type SaveMaskingApiResponse = ApiResponse<SaveMaskingResponse>;
